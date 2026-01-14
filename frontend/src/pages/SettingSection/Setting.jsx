import React, { useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import { toast } from "react-toastify";
import Layout from "../../components/Layout";
import { FaSearch,FaQuestion, FaUser, FaComment, FaSignInAlt, FaMoon, FaSun} from "react-icons/fa";
import { Link } from "react-router-dom";
import { logout } from "../../services/user.service";

const Setting = () => {
  const [isThemeDialogueOpen, setIsThemeDialogOpen] = useState(false);
  const { theme } = useThemeStore();
  const { currentUser, clearUser } = useUserStore();
  const toggleThemeDialogue = () => {
    setIsThemeDialogOpen(!isThemeDialogueOpen);
  };
  const handleLogOut = async () => {
    try {
      await logout();
      clearUser();
      toast.success("User logged out successfully");
    } catch (error) {
      console.error("Failed to logout ", error);
    }
  };
  return (
    <Layout
      isThemeDialogueOpen={isThemeDialogueOpen}
      toggleThemeDialogue={toggleThemeDialogue}
    >
      <div
        className={`flex h-screen ${
          theme === "dark"
            ? "bg-[rgb(17,27,33)] text-white"
            : "bg-white text-black"
        }`}
      >
        <div
          className={`w-[400px] border-r ${
            theme === "dark" ? "border-gray-600" : "border-gray-200"
          }`}
        >
          <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">Settings</h1>
            <div className="relative mb-4">
              <FaSearch className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search Settings"
                className={`w-full ${
                  theme === "dark"
                    ? "bg-[#202c33] text-white"
                    : "bg-gray-100 text-black"
                } border-none pl-10  rounded-full p-2`}
              />
            </div>
            <div
              className={`flex items-center gap-4 p-3 ${
                theme === "dark" ? "hover:bg-[#202c33]" : "hover:bg-gray-100"
              }`}
            >
              <img
                src={currentUser?.profilePicture}
                alt="Profile"
                className="h-14 w-14 rounded-full"
              />
              <div>
                <h2 className="font-semibold">{currentUser?.username}</h2>
                <p className="text-sm text-gray-400">
                  {currentUser?.about ? currentUser?.about : "No About"}
                </p>
              </div>
            </div>
            {/* menu items */}
            <div className="h-[calc(100vh-280px)] overflow-y-auto">
              <div className="space-y-1">
                {[
                  { icon: FaUser, lable: "Account", href: "/user-profile" },
                  { icon: FaComment, lable: "Chats", href: "/" },
                  { icon: FaQuestion, lable: "Help", href: "/help" },
                ].map((item) => {
                  return <Link
                    to={item.href}
                    key={item.lable}
                    className={`w-full flex items-center gap-3 p-2 rounded ${
                      theme === "dark"
                        ? "text-white hover:bg-[#202c33]"
                        : "text-black hover:bg-gray-100"
                    }`}
                  >
                    <item.icon className="h-5 w-5 " />
                    <div
                      className={`border-b ${
                        theme === "dark" ? "border-gray-700" : "border-gray-200"
                      } w-full p-4`}
                    >
                      {item.lable}
                    </div>
                  </Link>;
                })}
                {/* theme button  */}
                <button
                  onClick={toggleThemeDialogue}
                  className={`w-full flex items-center gap-3 p-2 ${
                    theme === "dark"
                      ? "text-white  hover:bg-[#202c33]"
                      : "text-black hover:bg-gray-100"
                  }`}
                >
                  {theme === "dark" ? (
                    <FaMoon className="h-5 w-5" />
                  ) : (
                    <FaSun className="h-5 w-5" />
                  )}
                  <div
                    className={`flex flex-col text-start border-b ${
                      theme === "dark"
                        ? "border-gray-700"
                        : "border-gray-200 w-full p-2"
                    }`}
                  >
                    Theme
                    <span className="ml-auto text-sm text-gray-400">
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </span>
                  </div>
                </button>
              </div>
              <button
                className={`w-full flex items-center gap-3 p-2 rounded text-red-500 ${
                  theme === "dark"
                    ? "text-white hover:bg[#202c33]"
                    : " text-black hover:bg-gray-100"
                } mt-10 md:mt-36`}
                onClick={handleLogOut}
              >
                <FaSignInAlt className="h-5 w-5" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Setting;
