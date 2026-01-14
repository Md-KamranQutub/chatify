import React, { useEffect, useState } from "react";
import useLayoutStore from "../store/useLayoutStore";
import { useLocation, Link } from "react-router-dom";
import useThemeStore from "../store/useThemeStore";
import { FaCog, FaUserCircle, FaWhatsapp } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdRadioButtonChecked } from "react-icons/md";
import useUserStore from "../store/useUserStore";

const Sidebar = () => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const setSelectedContact = useLayoutStore(
    (state) => state.setSelectedContact
  );
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme, setTheme } = useThemeStore();
  const { activeTab, setActiveTab } = useLayoutStore();
  const {currentUser} = useUserStore();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  useEffect(() => {
    if (location.pathname === "/") setActiveTab("chats");
    else if (location.pathname === "/update") setActiveTab("update");
    else if (location.pathname === "/user-profile")
      setActiveTab("user-profile");
    else if (location.pathname === "/settings") setActiveTab("settings");
  }, [location, setActiveTab]);
  if (isMobile && selectedContact) return null;
  const SideBarContent = (
    <>
      <Link
        to="/"
        className={`${isMobile ? "" : "mb-8"} ${
          activeTab === "chats" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
        } focus:outline-none`}
      >
        <FaWhatsapp
          className={` ${
            activeTab === "chats"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        />
      </Link>
       <Link
        to="/update"
        className={`${isMobile ? "" : "mb-8"} ${
          activeTab === "update" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
        } focus:outline-none`}
      >
        <MdRadioButtonChecked
          className={` ${
            activeTab === "update"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        />
      </Link>
      {!isMobile && <div className="flex-grow"/>}
      <Link
        to="/user-profile"
        className={`${isMobile ? "" : "mb-8"} ${
          activeTab === "user-profile" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
        } focus:outline-none`}>
        {currentUser.profilePicture ? <img className=" h-10 w-10 object-fill rounded-full" src={currentUser.profilePicture} alt="profilePicture" />:
        <FaUserCircle
          className={` ${
            activeTab === "user-profile"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-600"
          }`}
        />}
      </Link>
      <Link
        to="/settings"
        className={`${isMobile ? "" : "mb-8"} ${
          activeTab === "settings" ? "bg-gray-300 shadow-sm p-2 rounded-full" : ""
        } focus:outline-none`}
      >
        <FaCog
          className={` ${
            activeTab === "settings"
              ? theme === "dark"
                ? "text-gray-800"
                : ""
              : theme === "dark"
              ? "text-gray-300"
              : "text-gray-600"
          } h-8 w-8`}
        />
      </Link>
    </>
  );
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex bg-opacity-90 items-center py-4 shadow-lg ${
        isMobile
          ? "fixed bottom-0 left-0 right-0 h-16 flex-row justify-around"
          : "w-16 h-screen flex-col justify-between border-r-2"
      } ${
        theme === "dark"
          ? "bg-gray-800 border-gray-600"
          : "bg-[rgb(239,242,254)] border-gray-300"
      }`}
    >
      {SideBarContent}
    </motion.div>
  );
};

export default Sidebar;
