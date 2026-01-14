import React, { useEffect, useState } from "react";
import useLayoutStore from "../../store/useLayoutStore";
import useThemeStore from "../../store/useThemeStore";
import { FaPlus, FaSearch, FaUser } from "react-icons/fa";
import formatTimestamp from "../../utils/Data";
import { motion } from "framer-motion";
import useUserStore from "../../store/useUserStore";

const Chatlist = ({ contacts }) => {
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const { theme } = useThemeStore();
  const [searchTerm, setSearchTerm] = useState("");
  const currentUser = useUserStore((state)=>state.currentUser)
  const filteredContacts = contacts?.filter((contact) =>
    contact?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  useEffect(() => {
    // console.log("this is currentUser",currentUser);
  }, [currentUser])
  
  return (
    <div
      className={`w-full h-screen border-r ${
        theme === "dark"
          ? "bg-[rgb(17,27,33)] border-gray-600"
          : "bg-white border-gray-200"
      }`}
    >
      <div className="p-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold ">Chats</h2>
        <div className="bg-pink-400 p-2 rounded-full cursor-pointer hover:bg-pink-500">
          <FaPlus className="text-white" />
        </div>
      </div>
      <div className="relative p-4">
        <FaSearch className="absolute top-1/2 left-8 transform -translate-y-1/2 text-gray-600" />
        <input
          type="text"
          className=" text-lg w-full bg-gray-200 pl-12 py-3 pr-2 rounded-full text-black focus:outline-none ring-pink-300 focus:ring-2"
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="chats h-[calc(100vh-120px)] overflow-y-auto">
        {filteredContacts?.map((contact) => {
          return (
            <motion.div
              key={contact._id}
              className={`p-3 hover:bg-gray-100 cursor-pointer flex items-center border-t-gray-100 ${
                (selectedContact?._id == contact?._id)
                  ? "bg-gray-200"
                  : ""
              }`}
              onClick={()=>setSelectedContact(contact)}
            >
              <img
                className="h-12 w-12 rounded-full"
                src={
                  contact?.profilePicture ||
                  "https://api.dicebear.com/6.x/avataaars/svg?seed=Felix"
                }
                alt="profilePic"
              />
              <div className="ml-3 flex-1">
                <div className="flex justify-between items-baseline">
                  <h2 className={`font-semibold text-black ${theme === "dark" ? "text-white" : "text-black"}`}>
                    {contact.username}
                  </h2>
                  {contact?.conversation && (
                    <span className={`text-sm text-gray-500`}>
                      {formatTimestamp(
                        contact?.conversation?.lastMessage?.createdAt
                      )}
                    </span>
                  )}
                </div>
                <div className="flex justify-between items-baseline">
                  <p
                    className={`text-sm ${
                      theme === "dark" ? "text-gray-400" : "text-gray-500"
                    } truncate`}
                  >
                    {contact?.conversation?.lastMessage?.content}
                  </p>
                  {contact?.conversation &&
                    contact?.conversation?.unreadCount > 0 && contact?.conversation?.lastMessage?.receiver?._id === currentUser?._id &&
                     (
                      <p
                        className={`text-sm font-semibold w-6 h-6 flex rounded-full m-1 items-center justify-center bg-pink-600 ${
                          theme === "dark" ? "text-gray-400" : "text-white"
                        } truncate`}
                      >
                        {contact?.conversation?.unreadCount}
                      </p>
                    )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default Chatlist;
