import React, { useEffect, useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import useStatusStore from "../../store/useStatusStore";
import { create } from "zustand";
import StatusPreview from "./StatusPreview";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { FaCamera, FaEllipsisH, FaPlus } from "react-icons/fa";
import formatTimestamp from "../../utils/Data";
import StatusList from "./StatusList";

const Status = () => {
  const [previewContact, setPreviewContact] = useState(null);
  const [currentStatusIndex, setcurrentStatusIndex] = useState(0);
  const [showOption, setShowOption] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [filePreview, setFilePreview] = useState(null);

  const { theme } = useThemeStore();
  const { currentUser } = useUserStore();
  const {
    statuses,
    loading,
    error,
    fetchStatuses,
    createStatus,
    viewStatus,
    deleteStatus,
    getStatusViewers,
    getUserStatuses,
    getOtherStatuses,
    clearError,
    reset,
    initializeSocket,
    cleanupSocket,
  } = useStatusStore();
  const userStatuses = getUserStatuses(currentUser._id);
  const otherStatuses = getOtherStatuses(currentUser._id);

  useEffect(() => {
    fetchStatuses();
    initializeSocket();

    return () => {
      cleanupSocket();
    };
  }, [currentUser?._id]);

  //clear the error when the page is unmount
  useEffect(() => {
    return () => clearError();
  }, []);

  const handleCreateStatus = async () => {
    if (!newStatus.trim() && !selectedFile) return;
    try {
      await createStatus({ content: newStatus, file: selectedFile });

      setNewStatus("");
      setSelectedFile(null);
      setFilePreview(null);
      setShowCreateModal(false);
    } catch (error) {
      console.error("Error Creating status ", error);
    }
  };

  const handleViewStatus = async (statusId) => {
    try {
      await viewStatus(statusId);
    } catch (error) {
      console.error("Error in viewing status", error);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteStatus(statusId);
      setShowOption(false);
      handlePreviewClose();
    } catch (error) {
      console.error("Error in deleting status", error);
    }
  };

  const handlePreviewClose = () => {
    setPreviewContact(null);
    setcurrentStatusIndex(0);
  };

  const handlePreviewNext = () => {
    if (currentStatusIndex < previewContact.statuses.length - 1) {
      setcurrentStatusIndex((prev) => prev + 1);
    } else {
      handlePreviewClose();
    }
  };
  const handlePreviewPrev = () => {
    setcurrentStatusIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStatusPreview = (contact, statusIndex = 0) => {
    setPreviewContact(contact);
    setcurrentStatusIndex(statusIndex);
    if (contact.statuses[statusIndex]) {
      handleViewStatus(contact.statuses[statusIndex].id);
    }
  };
  const handleFileChange = (e)=>{
    const file = e.target.files[0];
    if(file){
    setSelectedFile(file);
    if(file.type.startsWith("image/") || file.type.startsWith("video/")){
      setFilePreview(URL.createObjectURL(file))
    }
    }
  }

  return (
    <Layout
      isStatusPreviewOpen={!!previewContact}
      statusPreviewContent={
        previewContact && (
          <StatusPreview
            contact={previewContact}
            currentIndex={currentStatusIndex}
            onClose={handlePreviewClose}
            onNext={handlePreviewNext}
            onPrev={handlePreviewPrev}
            onDelete={handleDeleteStatus}
            theme={theme}
            currentUser={currentUser}
            loading={loading}
          />
        )
      }
    >
      <motion.div
        className={` flex-col h-screen border-r ${
          theme === "dark"
            ? "bg-[rgb(12,19,24)] border-gray-600"
            : " bg-gray-100 text-black"
        }`}
      >
        <div
          className={`flex justify-between items-center shadow-md ${
            theme === "dark" ? "bg-[rgb(17,27,33)]" : "bg-white"
          } p-4`}
        >
          <h2 className="text-2xl font-bold">Updates</h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mx-4 mt-2">
            <span className="block sm:inline">{error}</span>
            <button
              className="float-right text-red-500 hover:text-red-700"
              onClick={clearError}
            >
              <RxCross2 className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto h-[calc(100vh-64px)]">
          <div
            className={`flex p-3 space-x-4 shadow-md ${
              theme === "dark" ? "bg-[rgb(17,27,33)]" : "bg-white"
            } `}
          >
            <div
              className="relative cursor-pointer"
              onClick={() =>{
                userStatuses
                  ? handleStatusPreview(userStatuses)
                  : setShowCreateModal(true)
              }}
            >
              <img
                src={currentUser?.profilePicture}
                alt={currentUser.username}
                className="w-12 h-12 rounded-full object-cover"
              />
              {userStatuses ? (
                <>
                  <svg
                    className="absolute top-0 left-0 w-12 h-12"
                    viewBox="0 0 100 100"
                  >
                    {userStatuses.statuses.map((_, index) => {
                      const circumference = 2 * Math.PI * 48;
                      const segmentLength =
                        circumference / userStatuses.statuses.length;
                      const offset = index * segmentLength;
                      return (
                        <circle
                          key={index}
                          cx="50"
                          cy="50"
                          r="48"
                          fill="none"
                          stroke="#25D366"
                          strokeWidth="4"
                          strokeDasharray={`${segmentLength - 5} 5`}
                          strokeDashoffset={-offset}
                          transform={`rotate(-90 50 50)`}
                        />
                      );
                    })}
                  </svg>
                  <button
                    className="absolute bottom-0 right-0 bg-pink-500 text-white p-1 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(true);
                    }}
                  >
                    <FaPlus className="h-2 w-2 " />
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="absolute bottom-0 right-0 bg-pink-500 text-white p-1 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowCreateModal(false);
                    }}
                  >
                    <FaPlus className="h-2 w-2 " />
                  </button>
                </>
              )}
            </div>
            <div className="flex flex-col items-start flex-1">
              <p className="font-semibold">My Updates</p>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                {userStatuses
                  ? `${userStatuses.statuses.length} update${
                      userStatuses?.statuses.length > 1 ? "s" : ""
                    } ${formatTimestamp(
                      userStatuses.statuses[userStatuses.statuses.length - 1]
                        .timeStamp
                    )}`
                  : "Tap to add Updates"}
              </p>
            </div>
            {userStatuses && (
              <button
                className="ml-auto"
                onClick={() => setShowOption(!showOption)}
              >
                <FaEllipsisH
                  className={`h-5 w-5 ${
                    theme === "dark" ? "text-gray-400" : "text-gray-500"
                  }`}
                />
              </button>
            )}
          </div>
          {/* options menu  */}
          {showOption && userStatuses && (
            <div
              className={`p-2 shadow-md ${
                theme === "dark" ? "bg-[rgb(17,27,33)]" : "bg-white"
              } `}
            >
              <button
                onClick={() => {
                  setShowCreateModal(true);
                  setShowOption(false);
                }}
                className="w-full text-left text-blue-500 py-2 hover:bg-gray-100 px-2 rounded flex items-center"
              >
                <FaCamera className="inline-block mr-2" />
                Add Updates
              </button>
              <button
                onClick={() => {
                  handleStatusPreview(userStatuses);
                  setShowOption(false);
                }}
                className="w-full text-left text-blue-500 py-2 hover:bg-gray-`00 px-2 rounded flex items-center"
              >
                View Updates
              </button>
            </div>
          )}
          {loading && (
            <div className="flex justify-center items-center p-8 ">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-500"></div>
            </div>
          )}
          {/* recent updates from other users  */}
          {!loading && otherStatuses.length > 0 && (
            <div
              className={` p-4 space-y-4 shadow-md mt-4 ${
                theme === "dark" ? "bg-[rgb(17,27,33)]" : "bg-white"
              }`}
            >
              <h3
                className={`font-semibold ${
                  theme === "dark" ? "text-gray-400" : "text-gray-500"
                }`}
              >
                Recent Update
              </h3>
              {otherStatuses.map((contact, index) => {
                return (
                  <React.Fragment key={contact?.id}>
                    <StatusList
                      contact={contact}
                      onPreview={() => handleStatusPreview(contact)}
                      theme={theme}
                    />
                    {index < otherStatuses.length - 1 && (
                      <hr
                        className={`${
                          theme === "dark"
                            ? "border-gray-700"
                            : "border-gray-200"
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
          {/* empty state  */}
          {!loading && statuses.length === 0 && (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <div
                className={`text-6xl mb-4 ${
                  theme === "dark" ? "text-gray-600" : "text-gray-300"
                }`}
              >
                📱
              </div>
              <h3
                className={`text-lg font-semibold mb-2 ${
                  theme === "dark" ? "text-gray-400" : "text-gray-600"
                }`}
              >
                No Updates yet
              </h3>
              <p
                className={`text-sm ${
                  theme === "dark" ? "text-gray-500" : "text-gray-600"
                }`}
              >
                Be the first to share an upate
              </p>
            </div>
          )}
        </div>

        {showCreateModal && (
          <div className="flex inset-0 bg-black bg-opacity-50 fixed items-center justify-center z-50">
            <div
              className={`p-6 rounded-lg max-w-md w-full mx-4 ${
                theme === "dark" ? "bg-gray-800" : "bg-white"
              }`}
            >
              <h3
                className={`text-lg font-semibold  ${
                  theme === "dark" ? "text-white" : "text-black"
                }`}
              >
                Create Status
              </h3>
              {filePreview && (
                <div className="mb-4">
                  {selectedFile?.type.startsWith("video/") ? (
                    <video
                      src={filePreview}
                      controls
                      className="w-full h-32 object-cover rounded"
                    />
                  ) : (
                    <img
                      src={filePreview}
                      alt="file-preview"
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                </div>
              )}
              <textarea
                id="status"
                name="status"
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                placeholder="What's on your mind"
                className={`w-full p-3 border rounded-lg mb-4 ${
                  theme === "dark"
                    ? "bg-gray-700 text-white border-gray-600"
                    : "bg-white text-black border-gray-300"
                }`}
                rows={3}
              />
            <input type="file" accept="image/*,video/*" onChange={handleFileChange} className="mb-4"/>
            <div className="flex justify-end space-x-3 ">
              <button onClick={()=>{
                setShowCreateModal(false);
                setNewStatus("");
                setSelectedFile(null);
                setFilePreview(null);
              }}
              disabled={loading}
              className="px-4 py-2 text-gray-500  hover:bg-red-500 hover:text-white rounded-md">
                 Cancel
              </button>
              <button onClick={handleCreateStatus}
                disabled={loading || (!newStatus.trim() && !selectedFile)}
                className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
              >
                {loading ? "Creating" : "Create"}
              </button>
            </div>
             </div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Status;
