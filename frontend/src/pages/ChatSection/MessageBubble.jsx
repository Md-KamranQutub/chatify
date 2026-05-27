import { format } from "date-fns";
import React, { useRef, useState, useEffect } from "react";
import {
  FaCheck,
  FaCheckDouble,
  FaSmile,
  FaPlus,
  FaRegCopy,
  FaTrash,
} from "react-icons/fa";
import { HiDotsVertical } from "react-icons/hi";
import { RxCross2 } from "react-icons/rx";
import useOutSideClick from "../../hooks/useOutsideClick";
import EmojiPicker from "emoji-picker-react";
import useChatStore from "../../store/useChatStore";

const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];

const MessageBubble = ({ message, theme, onReact, currentUser, deleteMessage }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [localReactions, setLocalReactions] = useState(message.reactions || []);

  const messageRef = useRef(null);
  const optionRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactionsMenuRef = useRef(null);

  const { setCurrentUser } = useChatStore();
  const isUserMessage = message.sender._id === currentUser._id;
  const isDark = theme === "dark";

  useEffect(() => {
    setLocalReactions(message.reactions || []);
  }, [message.reactions]);

  const handleReact = async (emoji) => {
    setCurrentUser(currentUser);
    const existingIndex = localReactions.findIndex(
      (r) => r.user === currentUser._id
    );
    if (existingIndex !== -1 && localReactions[existingIndex].emoji === emoji) {
      setLocalReactions((prev) => prev.filter((_, i) => i !== existingIndex));
    } else {
      setLocalReactions((prev) => [
        ...prev.filter((r) => r.user !== currentUser._id),
        { emoji, user: currentUser._id, _id: Date.now().toString() },
      ]);
    }
    await onReact(message._id, emoji);
    setShowEmojiPicker(false);
    setShowReactions(false);
  };

  useOutSideClick(emojiPickerRef, () => { if (showEmojiPicker) setShowEmojiPicker(false); });
  useOutSideClick(reactionsMenuRef, () => { if (showReactions) setShowReactions(false); });
  useOutSideClick(optionRef, () => { if (showOptions) setShowOptions(false); });

  // ── Bubble colours ──────────────────────────────────────────────────────
  const sentBg   = isDark ? "bg-[#4a1230] text-[#F8BBD0]"   : "bg-[#C2185B] text-white";
  const recvBg   = isDark ? "bg-[#2d0f1c] text-[#F8BBD0]"   : "bg-white text-[#4A1528] border border-[#F8BBD0]";
  const bubbleBg = isUserMessage ? sentBg : recvBg;

  return (
    <div className={`flex mt-3 ${isUserMessage ? "justify-end" : "justify-start"}`}>
      <div className="relative group max-w-[70%]" ref={messageRef}>

        {/* ── Bubble ── */}
        <div
          className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${bubbleBg} ${
            isUserMessage ? "rounded-tr-sm" : "rounded-tl-sm"
          }`}
        >
          {/* Content */}
          {message.contentType === "text" && (
            <p className="text-sm leading-relaxed break-words pr-1">
              {message.content}
            </p>
          )}
          {message.contentType === "image" && (
            <div className="flex flex-col gap-1">
              <img
                src={message.imageOrVideoUrl}
                alt="attachment"
                className="rounded-xl max-w-xs object-cover"
              />
              {message.content && (
                <p className="text-sm mt-1">{message.content}</p>
              )}
            </div>
          )}
          {message.contentType === "video" && (
            <div className="flex flex-col gap-1">
              <video
                src={message.imageOrVideoUrl}
                controls
                className="rounded-xl max-w-xs"
              />
              {message.content && (
                <p className="text-sm mt-1">{message.content}</p>
              )}
            </div>
          )}

          {/* Timestamp + status */}
          <div
            className={`flex items-center justify-end gap-1 mt-1.5 text-[11px] ${
              isUserMessage
                ? isDark ? "text-[#F48FB1]/60" : "text-white/70"
                : isDark ? "text-[#7d3a50]" : "text-[#AD1457]/50"
            }`}
          >
            <span>{format(new Date(message.createdAt), "HH:mm")}</span>
            {isUserMessage && (
              <>
                {message.messageStatus === "send" && <FaCheck size={10} />}
                {message.messageStatus === "delivered" && <FaCheckDouble size={10} />}
                {message.messageStatus === "read" && (
                  <FaCheckDouble size={10} className="text-blue-300" />
                )}
              </>
            )}
          </div>

          {/* Three-dot menu button */}
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className={`p-1 rounded-full transition ${
                isUserMessage
                  ? isDark ? "hover:bg-white/10 text-white/70" : "hover:bg-white/20 text-white/80"
                  : isDark ? "hover:bg-white/10 text-[#F48FB1]" : "hover:bg-[#FCE4EC] text-[#C2185B]"
              }`}
              aria-label="Message options"
            >
              <HiDotsVertical size={15} />
            </button>
          </div>

          {/* Options dropdown */}
          {showOptions && (
            <div
              ref={optionRef}
              className={`absolute top-8 right-1 z-50 w-36 rounded-xl shadow-xl py-1.5 text-sm border ${
                isDark
                  ? "bg-[#1a0a10] border-[#3d1a26] text-[#F8BBD0]"
                  : "bg-white border-[#F8BBD0] text-[#4A1528]"
              }`}
            >
              <button
                onClick={() => {
                  if (message.contentType === "text") {
                    navigator.clipboard.writeText(message.content);
                  }
                  setShowOptions(false);
                }}
                className={`flex items-center w-full px-4 py-2 gap-3 transition ${
                  isDark ? "hover:bg-[#2d0f1c]" : "hover:bg-[#FFF0F5]"
                }`}
              >
                <FaRegCopy size={13} className={isDark ? "text-[#F48FB1]" : "text-[#C2185B]"} />
                Copy
              </button>
              {isUserMessage && (
                <button
                  onClick={() => {
                    deleteMessage(message?._id);
                    setShowOptions(false);
                  }}
                  className={`flex items-center w-full px-4 py-2 gap-3 transition border-t ${
                    isDark
                      ? "hover:bg-[#2d0f1c] border-[#3d1a26] text-red-400"
                      : "hover:bg-red-50 border-[#F8BBD0] text-red-500"
                  }`}
                >
                  <FaTrash size={13} />
                  Delete
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Reaction emoji strip below bubble ── */}
        {localReactions.length > 0 && (
          <div
            className={`absolute -bottom-5 ${isUserMessage ? "right-2" : "left-2"} flex items-center gap-0.5 px-2 py-0.5 rounded-full shadow-md text-sm ${
              isDark ? "bg-[#2d0f1c] border border-[#3d1a26]" : "bg-white border border-[#F8BBD0]"
            }`}
          >
            {localReactions.map((r, i) => (
              <span key={i}>{r.emoji}</span>
            ))}
          </div>
        )}

        {/* ── Hover: react button (beside bubble) ── */}
        <div
          className={`absolute ${isUserMessage ? "-left-9" : "-right-9"} top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity`}
        >
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`p-1.5 rounded-full shadow transition ${
              isDark
                ? "bg-[#2d0f1c] hover:bg-[#3d1a26] text-[#F48FB1]"
                : "bg-white hover:bg-[#FFF0F5] border border-[#F8BBD0] text-[#F48FB1]"
            }`}
            aria-label="React"
          >
            <FaSmile size={15} />
          </button>
        </div>

        {/* ── Quick reaction bar ── */}
        {showReactions && (
          <div
            ref={reactionsMenuRef}
            className={`absolute z-50 flex items-center gap-1 px-3 py-2 rounded-full shadow-xl border ${
              isUserMessage ? "right-0 -top-12" : "left-0 -top-12"
            } ${
              isDark
                ? "bg-[#1a0a10] border-[#3d1a26]"
                : "bg-white border-[#F8BBD0]"
            }`}
          >
            {quickReactions.map((emoji, i) => (
              <button
                key={i}
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transition-transform text-base leading-none"
              >
                {emoji}
              </button>
            ))}
            <div className={`w-px h-4 mx-1 ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />
            <button
              onClick={() => setShowEmojiPicker(true)}
              className={`p-1 rounded-full transition ${
                isDark ? "hover:bg-[#2d0f1c] text-[#F48FB1]" : "hover:bg-[#FCE4EC] text-[#C2185B]"
              }`}
              aria-label="More emojis"
            >
              <FaPlus size={11} />
            </button>
          </div>
        )}

        {/* ── Full emoji picker ── */}
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            className={`absolute z-50 ${isUserMessage ? "right-0" : "left-0"} -top-[360px]`}
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  handleReact(emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
              />
              <button
                onClick={() => setShowEmojiPicker(false)}
                className={`absolute top-2 right-2 p-1 rounded-full transition ${
                  isDark ? "bg-[#2d0f1c] text-[#F48FB1] hover:bg-[#3d1a26]" : "bg-[#FCE4EC] text-[#C2185B] hover:bg-[#F8BBD0]"
                }`}
                aria-label="Close emoji picker"
              >
                <RxCross2 size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;