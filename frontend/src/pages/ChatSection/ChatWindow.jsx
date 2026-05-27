import React, { useEffect } from "react";
import { useState, useRef } from "react";
import useUserStore from "../../store/useUserStore";
import useThemeStore from "../../store/useThemeStore";
import chatStore from "../../store/useChatStore";
import { isToday, isYesterday, format } from "date-fns";
import whatsapp_image from "../../images/whatsapp_image.png";
import {
  FaArrowLeft,
  FaEllipsisV,
  FaLock,
  FaVideo,
  FaSmile,
  FaTimes,
  FaPaperclip,
  FaImage,
  FaFile,
  FaPaperPlane,
} from "react-icons/fa";
import MessageBubble from "./MessageBubble";
import EmojiPicker from "emoji-picker-react";

const isValidate = (date) => date instanceof Date && !isNaN(date);

const TypingDots = () => (
  <span className="flex items-center gap-0.5 h-4">
    {[0, 1, 2].map((i) => (
      <span
        key={i}
        className="w-1.5 h-1.5 rounded-full bg-[#F48FB1] animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }}
      />
    ))}
  </span>
);

const ChatWindow = ({ selectedContact, setSelectedContact, isMobile }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);
  const [filePreview, setFilePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const typingTimeOutRef = useRef(null);
  const messageEndRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const fileInputRef = useRef(null);

  const { theme } = useThemeStore();
  const { currentUser } = useUserStore();
  const {
    messages,
    loading,
    sendMessage,
    fetchConversations,
    fetchMessages,
    conversations,
    isUserTyping,
    startTyping,
    stopTyping,
    getUserLastSeen,
    isOnline,
    addReaction,
    deleteMessage,
  } = chatStore();

  const isDark = theme === "dark";
  const online = isOnline(selectedContact?._id);
  const lastSeen = getUserLastSeen(selectedContact?._id);
  const isTyping = isUserTyping(selectedContact?._id);

  useEffect(() => {
    if (selectedContact?._id && conversations?.data?.length > 0) {
      const conversation = conversations?.data?.find((conv) =>
        conv.participants.some((p) => p._id === selectedContact?._id)
      );
      if (conversation?._id) fetchMessages(conversation._id);
    }
  }, [selectedContact?._id, conversations?.data]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  useEffect(() => {
    if (message && selectedContact) {
      startTyping(selectedContact?._id);
      if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current);
      typingTimeOutRef.current = setTimeout(() => {
        stopTyping(selectedContact?._id);
      }, 2000);
    }
    return () => {
      if (typingTimeOutRef.current) clearTimeout(typingTimeOutRef.current);
    };
  }, [message, selectedContact, startTyping, stopTyping]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setShowFileMenu(false);
      if (file.type.startsWith("image/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

  const handleSendMessage = async () => {
    if (!selectedContact) return;
    try {
      const formData = new FormData();
      formData.append("senderId", currentUser._id);
      formData.append("receiverId", selectedContact._id);
      formData.append("messageStatus", online ? "delivered" : "send");
      if (message.trim()) formData.append("content", message.trim());
      if (selectedFile) formData.append("media", selectedFile, selectedFile.name);
      if (!message.trim() && !selectedFile) return;
      await sendMessage(formData);
      setMessage("");
      setSelectedFile(null);
      setShowFileMenu(false);
      setFilePreview(null);
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const renderDateSeparator = (date) => {
    if (!isValidate(date)) return null;
    const label = isToday(date)
      ? "Today"
      : isYesterday(date)
      ? "Yesterday"
      : format(date, "EEEE, MMMM d");
    return (
      <div className="flex justify-center my-4">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-medium ${
            isDark
              ? "bg-[#3d1a26] text-[#F8BBD0]"
              : "bg-[#FCE4EC] text-[#AD1457]"
          }`}
        >
          {label}
        </span>
      </div>
    );
  };

  const groupedMessages = Array.isArray(messages)
    ? messages.reduce((acc, msg) => {
        if (!msg.createdAt) return acc;
        const date = new Date(msg.createdAt);
        if (isValidate(date)) {
          const key = format(date, "yyyy-MM-dd");
          if (!acc[key]) acc[key] = [];
          acc[key].push(msg);
        }
        return acc;
      }, {})
    : {};

  const handleReaction = (messageId, emoji) => {
    addReaction(messageId, emoji);
  };

  // ── Empty state ─────────────────────────────────────────────────────────
  if (!selectedContact && !isMobile) {
    return (
      <div
        className={`flex-1 flex flex-col justify-center items-center h-screen text-center ${
          isDark ? "bg-[#120508]" : "bg-[#FFF0F5]"
        }`}
      >
        <div className="max-w-sm px-6">
          <div
            className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 ${
              isDark ? "bg-[#2d0f1c]" : "bg-[#FCE4EC]"
            }`}
          >
            <img
              src={whatsapp_image}
              alt="Chat"
              className="w-14 h-14 object-contain"
            />
          </div>
          <h2
            className={`text-2xl font-semibold mb-3 ${
              isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
            }`}
          >
            Start a conversation
          </h2>
          <p
            className={`text-sm leading-relaxed mb-8 ${
              isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"
            }`}
          >
            Choose a contact from the list to begin chatting.
          </p>
          <div
            className={`flex items-center justify-center gap-2 text-xs ${
              isDark ? "text-[#7d3a50]" : "text-[#AD1457]/50"
            }`}
          >
            <FaLock className="w-3 h-3" />
            Your messages are end-to-end encrypted
          </div>
        </div>
      </div>
    );
  }

  // ── Chat view ────────────────────────────────────────────────────────────
  if (selectedContact) {
    return (
      <div
        className={`flex-1 h-screen w-full flex flex-col ${
          isDark ? "bg-[#120508]" : "bg-[#FFF0F5]"
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3 flex items-center gap-3 border-b ${
            isDark
              ? "bg-[#1a0a10] border-[#3d1a26]"
              : "bg-white border-[#F8BBD0]"
          }`}
        >
          {isMobile && (
            <button
              onClick={() => setSelectedContact(null)}
              className={`p-2 rounded-full transition ${
                isDark ? "hover:bg-[#2d0f1c] text-[#F8BBD0]" : "hover:bg-[#FCE4EC] text-[#880E4F]"
              }`}
              aria-label="Back"
            >
              <FaArrowLeft className="w-4 h-4" />
            </button>
          )}

          <div className="relative flex-shrink-0">
            <img
              src={
                selectedContact?.profilePicture ||
                "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix"
              }
              alt={selectedContact?.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-[#F48FB1]"
            />
            {online && (
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h2
              className={`font-semibold text-sm truncate ${
                isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
              }`}
            >
              {selectedContact?.username}
            </h2>
            <p className={`text-xs ${isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"}`}>
              {isTyping ? (
                <span className="flex items-center gap-1.5">
                  <TypingDots /> typing...
                </span>
              ) : online ? (
                "Online"
              ) : selectedContact?.lastSeen ? (
                `Last seen ${format(new Date(selectedContact.lastSeen), "HH:mm")}`
              ) : (
                "Offline"
              )}
            </p>
          </div>

          <div className="flex items-center gap-1">
            <button
              className={`p-2 rounded-full transition ${
                isDark
                  ? "hover:bg-[#2d0f1c] text-[#F48FB1]"
                  : "hover:bg-[#FCE4EC] text-[#C2185B]"
              }`}
              aria-label="Video call"
            >
              <FaVideo className="w-4 h-4" />
            </button>
            <button
              className={`p-2 rounded-full transition ${
                isDark
                  ? "hover:bg-[#2d0f1c] text-[#F48FB1]"
                  : "hover:bg-[#FCE4EC] text-[#C2185B]"
              }`}
              aria-label="More options"
            >
              <FaEllipsisV className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div
          className={`flex-1 px-4 py-3 overflow-y-auto space-y-1 ${
            isDark ? "bg-[#120508]" : "bg-[#FFF0F5]"
          }`}
          style={{
            backgroundImage: isDark
              ? "radial-gradient(circle at 20% 80%, rgba(194,24,91,0.04) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(244,143,177,0.04) 0%, transparent 50%)"
              : "radial-gradient(circle at 20% 80%, rgba(252,228,236,0.6) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(248,187,208,0.4) 0%, transparent 50%)",
          }}
        >
          {Object.entries(groupedMessages).map(([date, msgs]) => (
            <React.Fragment key={date}>
              {renderDateSeparator(new Date(date))}
              {msgs
                .filter(
                  (msg) =>
                    msg.conversation === selectedContact?.conversation?._id
                )
                .map((msg) => (
                  <MessageBubble
                    key={msg._id || msg.tempId}
                    message={msg}
                    theme={theme}
                    currentUser={currentUser}
                    onReact={handleReaction}
                    deleteMessage={deleteMessage}
                  />
                ))}
            </React.Fragment>
          ))}
          <div ref={messageEndRef} />
        </div>

        {/* File preview */}
        {filePreview && (
          <div
            className={`px-4 py-3 border-t relative flex justify-center ${
              isDark ? "bg-[#1a0a10] border-[#3d1a26]" : "bg-white border-[#F8BBD0]"
            }`}
          >
            {selectedFile?.type.startsWith("video/") ? (
              <video
                src={filePreview}
                controls
                className="max-h-40 rounded-xl object-cover shadow"
              />
            ) : (
              <img
                src={filePreview}
                alt="preview"
                className="max-h-40 rounded-xl object-cover shadow"
              />
            )}
            <button
              onClick={() => {
                setSelectedFile(null);
                setFilePreview(null);
              }}
              className="absolute top-2 right-4 bg-[#C2185B] hover:bg-[#AD1457] text-white rounded-full p-1.5 shadow"
              aria-label="Remove file"
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Input bar */}
        <div
          className={`px-4 py-3 border-t flex items-center gap-2 relative ${
            isDark
              ? "bg-[#1a0a10] border-[#3d1a26]"
              : "bg-white border-[#F8BBD0]"
          }`}
        >
          {/* Emoji */}
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            className={`p-2 rounded-full flex-shrink-0 transition ${
              isDark
                ? "hover:bg-[#2d0f1c] text-[#F48FB1]"
                : "hover:bg-[#FCE4EC] text-[#F48FB1]"
            }`}
            aria-label="Emoji"
          >
            <FaSmile className="w-5 h-5" />
          </button>
          {showEmojiPicker && (
            <div
              ref={emojiPickerRef}
              className="absolute left-2 bottom-16 z-50 shadow-xl rounded-2xl overflow-hidden"
            >
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  setMessage((prev) => prev + emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}

          {/* Attachment */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowFileMenu(!showFileMenu)}
              className={`p-2 rounded-full transition ${
                isDark
                  ? "hover:bg-[#2d0f1c] text-[#F48FB1]"
                  : "hover:bg-[#FCE4EC] text-[#F48FB1]"
              }`}
              aria-label="Attach file"
            >
              <FaPaperclip className="w-5 h-5" />
            </button>
            {showFileMenu && (
              <div
                className={`absolute bottom-full left-0 mb-2 rounded-xl shadow-lg overflow-hidden border text-sm ${
                  isDark
                    ? "bg-[#2d0f1c] border-[#3d1a26] text-[#F8BBD0]"
                    : "bg-white border-[#F8BBD0] text-[#4A1528]"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*,video/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 w-full transition ${
                    isDark ? "hover:bg-[#3d1a26]" : "hover:bg-[#FFF0F5]"
                  }`}
                >
                  <FaImage className="text-[#F48FB1]" /> Image / Video
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex items-center gap-2 px-4 py-2.5 w-full transition border-t ${
                    isDark
                      ? "hover:bg-[#3d1a26] border-[#3d1a26]"
                      : "hover:bg-[#FFF0F5] border-[#F8BBD0]"
                  }`}
                >
                  <FaFile className="text-[#F48FB1]" /> Document
                </button>
              </div>
            )}
          </div>

          {/* Text input */}
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSendMessage();
            }}
            placeholder="Type a message..."
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-[#C2185B]/30 transition ${
              isDark
                ? "bg-[#2d0f1c] border-[#3d1a26] text-[#F8BBD0] placeholder-[#7d3a50] focus:border-[#C2185B]"
                : "bg-[#FFF0F5] border-[#F8BBD0] text-[#4A1528] placeholder-[#F48FB1] focus:border-[#C2185B] focus:bg-white"
            }`}
          />

          {/* Send */}
          <button
            onClick={handleSendMessage}
            disabled={!message.trim() && !selectedFile}
            className="flex-shrink-0 w-10 h-10 flex items-center justify-center rounded-xl bg-[#C2185B] hover:bg-[#AD1457] disabled:bg-[#F8BBD0] active:scale-95 transition-all shadow-md shadow-pink-300/30"
            aria-label="Send message"
          >
            <FaPaperPlane className="w-4 h-4 text-white" />
          </button>
        </div>
      </div>
    );
  }
};

export default ChatWindow;