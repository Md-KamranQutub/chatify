import React, { useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import {
  FaSearch,
  FaQuestion,
  FaUser,
  FaComment,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaChevronRight,
} from "react-icons/fa";
import { Link } from "react-router-dom";
import { logout } from "../../services/user.service";

const Setting = () => {
  const [isThemeDialogueOpen, setIsThemeDialogOpen] = useState(false);
  const { theme } = useThemeStore();
  const { currentUser, clearCurrentUser } = useUserStore();
  const isDark = theme === "dark";

  const toggleThemeDialogue = () => setIsThemeDialogOpen(!isThemeDialogueOpen);

  const handleLogOut = async () => {
    try {
      await logout();
      clearCurrentUser();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Failed to logout", error);
    }
  };

  const menuItems = [
    { icon: FaUser,    label: "Account", href: "/user-profile",  desc: "Privacy, security, change number" },
    { icon: FaComment, label: "Chats",   href: "/",              desc: "Theme, wallpapers, chat history" },
    { icon: FaQuestion,label: "Help",    href: "/help",           desc: "FAQ, contact us, privacy policy" },
  ];

  return (
    <Layout
      isThemeDialogueOpen={isThemeDialogueOpen}
      toggleThemeDialogue={toggleThemeDialogue}
    >
      <div
        className={`flex h-screen transition-colors duration-200 ${
          isDark ? "bg-[#1a0a10]" : "bg-[#FFF0F5]"
        }`}
      >
        <div
          className={`w-[400px] h-full flex flex-col border-r ${
            isDark ? "border-[#3d1a26] bg-[#1a0a10]" : "border-[#F8BBD0] bg-[#FFF0F5]"
          }`}
        >
          {/* ── Header ── */}
          <div className="px-5 pt-6 pb-4">
            <h1
              className={`text-2xl font-semibold tracking-tight mb-4 ${
                isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
              }`}
            >
              Settings
            </h1>

            {/* Search */}
            <div className="relative">
              <FaSearch
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-[#F48FB1]"
              />
              <input
                type="text"
                placeholder="Search settings..."
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm border transition focus:outline-none focus:ring-2 focus:ring-[#C2185B]/30 ${
                  isDark
                    ? "bg-[#2d0f1c] border-[#3d1a26] text-[#F8BBD0] placeholder-[#7d3a50] focus:border-[#C2185B]"
                    : "bg-white border-[#F8BBD0] text-[#4A1528] placeholder-[#F48FB1] focus:border-[#C2185B]"
                }`}
              />
            </div>
          </div>

          {/* ── Profile card ── */}
          <div className="px-4 mb-3">
            <div
              className={`flex items-center gap-4 p-3 rounded-2xl border transition cursor-pointer ${
                isDark
                  ? "bg-[#2d0f1c] border-[#3d1a26] hover:border-[#C2185B]/40"
                  : "bg-white border-[#F8BBD0] hover:border-[#F48FB1]"
              }`}
            >
              <div className="relative flex-shrink-0">
                <img
                  src={
                    currentUser?.profilePicture ||
                    "https://api.dicebear.com/6.x/avataaars/svg?seed=You"
                  }
                  alt="Profile"
                  className="h-14 w-14 rounded-full object-cover border-2 border-[#F48FB1]"
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <h2
                  className={`font-semibold text-sm truncate ${
                    isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
                  }`}
                >
                  {currentUser?.username}
                </h2>
                <p
                  className={`text-xs mt-0.5 truncate ${
                    isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"
                  }`}
                >
                  {currentUser?.about || "Hey there! I am using Chatify."}
                </p>
              </div>
              <FaChevronRight
                className={`flex-shrink-0 text-xs ${
                  isDark ? "text-[#7d3a50]" : "text-[#F48FB1]"
                }`}
              />
            </div>
          </div>

          {/* ── Divider ── */}
          <div className={`mx-4 mb-2 h-px ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />

          {/* ── Menu items ── */}
          <div className="flex-1 overflow-y-auto px-4 space-y-1">
            {menuItems.map((item) => (
              <Link
                to={item.href}
                key={item.label}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition group ${
                  isDark
                    ? "hover:bg-[#2d0f1c] hover:border-[#3d1a26]"
                    : "hover:bg-white hover:border-[#F8BBD0]"
                }`}
              >
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDark ? "bg-[#3d1a26]" : "bg-[#FCE4EC]"
                  }`}
                >
                  <item.icon
                    className={`text-sm ${
                      isDark ? "text-[#F48FB1]" : "text-[#C2185B]"
                    }`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className={`text-sm font-medium ${
                      isDark ? "text-[#F8BBD0]" : "text-[#4A1528]"
                    }`}
                  >
                    {item.label}
                  </p>
                  <p
                    className={`text-xs mt-0.5 truncate ${
                      isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
                    }`}
                  >
                    {item.desc}
                  </p>
                </div>
                <FaChevronRight
                  className={`flex-shrink-0 text-xs transition group-hover:translate-x-0.5 ${
                    isDark ? "text-[#7d3a50]" : "text-[#F48FB1]"
                  }`}
                />
              </Link>
            ))}

            {/* Theme toggle */}
            <button
              onClick={toggleThemeDialogue}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border border-transparent transition group text-left ${
                isDark
                  ? "hover:bg-[#2d0f1c] hover:border-[#3d1a26]"
                  : "hover:bg-white hover:border-[#F8BBD0]"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-[#3d1a26]" : "bg-[#FCE4EC]"
                }`}
              >
                {isDark ? (
                  <FaMoon className="text-sm text-[#F48FB1]" />
                ) : (
                  <FaSun className="text-sm text-[#C2185B]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isDark ? "text-[#F8BBD0]" : "text-[#4A1528]"
                  }`}
                >
                  Theme
                </p>
                <p
                  className={`text-xs mt-0.5 ${
                    isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
                  }`}
                >
                  {isDark ? "Dark mode" : "Light mode"}
                </p>
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${
                  isDark
                    ? "bg-[#3d1a26] text-[#F48FB1]"
                    : "bg-[#FCE4EC] text-[#C2185B]"
                }`}
              >
                {isDark ? "Dark" : "Light"}
              </span>
            </button>
          </div>

          {/* ── Divider ── */}
          <div className={`mx-4 my-2 h-px ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />

          {/* ── Logout ── */}
          <div className="px-4 pb-5">
            <button
              onClick={handleLogOut}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl border transition group ${
                isDark
                  ? "border-[#3d1a26] hover:bg-[#2d0f1c] hover:border-red-900/40"
                  : "border-[#F8BBD0] bg-white hover:border-red-200 hover:bg-red-50"
              }`}
            >
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                  isDark ? "bg-red-900/30" : "bg-red-50"
                }`}
              >
                <FaSignOutAlt className="text-sm text-red-500" />
              </div>
              <span className="text-sm font-medium text-red-500">Log out</span>
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setting;