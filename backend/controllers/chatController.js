import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import Conversation from "../models/Conversation.js";
import Message from "../models/Message.js";
import response from "../utils/responseHandler.js";

const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, content, messageStatus } = req.body;
    const file = req.file;
    const participants = [receiverId, senderId].sort();
    let conversation = await Conversation.findOne({ participants });
    if (!conversation) conversation = new Conversation({ participants });
    await conversation.save();
    let imageOrVideoUrl = null;
    let contentType = null;
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile?.secure_url)
        return response(res, 400, "Cloudinary File upload failed");
      imageOrVideoUrl = uploadFile?.secure_url;
      if (file.mimetype.startsWith("image")) contentType = "image";
      else if (file.mimetype.startsWith("video")) contentType = "video";
      else return response(res, 400, "Unsupported file type");
    } else if (content.trim() !== "") {
      contentType = "text";
    } else {
      return response(res, 400, "Message content or file is required");
    }
    const message = new Message({
      conversation: conversation._id,
      sender: senderId,
      receiver: receiverId,
      content,
      imageOrVideoUrl,
      contentType,
      messageStatus,
      timestamp: new Date(),
    });
    await message.save();
    if (message?.content) {
      conversation.lastMessage = message._id;
    }
    conversation.unreadCount += 1;
    await conversation.save();

    const populatedMessage = await Message.findOne({ _id: message._id })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture");

      //sending socket event to receiver if online
      if(req.io && req.socketUserMap){
        const receiverSocketId = req.socketUserMap.get(receiverId);
        if(receiverSocketId){
          req.io.to(receiverSocketId).emit("new_message", populatedMessage);
        }
      }

    return response(res, 200, "Message sent successfully", populatedMessage);
  } catch (error) {
    console.error("Error sending message:", error);
    return response(res, 500, "Internal Server Error", error);
  }
};

const getAllConversation = async (req, res) => {
  const userId = req.user.id;
  let conversation = await Conversation.find({ participants: userId })
    .populate("participants", "username profilePicture isOnline lastSeen")
    .populate({
      path: "lastMessage",
      populate: {
        path: "sender receiver",
        select: "username profilePicture",
      },
    });
  return response(res, 200, "Conversations fetched successfully", conversation);
};
const getMessages = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.user.id;
  try {
    const conversation = await Conversation.findById(conversationId);
    if (!conversation || !conversation.participants.includes(userId)) {
      return response(res, 403, "Forbidden");
    }
    const messages = await Message.find({ conversation: conversationId })
      .populate("sender", "username profilePicture")
      .populate("receiver", "username profilePicture")
      .sort({ createdAt: 1 });

    await Message.updateMany(
      {
        conversation: conversationId,
        receiver: userId,
        messageStatus: { $ne: "read" },
      },
      { $set: { messageStatus: "read" } }
    );
    conversation.unreadCount = 0;
    await conversation.save();
    return response(res, 200, "Messages fetched successfully", messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return response(res, 500, "Internal Server Error");
  }
};

const deleteMessage = async(req , res) => {
    const messageId = req.params.messageId;
    const userId = req.user.id;
    try{
        const message = await Message.findById(messageId);
        console.log("conversationId" , message.conversation);
        const conversationId = message.conversation;
       if(!message) {
            return response(res, 404, "Message not found");
        }
        if(message.sender.toString() !== userId)
        {
            return response(res, 403, "Forbidden: You can only delete your own messages");
        }
        await message.deleteOne();
        const secondLastMessage = await Message.find({conversation:conversationId}).sort({createdAt:-1}).limit(1);
        console.log("Second Last Message" , secondLastMessage);
        await Conversation.findOneAndUpdate({_id : conversationId },{$set : {lastMessage : secondLastMessage[0]?._id}});

        // sending socket event to receiver if online

        if(req.io && req.socketUserMap){
          const receiverSocketId = req.socketUserMap.get(message.receiver.toString());
          if(receiverSocketId){
            req.io.to(receiverSocketId).emit("message_deleted", { messageId: message._id });
          }
        }
        return response(res, 200, "Message deleted successfully");
    }catch(error){
        console.error("Error in deleteMessage controller:", error);
        return response(res, 500, "Internal Server Error");
    }
  }

const markAsRead = async(req, res) => {
    const {messageIds} = req.body; // Array of message IDs to be marked as read
    const userId = req.user.id;
    try {
     let messages = await Message.find({ _id: { $in: messageIds }, receiver: userId });
     await Message.updateMany(
       { _id: { $in: messageIds }, receiver: userId },
       { $set: { messageStatus: "read" } }
     );

     //sending socket event to sender if online
     if(req.io && req.socketUserMap){
       messages.forEach(message => {
         const senderSocketId = req.socketUserMap.get(message.sender.toString());
         if(senderSocketId){
           const updatedMessage = {
            _id: message._id,
            messageStatus: "read"
           }
           req.io.to(senderSocketId).emit("message_read", updatedMessage);
         }
       });
     }
     return response(res, 200, "Messages marked as read", messages);
    } catch (error) {
      console.error("Error marking messages as read:", error);
      return response(res, 500, "Internal Server Error");
    }
  }


export default { sendMessage, getAllConversation, getMessages , deleteMessage , markAsRead };
