import { format } from "date-fns";
import React, { useRef, useState, useEffect } from "react";
import { FaCheck, FaCheckDouble, FaSmile, FaPlus, FaRegCopy, FaTrash } from "react-icons/fa";
import {HiDotsVertical} from "react-icons/hi";
import useOutSideClick from "../../hooks/useOutsideClick";
import EmojiPicker from "emoji-picker-react";
import { RxCross2 } from "react-icons/rx";
import useChatStore from "../../store/useChatStore";

const MessageBubble = ({
  message,
  theme,
  onReact,
  currentUser,
  deleteMessage,
}) => {
  const quickReactions = ["👍", "❤️", "😂", "😮", "😢", "🙏"];
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Local state for reactions to enable optimistic updates
  const [localReactions, setLocalReactions] = useState(message.reactions || []);
  
  const messageRef = useRef(null);
  const optionRef = useRef(null);
  const emojiPickerRef = useRef(null);
  const reactionsMenuRef = useRef(null);
  const {setCurrentUser} = useChatStore();
  const isUserMessage = message.sender._id === currentUser._id;
  
  // Update local reactions when message prop changes
  useEffect(() => {
    setLocalReactions(message.reactions || []);
  }, [message.reactions]);
  
  const bubbleClass = isUserMessage ? `chat-end` : `chat-start`;
  const bubbleContentClass = isUserMessage
    ? `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-[#144d38] text-white" : "bg-[#d9fdd3] text-black"
      }`
    : `chat-bubble md:max-w-[50%] min-w-[130px] ${
        theme === "dark" ? "bg-gray-200 text-black" : "bg-white text-black"
      }`;

  const handleReact = async (emoji) => {
    setCurrentUser(currentUser);
    
    // Find if user already has any reaction on this message
    const existingReactionIndex = localReactions.findIndex(
      r => r.user === currentUser._id
    );
    
    // If user already reacted with the same emoji, remove it
    if (existingReactionIndex !== -1 && localReactions[existingReactionIndex].emoji === emoji) {
      setLocalReactions(prev => prev.filter((_, i) => i !== existingReactionIndex));
    } else {
      // Remove any existing reaction from this user and add the new one
      const newReaction = {
        emoji: emoji,
        user: currentUser._id,
        _id: Date.now().toString() // temporary ID
      };
      
      setLocalReactions(prev => {
        // Filter out any existing reaction from current user
        const filtered = prev.filter(r => r.user !== currentUser._id);
        // Add the new reaction
        return [...filtered, newReaction];
      });
    }
    
    // Call the parent's onReact function
    await onReact(message._id, emoji);
    
    setShowEmojiPicker(false);
    setShowReactions(false);
  };

  useOutSideClick(emojiPickerRef, () => {
    if (showEmojiPicker) setShowEmojiPicker(false);
  });
  useOutSideClick(reactionsMenuRef, () => {
    if (showReactions) setShowReactions(false);
  });
  useOutSideClick(optionRef, () => {
    if (showOptions) setShowOptions(false);
  });

  return (
    <div className={`chat ${bubbleClass} mt-4`}>
      <div className={`${bubbleContentClass} relative group`} ref={messageRef}>
        <div className="flex justify-center gap-2">
          {message.contentType === "text" && (
            <p className="mr-2">{message.content}</p>
          )}
          {message.contentType === "image" && (
            <div className="flex gap-1 flex-col justify-center">
              <img
                src={message.imageOrVideoUrl}
                alt="image-video"
                className="rounded-lg max-w-xs"
              />
              <p className="mt-1">{message.content}</p>
            </div>
          )}
          {message.contentType === "video" && (
            <div className="flex gap-1 flex-col justify-center">
              <video
                src={message.imageOrVideoUrl}
                alt="image-video"
                controls
                className="rounded-lg max-w-xs"
              />
              <p className="mt-1">{message.content}</p>
            </div>
          )}
        </div>
        <div className="self-end flex items-center justify-end gap-1 text-xs opacity-60 mt-2 ml-2">
          <span>{format(new Date(message.createdAt), "HH:mm")}</span>
          {isUserMessage && (
            <>
              {message.messageStatus === "send" && <FaCheck size={12} />}
              {message.messageStatus === "delivered" && (
                <FaCheckDouble size={12} />
              )}
              {message.messageStatus === "read" && (
                <FaCheckDouble size={12} className="text-blue-600" />
              )}
            </>
          )}
        </div>
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity z-50">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className={`p-1 rounded-full ${
              theme === "dark" ? "text-white" : "text-gray-800"
            }`}
          >
            <HiDotsVertical size={18} />
          </button>
        </div>
        <div
          className={`absolute ${
            isUserMessage ? "-left-10" : "-right-10"
          } top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-2`}
        >
          <button
            onClick={() => setShowReactions(!showReactions)}
            className={`p-2 rounded-full ${
              theme === "dark"
                ? "bg-[#202c33] hover:bg-[202c33]/80"
                : "bg-white hover:bg-gray-100 shadow-lg"
            }`}
          >
            <FaSmile
              className={`${
                theme === "dark" ? "text-gray-300" : "text-gray-600"
              }`}
            />
          </button>
        </div>
        {showReactions && (
          <div
            ref={reactionsMenuRef}
            className={`absolute -top-8 ${
              isUserMessage ? "left-0" : "left-36"
            } transform -translate-x-1/2 flex items-center bg-white rounded-full px-2 py-1.5 gap-1 shadow-lg z-50`}
          >
            {quickReactions.map((emoji, index) => {
              return <button
                key={index}
                onClick={() => handleReact(emoji)}
                className="hover:scale-125 transition-transform p-1"
              >
                {emoji}
              </button>;
            })}
            <div className="w-[1px] h-5 bg-gray-600 mx-1" />
            <button 
              className="hover:bg-[#ffffff1a] rounded-full p-1"  
              onClick={() => {setShowEmojiPicker(true)}}
            >
              <FaPlus />
            </button>
          </div>
        )}
        {showEmojiPicker && (
          <div ref={emojiPickerRef} className={`absolute ${isUserMessage ? "right-0" : "left-0"} mb-6 z-50`}>
            <div className="relative">
              <EmojiPicker
                onEmojiClick={(emojiObject) => {
                  console.log("Emoji", emojiObject.emoji);
                  handleReact(emojiObject.emoji);
                  setShowEmojiPicker(false);
                }}
              />
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                onClick={() => setShowEmojiPicker(false)}
              >
                <RxCross2 />
              </button>
            </div>
          </div>
        )}
        {localReactions && localReactions.length > 0 && (
          <div
            className={`absolute -bottom-5 ${
              isUserMessage ? "right-2" : "left-2"
            } ${
              theme === "dark" ? "bg-[#2a3942]" : "bg-gray-200"
            } rounded-full px-2 shadow-md`}
          >
            {localReactions.map((reaction, index) => {
              return <span key={index}>{reaction.emoji}</span>;
            })}
          </div>
        )}

        {showOptions && (
          <div
            ref={optionRef}
            className={`absolute top-8 right-1 z-50 w-36 rounded-xl shadow-lg py-2 text-sm ${
              theme === "dark"
                ? "bg-[#1d1f1f] text-white"
                : "bg-gray-100 text-black"
            }`}
          >
            <button 
              onClick={() => {
                if(message.contentType === 'text'){
                  navigator.clipboard.writeText(message.content);
                }
                setShowOptions(false);
              }} 
              className="flex items-center w-full px-4 py-2 gap-3 rounded-lg"
            >
              <FaRegCopy size={14}/>
              <span>Copy</span>
            </button>
            {isUserMessage && (
              <button 
                onClick={() => {
                  deleteMessage(message?._id);
                  setShowOptions(false);
                }} 
                className="flex items-center w-full px-4 py-2 gap-3 rounded-lg text-red-600"
              >
                <FaTrash className="text-red-600" size={14}/>
                <span>Delete</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MessageBubble;