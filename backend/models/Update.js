import mongoose from "mongoose";

const updateSchema = new mongoose.Schema({
    user : { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },   
    content: { type: String },
    contentType: { type: String, enum: ['text', 'image', 'video'], default: 'text' },
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    expirestAt:{type: Date , default: Date.now() + 24*60*60*1000 }
},{timestamps: true});

const Update = mongoose.model("Update", updateSchema);

export default Update;
