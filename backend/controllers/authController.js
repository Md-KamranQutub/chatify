import User from '../models/User.js';
import { generateOtp } from '../utils/generateOtp.js';
import response from '../utils/responseHandler.js';
import { sendOtpToEmail } from '../services/emailService.js';
import twilioService from '../services/twilioService.js';
import generateToken from '../utils/generateToken.js';
import { uploadFileToCloudinary } from '../config/cloudinaryConfig.js'
import Conversation from '../models/Conversation.js';
// import Message from '../models/Message.js';


const sendOtp = async(req, res) => {
    const { phoneNumber , phoneSuffix , email } = req.body;
    const otp = generateOtp();
    try{
    if(email)
    {
       let user = await User.findOne({email});
       if(!user)
       {
         user = new User({email});
       }
       user.emailOtp = otp;
       user.emailOtpExpiry = Date.now() + 3 * 60 * 1000; // 3 minutes from now
       await user.save();
       await sendOtpToEmail(email, otp);
       return response(res, 200, "OTP sent to email", {email});
    }
    if(!phoneNumber || !phoneSuffix)
    {
        return response(res, 400, "Phone number and suffix are required");
    }
    let user = await User.findOne({phoneNumber, phoneSuffix});
    const fullNumber = `${phoneSuffix}${phoneNumber}`;
    if(!user)
    {
        user = new User({phoneNumber, phoneSuffix});
    }

    await user.save();
    await twilioService.sendOtpToPhoneNumber(fullNumber);

    return response(res, 200, "OTP sent to phone", {phoneNumber});
}catch(error){
        console.error("Error in sendOtp controller:", error);
        return response(res, 500, "Internal Server Error");
    }
};

const verifyOtp = async(req, res) => {
    const { email, phoneNumber, phoneSuffix, otp } = req.body;

    try {
        let user;
        if (email) {
            user = await User.findOne({ email });
            if(!user)
            {
                return response(res, 400, "User not found");
            }
            const now = Date.now();
            if ( String(user.emailOtp) === String(otp) && user.emailOtpExpiry > now) {
                user.emailOtp = null;
                user.emailOtpExpiry = null;
                user.isVerified = true;
                await user.save();
            } else {
                return response(res, 400, "Invalid or expired OTP");
            }
        }
        else 
        {
            if (!phoneNumber || !phoneSuffix) {
                return response(res, 400, "Phone number and suffix are required");
            }
            const fullNumber = `${phoneSuffix}${phoneNumber}`;
            user = await User.findOne({ phoneNumber, phoneSuffix });
            if(!user)
            {
                return response(res, 400, "User not found");
            }
            const result = await twilioService.verifyOtp(fullNumber, otp);
            if (result.status === "approved") {
                user.isVerified = true;
                await user.save();
            }
            else {
                return response(res, 400, "Invalid or expired OTP");
            }
        }
            const token = generateToken(user._id);
            // res.cookie("auth_token", token, {
            //     httpOnly: true,
            //     maxAge: 365 * 24 * 60 * 60 * 1000, // 1 year
            // });
            return response(res, 200, "OTP verified successfully", { token , user });
    } catch (error) {
        console.error("Error in verifyOtp controller:", error);
        return response(res, 500, "Internal Server Error");
    }
};

const updateProfile = async(req, res) => {
    // Implementation for updating user profile goes here
    console.log(req.body);
    const { username , agreed , about , profilePicture } = req.body;
    const userId = req.user.id;
    try{
        const user = await User.findById(userId);
        if(!user)
        {
            return response(res, 404, "User not found");
        }
        if(req.file)
        {
            const uploadResult = await uploadFileToCloudinary(req.file);
            user.profilePicture = uploadResult?.secure_url;
        }
        else if( profilePicture )
        {
            user.profilePicture = profilePicture;
        }
        if(username)
        {
            user.username = username;
        }
        if(about)
        {
            user.about = about;
        }
        if(agreed)
        {
            user.agreed = true;
        }
        await user.save();
        return response(res, 200, "Profile updated successfully", {user});
    }catch(error){
        console.error("Error in updateProfile controller:", error);
        return response(res, 500, "Internal Server Error");
    }
};
const logOut = (req, res) => {
    try
    {
    res.cookie("auth_token", "", {
        expires: new Date(0),
    });
    return response(res, 200, "Logged out successfully");
    }catch(error)
    {
        console.error("Error in logOut controller:", error);
        return response(res, 500, "Internal Server Error");
    }
}


const checkAuthenticated = async(req, res, next) => {
   const userId = req.user.id;
   if(!userId)
   {
    return response(res, 401, "Unauthorized Access");
   }
   try
   {
      const user = await User.findById(userId);
      if(!user)
      {
         return response(res, 404, "User not found");
      }
        return response(res, 200, "User is authenticated", user);
   }catch(error)
   {
        console.error("Error in checkAuthenticated controller:", error);
        return response(res, 500, "Internal Server Error");
   }
};

const getAllUsers = async(req, res) => {
    const loggedInUser = req.user.id;
    try{
        const users = await User.find({ _id: { $ne: loggedInUser } }).select('username profilePicture about lastSeen isOnline phoneSuffix phoneNumber').lean();

        const usersWithConversation = await Promise.all(users.map(async(user) => {
            const conversation = await Conversation.findOne({
                participants: { $all: [loggedInUser, user?._id] }
            }).populate({
                path : 'lastMessage',
                select : 'content sender receiver createdAt'
            }).lean();
            return { ...user , conversation: conversation || null };
        }));
        return response(res, 200, "Users fetched successfully", usersWithConversation );
    }catch(error){
        console.error("Error in getAllUsers controller:", error);
        return response(res, 500, "Internal Server Error");
    }
}


export default { sendOtp, verifyOtp, updateProfile, checkAuthenticated, logOut, getAllUsers };