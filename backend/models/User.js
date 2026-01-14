import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  username: { type: String, trim: true },
  phoneNumber: { type: String, unique: true, sparse: true },
  phoneSuffix: { type: String },
  email: { type: String, unique: true, lowercase: true, validate: {
      validator: function(email) {
        return /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/.test(email);
      },
      message: 'Email validation failed.'
    },
 },
 emailOtp : {type : String},
 emailOtpExpiry : {type : Date },
 profilePicture : { type : String },
 about : { type : String },
 lastSeen : { type : Date },
 isVerified : { type : Boolean, default : false },
 isOnline : { type : Boolean, default : false },
 agreed : { type : Boolean, default : false },
},{timestamps : true});

const User = mongoose.model("User", userSchema);

export default User;
