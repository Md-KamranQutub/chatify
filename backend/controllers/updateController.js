import { uploadFileToCloudinary } from "../config/cloudinaryConfig.js";
import Update from "../models/Update.js";
import response from "../utils/responseHandler.js";


const createUpdate = async (req, res) => {
  try {
    const { content, contentType } = req.body;
    const userId = req.user.id;
    const file = req.file;
    let mediaUrl = null;
    let finalContentType = contentType || "text";
    if (file) {
      const uploadFile = await uploadFileToCloudinary(file);
      if (!uploadFile?.secure_url)
        return response(res, 400, "Cloudinary File upload failed");
      mediaUrl = uploadFile?.secure_url;
      if (contentType.toString() === "image") finalContentType = "image";
      else if (file.mimetype.startsWith("video")) finalContentType = "video";
      else {
        return response(res, 400, "Message content or file is required");
      }
    }
    let expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours from now
    const update = new Update({
      user: userId,
      content: mediaUrl || content,
      contentType: finalContentType,
      expiresAt
    });
    await update.save();

    const populatedUpdate = await Update.findOne({ _id: update._id })
      .populate("user", "username profilePicture")
      .populate("viewers" , "username profilePicture");

      if(req.io && req.socketUserMap){
        for(const [connectedUserid , connectedSocketId] of req.socketUserMap){
          if(connectedUserid !== userId){
            req.io.to(connectedSocketId).emit("new_update", populatedUpdate);
          }
        }
      }

    return response(res, 200, "Update created successfully", populatedUpdate);
  } catch (error) {
    console.error("Error sending message:", error);
    return response(res, 500, "Internal Server Error", error);
  }
};

const getUpdates = async (req, res) => {
  try{
  const updates = await Update.find({expirestAt:{$gt:new Date()}})
  .populate("user", "username profilePicture")
  .populate("viewers", "username profilePicture")
  .sort({ createdAt: -1 });
  return response(res, 200, "Updates fetched successfully", updates);
  }catch(error){
    return response(res,500,"Internal Server Error");
  }
};

const viewUpdates = async (req, res) => {
    const {updateId} = req.params;
    const userId = req.user.id;
    console.log("user id" , userId);
    try {
        const update = await Update.findById(updateId);
        if (!update) {
            return response(res, 404, "Update not found");
        }
        if(update.viewers.includes(userId)) {
            return response(res, 200, "Update already viewed", update);
        }
        update.viewers.push(userId);
        await update.save();
        console.log("req.io:" , req.io ," req.socketUserMap" , req.socketUserMap);
        if(req.io && req.socketUserMap){
          console.log("user of update",update.user);
          const updateOwnerSocketId = req.socketUserMap.get(update.user.toString());
          if(updateOwnerSocketId){
              const viewData = {
              updateId: update._id,
              viewerId: userId,
              totalViewers: update.viewers.length,
              viewers: update.viewers
            }
            req.io.to(updateOwnerSocketId).emit("update_viewed", viewData);
          }
          console.log("updateOwnerSocketId",updateOwnerSocketId);
        }
        return response(res, 200, "Update viewed successfully", update);
    } catch (error) {
        console.error("Error viewing update:", error);
        return response(res, 500, "Internal Server Error");
    }
}
const deleteUpdate = async(req , res) => {
    const {updateId} = req.params;
    const userId = req.user.id;
    try{
        const update = await Update.findById(updateId);
        if(!update)
        {
            return response(res, 404, "Update not found");
        }
        if(update.user.toString() !== userId)
        {
            return response(res, 403, "Forbidden: You can only delete your own updates");
        }
        await update.deleteOne();

        if(req.io && req.socketUserMap){
          for(const [connectedUserid , connectedSocketId] of req.socketUserMap){
            if(connectedUserid !== userId){
              req.io.to(connectedSocketId).emit("update_deleted", updateId);
            }
          }
        }

        return response(res, 200, "Update deleted successfully");
    }catch(error){
        console.error("Error in deleteUpdate controller:", error);
        return response(res, 500, "Internal Server Error");
    }
  }


export default { createUpdate, getUpdates, viewUpdates, deleteUpdate };
