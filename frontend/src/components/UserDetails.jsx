import React, { useEffect, useState } from "react";
import useUserStore from "../store/useUserStore";
import useThemeStore from "../store/useThemeStore";
import { updateProfile } from "../services/user.service";
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
  const [loading, setLoading] = useState(false);

  const { currentUser, setCurrentUser } = useUserStore();
  const { theme } = useThemeStore();
  const isDark = theme === "dark";

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.username || "");
      setAbout(currentUser.about || "");
      setProfilePicture(currentUser?.profilePicture || null);
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
      } else if (field === "profile" && profilePicture) {
        formData.append("media", profilePicture);
      }
      const updated = await updateProfile(formData);
      setCurrentUser(updated?.data);
      setProfilePicture(null);
      setPreview(null);
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update profile");
    } finally {
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

  const EditableField = ({
    label,
    value,
    onChange,
    isEditing,
    onEdit,
    onSave,
    onCancel,
    showEmoji,
    onToggleEmoji,
    onEmojiSelect,
    fieldKey,
    placeholder,
  }) => (
    <div
      className={`relative p-4 rounded-2xl border transition ${
        isDark
          ? "bg-[#2d0f1c] border-[#3d1a26]"
          : "bg-white border-[#F8BBD0]"
      }`}
    >
      <label
        className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${
          isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
        }`}
      >
        {label}
      </label>

      <div className="flex items-center gap-2">
        {isEditing ? (
          <input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className={`flex-1 px-3 py-2 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-[#C2185B]/30 ${
              isDark
                ? "bg-[#1a0a10] border-[#3d1a26] text-[#F8BBD0] placeholder-[#7d3a50] focus:border-[#C2185B]"
                : "bg-[#FFF0F5] border-[#F8BBD0] text-[#4A1528] placeholder-[#F48FB1] focus:border-[#C2185B] focus:bg-white"
            }`}
          />
        ) : (
          <span
            className={`flex-1 text-sm ${
              isDark ? "text-[#F8BBD0]" : "text-[#4A1528]"
            }`}
          >
            {value || (
              <span className={isDark ? "text-[#7d3a50]" : "text-[#F48FB1]"}>
                {placeholder}
              </span>
            )}
          </span>
        )}

        <div className="flex items-center gap-1.5 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={onSave}
                className={`p-1.5 rounded-full transition ${
                  isDark ? "hover:bg-[#3d1a26]" : "hover:bg-[#FCE4EC]"
                }`}
                aria-label="Save"
              >
                <FaCheck className="w-3.5 h-3.5 text-[#C2185B]" />
              </button>
              <button
                onClick={onToggleEmoji}
                className={`p-1.5 rounded-full transition ${
                  isDark ? "hover:bg-[#3d1a26]" : "hover:bg-[#FCE4EC]"
                }`}
                aria-label="Emoji"
              >
                <FaSmile className="w-3.5 h-3.5 text-[#F48FB1]" />
              </button>
              <button
                onClick={onCancel}
                className={`p-1.5 rounded-full transition ${
                  isDark ? "hover:bg-[#3d1a26]" : "hover:bg-[#FCE4EC]"
                }`}
                aria-label="Cancel"
              >
                <MdCancel className="w-3.5 h-3.5 text-[#AD1457]/60" />
              </button>
            </>
          ) : (
            <button
              onClick={onEdit}
              className={`p-1.5 rounded-full transition ${
                isDark ? "hover:bg-[#3d1a26] text-[#F48FB1]" : "hover:bg-[#FCE4EC] text-[#C2185B]"
              }`}
              aria-label={`Edit ${label}`}
            >
              <FaPencilAlt className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Emoji picker */}
      {showEmoji && (
        <div className="absolute z-20 bottom-full left-0 mb-2 rounded-2xl overflow-hidden shadow-2xl">
          <EmojiPicker
            onEmojiClick={(emoji) => onEmojiSelect(emoji, fieldKey)}
          />
        </div>
      )}
    </div>
  );

  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`w-full min-h-screen border-r transition-colors duration-200 ${
          isDark
            ? "bg-[#1a0a10] border-[#3d1a26]"
            : "bg-[#FFF0F5] border-[#F8BBD0]"
        }`}
      >
        <div className="max-w-md mx-auto px-5 py-8">

          {/* ── Header ── */}
          <div className="mb-8">
            <h1
              className={`text-2xl font-semibold tracking-tight ${
                isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
              }`}
            >
              Profile
            </h1>
            <p
              className={`text-xs mt-1 ${
                isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
              }`}
            >
              Manage your personal information
            </p>
          </div>

          <div className="space-y-5">

            {/* ── Avatar ── */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <img
                  src={preview || currentUser?.profilePicture || "https://api.dicebear.com/6.x/avataaars/svg?seed=You"}
                  alt="Profile"
                  className="w-28 h-28 rounded-full object-cover border-4 border-[#F48FB1] shadow-lg shadow-pink-200/30"
                />
                <label
                  htmlFor="profileUpload"
                  className="absolute inset-0 bg-black/40 rounded-full flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <FaCamera className="w-5 h-5 text-white mb-1" />
                  <span className="text-white text-xs font-medium">Change</span>
                  <input
                    type="file"
                    id="profileUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
                {/* Ring pulse on hover */}
                <div className="absolute -inset-1 rounded-full border-2 border-[#C2185B] opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Save / Discard new photo */}
              {preview && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleSave("profile")}
                    disabled={loading}
                    className="px-5 py-2 bg-[#C2185B] hover:bg-[#AD1457] disabled:bg-[#F8BBD0] text-white text-sm font-medium rounded-xl transition shadow-md shadow-pink-300/20"
                  >
                    {loading ? "Saving…" : "Save photo"}
                  </button>
                  <button
                    onClick={() => { setProfilePicture(null); setPreview(null); }}
                    className={`px-5 py-2 text-sm font-medium rounded-xl border transition ${
                      isDark
                        ? "border-[#3d1a26] text-[#F48FB1] hover:bg-[#2d0f1c]"
                        : "border-[#F8BBD0] text-[#C2185B] hover:bg-[#FFF0F5]"
                    }`}
                  >
                    Discard
                  </button>
                </div>
              )}

              {/* Username display */}
              <div className="text-center">
                <p
                  className={`font-semibold text-base ${
                    isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
                  }`}
                >
                  {currentUser?.username}
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
                  }`}
                >
                  {currentUser?.email}
                </p>
              </div>
            </div>

            {/* ── Divider ── */}
            <div className={`h-px ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />

            {/* ── Name field ── */}
            <EditableField
              label="Your Name"
              value={name}
              onChange={setName}
              isEditing={isEditingName}
              onEdit={() => setIsEditingName(true)}
              onSave={() => handleSave("name")}
              onCancel={() => { setIsEditingName(false); setShowNameEmoji(false); }}
              showEmoji={showNameEmoji}
              onToggleEmoji={() => setShowNameEmoji((p) => !p)}
              onEmojiSelect={handleEmojiSelector}
              fieldKey="name"
              placeholder="Enter your name"
            />

            {/* ── About field ── */}
            <EditableField
              label="About"
              value={about}
              onChange={setAbout}
              isEditing={isEditingAbout}
              onEdit={() => setIsEditingAbout(true)}
              onSave={() => handleSave("about")}
              onCancel={() => { setIsEditingAbout(false); setShowAboutEmoji(false); }}
              showEmoji={showAboutEmoji}
              onToggleEmoji={() => setShowAboutEmoji((p) => !p)}
              onEmojiSelect={handleEmojiSelector}
              fieldKey="about"
              placeholder="Hey there! I am using Chatify."
            />

            {/* ── Info note ── */}
            <p
              className={`text-xs text-center px-4 ${
                isDark ? "text-[#7d3a50]" : "text-[#AD1457]/50"
              }`}
            >
              Your profile information is visible to your contacts.
            </p>
          </div>
        </div>
      </motion.div>
    </Layout>
  );
};

export default UserDetails;