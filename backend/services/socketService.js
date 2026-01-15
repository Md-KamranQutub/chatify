import {Server} from 'socket.io';
import User from '../models/User.js';
import Message from '../models/Message.js';
import socketMiddleware from '../middleware/socketMiddleware.js';

//Map for Online User userId -> socketId
const onlineUsers = new Map();

//Map for Typing Users userId->[conversation]:boolean
const typingUsers = new Map();

const initializeSocket = (server) =>
{
   const io = new Server(server,{
    cors:{
        origin: process.env.FRONTEND_URL,
        credentials: true,
        methods: ["GET", "POST","PUT",'DELETE',"OPTIONS"]
    },
    pingTimeOut: 60000,
   })

   //middleware
   io.use(socketMiddleware);
   
   io.on("connection", (socket) => {
    console.log("User connected with socket ID:", socket.id);

    let userId = null;

   //handle user connection and mark them online

   socket.on("user_connected", async (connectingUserId) => {
       try
       {
         userId = connectingUserId;
         onlineUsers.set(userId, socket.id);
         socket.join(userId); // Join a room with the user's ID

            //Update user isOnline status in DB
            await User.findByIdAndUpdate(userId, { isOnline: true , lastSeen: new Date() });

            //Notify all users that this user is online
            io.emit("user_status", { userId, isOnline: true });
       }catch(error)
       {
        console.error("Error in user_connected event:", error);
       }
   });

   socket.on("get_user_status", (requestedUserId ) => {
       const isOnline = onlineUsers.has(requestedUserId);
    //    callback({ userId: requestedUserId, isOnline , lastSeen: isOnline ? new Date() : null });
   });
   
   socket.on("send_message", async (message) => {
    try
   {
        const receiverSocketId = onlineUsers.get(message.receiverId);
       if(receiverSocketId) 
         {
              io.to(receiverSocketId).emit("receive_message", message);
         }
   }catch(error)
   {
       console.error("Error in send_message event:", error);
       socket.emit("message_error", { error: "Failed to send message" });
   }
   });
   
   //update message as read and notify sender

   socket.on("message_read", async (messageIds, userId) => {
       try {
           // Update the message status in the database
           await Message.updateMany({ _id: { $in: messageIds } }, { isRead: true });

           // Notify the sender that the message has been read
           const senderSocketId = onlineUsers.get(userId);
           if (senderSocketId) {
              messageIds.forEach((messageId) => {
                    io.to(senderSocketId).emit("message_status_update", { messageId , messageStatus : 'read' });
              });
           }
       } catch (error) {
           console.error("Error in message_read event:", error);
       }
   });
    
   socket.on("typing_start" , (conversationId , receiverId) => {
    if(!userId || !conversationId || !receiverId) return;
     const userTyping = typingUsers.get(userId);
     userTyping[conversationId] = true;

     //clear any exisiting timeout 
     if(userTyping[`${conversationId}_timeout`])
     {
        clearTimeout (userTyping[`${conversationId}_timeout`]);
     }

     //autostop after 3s
        userTyping[`${conversationId}_timeout`] = setTimeout(() => {
            userTyping[conversationId] = false;
            socket.to(receiverId).emit("user_typing", { conversationId , userId , isTyping : false });
        },3000);

        //Notify receiver that user is typing
        socket.to(receiverId).emit("user_typing", { conversationId , userId , isTyping : true });
   })
  

   socket.on("typing_stop" , (conversationId , receiverId) => {
    if(!userId || !conversationId || !receiverId) return;
     const userTyping = typingUsers.get(userId);
     userTyping[conversationId] = false;

     //clear any exisiting timeout 
     if(userTyping[`${conversationId}_timeout`])
     {
        clearTimeout (userTyping[`${conversationId}_timeout`]);
        delete userTyping[`${conversationId}_timeout`];
     }

     socket.to(receiverId).emit("user_typing", { conversationId , userId , isTyping : false });
    });

    socket.on("add_reactions", async( {messageId, emoji, userId} ) =>{
         try{
            const message = await Message.findById(messageId);
            console.log("inside add reaction");
            if(!message)
            {
                return;
            }
            const existingIndex = message.reactions.findIndex((r)=> r.user.toString() === userId);
            if( existingIndex > -1 )
            {
                if(message.reactions[existingIndex].emoji === emoji)
                {
                    //remove reaction
                    message.reactions.splice(existingIndex, 1);
                }
                else
                {
                    //update reaction
                    message.reactions[existingIndex].emoji = emoji;
                }
            }
            else
            {
                //add new reaction
                message.reactions.push({ user: userId , emoji });
            }
            await message.save();

            const populatedMessage = await Message.findById(message?._id)
            .populate("sender", "username profilePicture")
            .populate("receiver" , "username profilePicture")
            .populate("reactions.user", "username");

            const reactionUpdated = {
                messageId,
                reactions: populatedMessage.reactions
            }

            //Notify sender and receiver about reaction update
            const senderSocketId = onlineUsers.get(populatedMessage.sender.toString());
            const receiverSocketId = onlineUsers.get(populatedMessage.receiver.toString());

            if (senderSocketId) {
                io.to(senderSocketId).emit("reaction_update", reactionUpdated);
            }
            if (receiverSocketId) {
                io.to(receiverSocketId).emit("reaction_update", reactionUpdated);
            }
         }catch(error)
         {
            console.error("Error in add_reactions event:", error);
         }
    })
    // handle disconnection and mark user offline
    const handleDisconnected = async() => {
        if(!userId)
            return;
        if(typingUsers.has(userId))
        {
            const userTyping = typingUsers.get(userId);
            Object.keys(userTyping).forEach((key) => {
                if(key.endsWith("_timeout"))
                {
                    clearTimeout(userTyping[key]);
                }
            });
            typingUsers.delete(userId);
        }
        await User.updateOne({ _id: userId }, { isOnline: false , lastSeen : new Date() });
        socket.leave(userId);
        console.log("User disconnected with socket ID:", socket.id);
    }
    //disconnet event
    socket.on("disconnect" , handleDisconnected)
});
 
io.socketUserMap = onlineUsers;
return io;
};
export default initializeSocket;