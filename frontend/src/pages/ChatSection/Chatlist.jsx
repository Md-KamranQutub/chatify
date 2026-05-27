import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/useLayoutStore";
import useThemeStore from "../../store/useThemeStore";
import { FaPlus, FaSearch } from "react-icons/fa";
import formatTimestamp from "../../utils/Data";
import { motion } from "framer-motion";
import useUserStore from "../../store/useUserStore";

const Chatlist = ({ contacts }) => {
  const setSelectedContact = useLayoutStore((state) => state.setSelectedContact);
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useUserStore((state) => state.currentUser);

  const filteredContacts = contacts?.filter((contact) =>
    contact?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {}, [currentUser]);

  const isDark = theme === "dark";

  return (
    <div
      className={`w-full h-screen flex flex-col border-r transition-colors duration-200 ${
        isDark
          ? "bg-[#1a0a10] border-[#3d1a26]"
          : "bg-[#FFF0F5] border-[#F8BBD0]"
      }`}
    >
      {/* ── Header ── */}
      <div className="px-5 pt-6 pb-3 flex justify-between items-center">
        <div>
          <h2
            className={`text-2xl font-semibold tracking-tight ${
              isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
            }`}
          >
            Chats
          </h2>
          <p
            className={`text-xs mt-0.5 ${
              isDark ? "text-[#C2185B]" : "text-[#AD1457]"
            }`}
          >
            {filteredContacts?.length ?? 0} conversations
          </p>
        </div>
        <button
          className="w-10 h-10 bg-[#C2185B] hover:bg-[#AD1457] active:scale-95 rounded-full flex items-center justify-center shadow-md shadow-pink-300/30 transition-all duration-150"
          aria-label="New chat"
        >
          <FaPlus className="text-white text-sm" />
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-3">
        <div className="relative">
          <FaSearch
            className={`absolute left-3.5 top-1/2 -translate-y-1/2 text-sm ${
              isDark ? "text-[#F48FB1]" : "text-[#F48FB1]"
            }`}
          />
          <input
            type="text"
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#C2185B]/30 ${
              isDark
                ? "bg-[#2d0f1c] border border-[#3d1a26] text-[#F8BBD0] placeholder-[#7d3a50] focus:border-[#C2185B] focus:bg-[#3a1525]"
                : "bg-white border border-[#F8BBD0] text-[#4A1528] placeholder-[#F48FB1] focus:border-[#C2185B] focus:bg-white"
            }`}
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* ── Divider ── */}
      <div
        className={`mx-4 mb-1 h-px ${
          isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"
        }`}
      />

      {/* ── Contact List ── */}
      <div className="flex-1 overflow-y-auto scrollbar-hide">
        {filteredContacts?.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 gap-2">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center ${
                isDark ? "bg-[#2d0f1c]" : "bg-[#FCE4EC]"
              }`}
            >
              <FaSearch
                className={`text-lg ${
                  isDark ? "text-[#F48FB1]" : "text-[#F48FB1]"
                }`}
              />
            </div>
            <p
              className={`text-sm ${
                isDark ? "text-[#7d3a50]" : "text-[#AD1457]"
              }`}
            >
              No contacts found
            </p>
          </div>
        )}

        {filteredContacts?.map((contact, idx) => {
          const isSelected = selectedContact?._id === contact?._id;
          const hasUnread =
            contact?.conversation?.unreadCount > 0;

          return (
            <motion.div
              key={contact._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.2, delay: idx * 0.03 }}
              onClick={() => setSelectedContact(contact)}
              className={`relative mx-2 my-0.5 px-3 py-3 rounded-xl cursor-pointer flex items-center gap-3 transition-all duration-150 ${
                isSelected
                  ? isDark
                    ? "bg-[#3d1a26] border border-[#C2185B]/40"
                    : "bg-[#FCE4EC] border border-[#F48FB1]/60"
                  : isDark
                  ? "hover:bg-[#2d0f1c] border border-transparent"
                  : "hover:bg-white border border-transparent hover:border-[#F8BBD0]"
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <img
                  className={`h-11 w-11 rounded-full object-cover border-2 transition-all ${
                    isSelected
                      ? "border-[#C2185B]"
                      : isDark
                      ? "border-[#3d1a26]"
                      : "border-[#F8BBD0]"
                  }`}
                  src={
                    contact?.profilePicture ||
                    "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix"
                  }
                  alt={contact.username}
                />
                {/* Online dot — placeholder, wire up as needed */}
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline gap-1">
                  <h2
                    className={`font-semibold text-sm truncate ${
                      isDark ? "text-[#F8BBD0]" : "text-[#4A1528]"
                    }`}
                  >
                    {contact.username}
                  </h2>
                  {contact?.conversation && (
                    <span
                      className={`text-xs flex-shrink-0 ${
                        isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"
                      }`}
                    >
                      {formatTimestamp(
                        contact?.conversation?.lastMessage?.createdAt
                      )}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-center gap-1 mt-0.5">
                  <p
                    className={`text-xs truncate ${
                      hasUnread
                        ? isDark
                          ? "text-[#F8BBD0] font-medium"
                          : "text-[#4A1528] font-medium"
                        : isDark
                        ? "text-[#7d3a50]"
                        : "text-[#AD1457]/60"
                    }`}
                  >
                    {contact?.conversation?.lastMessage?.content || "Start a conversation"}
                  </p>
                  {hasUnread && (
                    <span className="flex-shrink-0 min-w-[20px] h-5 px-1.5 bg-[#C2185B] text-white text-xs font-semibold rounded-full flex items-center justify-center">
                      {contact.conversation.unreadCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Selected accent bar */}
              {isSelected && (
                <motion.div
                  layoutId="activeBar"
                  className="absolute left-0 top-2 bottom-2 w-1 bg-[#C2185B] rounded-r-full"
                />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Current User Footer ── */}
      {currentUser && (
        <div
          className={`px-4 py-3 border-t flex items-center gap-3 ${
            isDark
              ? "border-[#3d1a26] bg-[#2d0f1c]"
              : "border-[#F8BBD0] bg-white"
          }`}
        >
          <img
            className="h-9 w-9 rounded-full object-cover border-2 border-[#F48FB1]"
            src={
              currentUser?.profilePicture ||
              "https://api.dicebear.com/6.x/avataaars/svg?seed=You"
            }
            alt="You"
          />
          <div className="flex-1 min-w-0">
            <p
              className={`text-sm font-semibold truncate ${
                isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
              }`}
            >
              {currentUser?.username}
            </p>
            <p
              className={`text-xs ${
                isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"
              }`}
            >
              {currentUser?.email}
            </p>
          </div>
          <div className="w-2 h-2 rounded-full bg-green-400 flex-shrink-0" />
        </div>
      )}
    </div>
  );
};

export default Chatlist;