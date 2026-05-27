import React, { useEffect, useState } from "react";
import useLayoutStore from "../store/useLayoutStore";
import { useLocation, Link } from "react-router-dom";
import useThemeStore from "../store/useThemeStore";
import { FaCog, FaUserCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { MdRadioButtonChecked } from "react-icons/md";
import { HiChatBubbleLeftRight } from "react-icons/hi2";
import useUserStore from "../store/useUserStore";

// ── Moved OUTSIDE Sidebar so it's never recreated on re-render ──────────────
const NavButton = ({
  tab,
  href,
  icon: Icon,
  label,
  isProfile = false,
  isActive,
  isDark,
  isMobile,
  profilePicture,
}) => (
  <Link
    to={href}
    aria-label={label}
    className={`relative flex items-center justify-center transition-all duration-200 focus:outline-none group ${
      isMobile ? "flex-col gap-0.5" : "w-full"
    }`}
  >
    {/* Active bar — left (desktop) or top (mobile) */}
    {isActive && !isMobile && (
      <motion.div
        layoutId="activeBar"
        className="absolute left-0 top-1/8 -translate-y-1/2 w-1 h-8 bg-[#C2185B] rounded-r-full"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}
    {isActive && isMobile && (
      <motion.div
        layoutId="activeBarMobile"
        className="absolute top-0 left-1/8 -translate-x-1/2 h-0.5 w-8 bg-[#C2185B] rounded-full"
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
      />
    )}

    <div
      className={`flex items-center justify-center rounded-xl w-10 h-10 transition-all duration-200 ${
        isActive
          ? isDark
            ? "bg-[#3d1a26]"
            : "bg-[#FCE4EC]"
          : isDark
          ? "hover:bg-[#2d0f1c]"
          : "hover:bg-[#FFF0F5]"
      }`}
    >
      {isProfile ? (
        profilePicture ? (
          <img
            src={profilePicture}
            alt="Profile"
            className={`w-8 h-8 rounded-full object-cover border-2 transition ${
              isActive ? "border-[#C2185B]" : "border-[#F48FB1]"
            }`}
          />
        ) : (
          <FaUserCircle
            className={`w-5 h-5 transition ${
              isActive
                ? "text-[#C2185B]"
                : isDark
                ? "text-[#7d3a50] group-hover:text-[#F48FB1]"
                : "text-[#F48FB1] group-hover:text-[#C2185B]"
            }`}
          />
        )
      ) : (
        <Icon
          className={`w-5 h-5 transition ${
            isActive
              ? "text-[#C2185B]"
              : isDark
              ? "text-[#7d3a50] group-hover:text-[#F48FB1]"
              : "text-[#F48FB1] group-hover:text-[#C2185B]"
          }`}
        />
      )}
    </div>

    {/* Label — mobile only */}
    {isMobile && (
      <span
        className={`text-[10px] font-medium transition ${
          isActive
            ? "text-[#C2185B]"
            : isDark
            ? "text-[#7d3a50]"
            : "text-[#F48FB1]"
        }`}
      >
        {label}
      </span>
    )}
  </Link>
);

// ── Sidebar ──────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { tab: "chats",  href: "/",       icon: HiChatBubbleLeftRight, label: "Chats"   },
  { tab: "update", href: "/update", icon: MdRadioButtonChecked,  label: "Updates" },
];

const Sidebar = () => {
  const selectedContact = useLayoutStore((state) => state.selectedContact);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { theme } = useThemeStore();
  const { activeTab, setActiveTab } = useLayoutStore();
  const { currentUser } = useUserStore();
  const isDark = theme === "dark";

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const map = {
      "/":             "chats",
      "/update":       "update",
      "/user-profile": "user-profile",
      "/settings":     "settings",
    };
    if (map[location.pathname]) setActiveTab(map[location.pathname]);
  }, [location.pathname, setActiveTab]);

  if (isMobile && selectedContact) return null;

  const shared = { isDark, isMobile, profilePicture: currentUser?.profilePicture };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={`flex items-center transition-colors duration-200 ${
        isMobile
          ? "fixed bottom-0 left-0 right-0 h-16 flex-row justify-around px-2 border-t"
          : "w-16 h-screen flex-col py-5 border-r"
      } ${
        isDark ? "bg-[#1a0a10] border-[#3d1a26]" : "bg-white border-[#F8BBD0]"
      }`}
    >
      {/* Brand logo (desktop only) */}
      {!isMobile && (
        <div className="mb-6 flex-shrink-0">
          <div className="w-10 h-10 bg-[#C2185B] rounded-xl flex items-center justify-center shadow-md shadow-pink-300/30">
            <HiChatBubbleLeftRight className="w-5 h-5 text-white" />
          </div>
        </div>
      )}

      <div
        className={`flex ${
          isMobile
            ? "flex-row items-center gap-1 flex-1 justify-around"
            : "flex-col items-center gap-2 w-full"
        }`}
      >
        {/* Main nav */}
        {NAV_ITEMS.map((item) => (
          <NavButton
            key={item.tab}
            {...item}
            {...shared}
            isActive={activeTab === item.tab}
          />
        ))}

        {/* Spacer (desktop) */}
        {!isMobile && <div className="flex-1" />}

        {/* Profile */}
        <NavButton
          tab="user-profile"
          href="/user-profile"
          label="Profile"
          isProfile
          isActive={activeTab === "user-profile"}
          {...shared}
        />

        {/* Settings */}
        <NavButton
          tab="settings"
          href="/settings"
          icon={FaCog}
          label="Settings"
          isActive={activeTab === "settings"}
          {...shared}
        />
      </div>
    </motion.div>
  );
};

export default Sidebar;