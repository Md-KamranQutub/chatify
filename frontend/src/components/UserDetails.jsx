import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/useThemeStore";
import {updateProfile} from "../services/user.service";
import { toast } from "react-toastify";
import Layout from "./Layout";
import { motion } from "framer-motion";
import { FaCamera, FaCheck, FaPencilAlt, FaSmile } from "react-icons/fa";
import { MdCancel } from "react-icons/md";
import EmojiPicker from "emoji-picker-react";

const UserDetails = () => {
  const [name, setName] = useState("");
  const [about, setAbout] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [preview, setPreview] = useState(null);

  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [showNameEmoji, setShowNameEmoji] = useState(false);
  const [showAboutEmoji, setShowAboutEmoji] = useState(false);
  const { currentUser, setCurrentUser } = useUserStore();
  const [loading , setLoading] = useState(false);
  const { theme } = useThemeStore();

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username || name);
      setAbout(currentUser.about || about);
      setProfilePicture(currentUser?.profilePicture || profilePicture)
    }
  }, [currentUser]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePicture(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSave = async (field) => {
    try {
      setLoading(true);
      const formData = new FormData();
      if (field === "name") {
        formData.append("username", name);
        setIsEditingName(false);
        setShowNameEmoji(false);
      } else if (field === "about") {
        formData.append("about", about);
        setIsEditingAbout(false);
        setShowAboutEmoji(false);
      }
      if (profilePicture && field === "profile") {
        formData.append("media", profilePicture);
      }
      const updated = await updateProfile(formData);
      setCurrentUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);
      toast.success("Profile Updated");
      setLoading(false);
    } catch (error) {
      console.error(error);
      toast.error("Failed to Update Profile");
      setLoading(false);
    }
  };

  const handleEmojiSelector = (emoji, field) => {
    if (field === "name") {
      setName((prev) => prev + emoji.emoji);
      setShowNameEmoji(false);
    } else {
      setAbout((prev) => prev + emoji.emoji);
      setShowAboutEmoji(false);
    }
  };

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className={`w-full min-h-screen flex border-r ${
          theme === "dark"
            ? "bg-[rgb(17,27,33)] border-gray-600 text-white"
            : "bg-gray-100 border-gray-200 text-black"
        }`}
      >
        <div className="w-full rounded-lg p-6">
          <div className="flex items-center mb-6">
            <h1 className="text-2xl font-bold">Profile</h1>
          </div>
          <div className="space-y-6">
            <div className="flex flex-col items-center ">
              <div className="relative group">
                <img
                  src={preview || currentUser?.profilePicture}
                  alt="profile Picture"
                  className="w-52 h-52 rounded-full mb-2 object-cover"
                />
                <label
                  htmlFor="profileUpload"
                  className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <div className="text-white text-center">
                    <FaCamera className="h-6 w-6 mx-auto mb-2" />
                    <span className="text-sm">Change</span>
                  </div>
                  <input
                    type="file"
                    id="profileUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
            {preview && (
              <div className="flex justify-center">
                <button onClick={()=>{handleSave("profile")}} className=" bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded">
                  {loading ? "Saving..." :"Change"}
                </button>
                <button onClick={()=>{setProfilePicture(null); setPreview(null)}} className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded">Discard</button>
              </div>
            )}
            <div className={`relative p-4  ${theme === 'dark' ? "bg-gray-800" : "bg-white"} shadow-sm rounded-lg `}>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-500 text-start">Your Name</label>
            <div className="flex items-center justify-between">{isEditingName ? (
              <input type="text" id="name" value={name} onChange={(e)=> setName(e.target.value)} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"}`}/>
            ):(
               <span>{currentUser.username || name}</span>
            )}
            {isEditingName ? (
              <>
              <button className="ml-2 focus:outline-none">
              <FaCheck className="h-5 w-5 text-green-500" onClick={()=>handleSave("name")}/>
             </button>
             <button className="ml-2 focus:outline-none">
              <FaSmile className="h-5 w-5 text-yellow-500" onClick={()=>setShowNameEmoji(!showNameEmoji)}/>
             </button>
              <button className="ml-2 focus:outline-none">
              <MdCancel className="h-5 w-5 text-gray-500" onClick={()=>setIsEditingName(!isEditingName)}/>
             </button>
              </>
            ) : (
               <button className="ml-2 focus:outline-none">
              <FaPencilAlt className="h-5 w-5 text-gray-500" onClick={()=>setIsEditingName(!isEditingName)}/>
             </button>
            )}
            </div>
            {showNameEmoji && (
              <div className="absolute z-10 -top-80">
                <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelector(emoji,"name")}/>
              </div>
            )}
            </div>
             <div className={`relative p-4  ${theme === 'dark' ? "bg-gray-800" : "bg-white"} shadow-sm rounded-lg `}>
            <label htmlFor="name" className="block text-sm font-medium mb-1 text-gray-500 text-start">About</label>
            <div className="flex items-center justify-between">{isEditingAbout ? (
              <input type="text" id="name" value={about} onChange={(e)=> {setAbout(e.target.value)}} className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 ${theme === "dark" ? "bg-gray-700 text-white" : "bg-white text-black"}`}/>
            ):(
               <span>{currentUser.about || about}</span>
            )}
            {isEditingAbout ? (
              <>
              <button className="ml-2 focus:outline-none">
              <FaCheck className="h-5 w-5 text-green-500" onClick={()=>handleSave("about")}/>
             </button>
             <button className="ml-2 focus:outline-none">
              <FaSmile className="h-5 w-5 text-yellow-500" onClick={()=>showAboutEmoji(!showAboutEmoji)}/>
             </button>
              <button className="ml-2 focus:outline-none">
              <MdCancel className="h-5 w-5 text-gray-500" onClick={()=>setIsEditingAbout(!isEditingAbout)}/>
             </button>
              </>
            ) : (
               <button className="ml-2 focus:outline-none">
              <FaPencilAlt className="h-5 w-5 text-gray-500" onClick={()=>setIsEditingAbout(!isEditingAbout)}/>
             </button>
            )}
            </div>
            {showAboutEmoji && (
              <div className="absolute z-10 -top-80">
                <EmojiPicker onEmojiClick={(emoji) => handleEmojiSelector(emoji,"about")}/>
              </div>
            )}
            </div>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default UserDetails;
