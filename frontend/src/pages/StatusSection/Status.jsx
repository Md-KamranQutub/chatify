import React, { useEffect, useState } from "react";
import useThemeStore from "../../store/useThemeStore";
import useUserStore from "../../store/useUserStore";
import useStatusStore from "../../store/useStatusStore";
import StatusPreview from "./StatusPreview";
import Layout from "../../components/Layout";
import { motion } from "framer-motion";
import { RxCross2 } from "react-icons/rx";
import { FaCamera, FaEllipsisH, FaPlus, FaImages } from "react-icons/fa";
import formatTimestamp from "../../utils/Data";
import StatusList from "./StatusList";

const Status = () => {
  const [previewContact, setPreviewContact] = useState(null);
  const [currentStatusIndex, setCurrentStatusIndex] = useState(0);
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
    getUserStatuses,
    getOtherStatuses,
    clearError,
    initializeSocket,
    cleanupSocket,
  } = useStatusStore();

  const isDark = theme === "dark";
  const userStatuses = getUserStatuses(currentUser._id);
  const otherStatuses = getOtherStatuses(currentUser._id);

  useEffect(() => {
    fetchStatuses();
    initializeSocket();
    return () => cleanupSocket();
  }, [currentUser?._id]);

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
      console.error("Error creating status", error);
    }
  };

  const handleViewStatus = async (statusId) => {
    try {
      await viewStatus(statusId);
    } catch (error) {
      console.error("Error viewing status", error);
    }
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteStatus(statusId);
      setShowOption(false);
      handlePreviewClose();
    } catch (error) {
      console.error("Error deleting status", error);
    }
  };

  const handlePreviewClose = () => {
    setPreviewContact(null);
    setCurrentStatusIndex(0);
  };

  const handlePreviewNext = () => {
    if (currentStatusIndex < previewContact.statuses.length - 1) {
      setCurrentStatusIndex((prev) => prev + 1);
    } else {
      handlePreviewClose();
    }
  };

  const handlePreviewPrev = () => {
    setCurrentStatusIndex((prev) => Math.max(0, prev - 1));
  };

  const handleStatusPreview = (contact, statusIndex = 0) => {
    setPreviewContact(contact);
    setCurrentStatusIndex(statusIndex);
    if (contact.statuses[statusIndex]) {
      handleViewStatus(contact.statuses[statusIndex].id);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
        setFilePreview(URL.createObjectURL(file));
      }
    }
  };

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
        className={`flex flex-col h-screen border-r transition-colors duration-200 ${
          isDark
            ? "bg-[#1a0a10] border-[#3d1a26]"
            : "bg-[#FFF0F5] border-[#F8BBD0]"
        }`}
      >
        {/* ── Header ── */}
        <div
          className={`px-5 pt-6 pb-4 border-b ${
            isDark
              ? "bg-[#1a0a10] border-[#3d1a26]"
              : "bg-[#FFF0F5] border-[#F8BBD0]"
          }`}
        >
          <h2
            className={`text-2xl font-semibold tracking-tight ${
              isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
            }`}
          >
            Updates
          </h2>
        </div>

        {/* ── Error banner ── */}
        {error && (
          <div className="mx-4 mt-3 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
            <span className="flex-1">{error}</span>
            <button onClick={clearError} aria-label="Dismiss error">
              <RxCross2 className="w-4 h-4 mt-0.5" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">

          {/* ── My status card ── */}
          <div
            className={`mx-4 mt-4 p-3 rounded-2xl border flex items-center gap-3 cursor-pointer transition ${
              isDark
                ? "bg-[#2d0f1c] border-[#3d1a26] hover:border-[#C2185B]/40"
                : "bg-white border-[#F8BBD0] hover:border-[#F48FB1]"
            }`}
            onClick={() =>
              userStatuses
                ? handleStatusPreview(userStatuses)
                : setShowCreateModal(true)
            }
          >
            {/* Avatar with ring */}
            <div className="relative flex-shrink-0">
              {userStatuses ? (
                <svg className="absolute top-0 left-0 w-12 h-12 -rotate-90" viewBox="0 0 100 100">
                  {userStatuses.statuses.map((_, index) => {
                    const circumference = 2 * Math.PI * 46;
                    const segmentLength = circumference / userStatuses.statuses.length;
                    const offset = index * segmentLength;
                    return (
                      <circle
                        key={index}
                        cx="50" cy="50" r="46"
                        fill="none"
                        stroke="#C2185B"
                        strokeWidth="4"
                        strokeDasharray={`${segmentLength - 4} 4`}
                        strokeDashoffset={-offset}
                      />
                    );
                  })}
                </svg>
              ) : null}
              <img
                src={
                  currentUser?.profilePicture ||
                  "https://api.dicebear.com/6.x/avataaars/svg?seed=You"
                }
                alt={currentUser.username}
                className="w-12 h-12 rounded-full object-cover border-2 border-[#F48FB1]"
              />
              <button
                className="absolute bottom-0 right-0 w-5 h-5 bg-[#C2185B] hover:bg-[#AD1457] text-white rounded-full flex items-center justify-center shadow transition"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowCreateModal(true);
                }}
                aria-label="Add status"
              >
                <FaPlus className="w-2 h-2" />
              </button>
            </div>

            {/* Text */}
            <div className="flex-1 min-w-0">
              <p className={`font-semibold text-sm ${isDark ? "text-[#F8BBD0]" : "text-[#4A1528]"}`}>
                My Updates
              </p>
              <p className={`text-xs mt-0.5 truncate ${isDark ? "text-[#7d3a50]" : "text-[#AD1457]/70"}`}>
                {userStatuses
                  ? `${userStatuses.statuses.length} update${userStatuses.statuses.length > 1 ? "s" : ""} · ${formatTimestamp(
                      userStatuses.statuses[userStatuses.statuses.length - 1].timeStamp
                    )}`
                  : "Tap to add an update"}
              </p>
            </div>

            {/* Options button */}
            {userStatuses && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOption(!showOption);
                }}
                className={`p-2 rounded-full transition flex-shrink-0 ${
                  isDark ? "hover:bg-[#3d1a26] text-[#F48FB1]" : "hover:bg-[#FCE4EC] text-[#C2185B]"
                }`}
                aria-label="Status options"
              >
                <FaEllipsisH className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* ── Options dropdown ── */}
          {showOption && userStatuses && (
            <div
              className={`mx-4 mt-1 rounded-xl border overflow-hidden text-sm ${
                isDark
                  ? "bg-[#2d0f1c] border-[#3d1a26]"
                  : "bg-white border-[#F8BBD0]"
              }`}
            >
              <button
                onClick={() => { setShowCreateModal(true); setShowOption(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  isDark ? "hover:bg-[#3d1a26] text-[#F8BBD0]" : "hover:bg-[#FFF0F5] text-[#4A1528]"
                }`}
              >
                <FaCamera className={isDark ? "text-[#F48FB1]" : "text-[#C2185B]"} />
                Add update
              </button>
              <div className={`mx-3 h-px ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />
              <button
                onClick={() => { handleStatusPreview(userStatuses); setShowOption(false); }}
                className={`w-full flex items-center gap-3 px-4 py-3 transition ${
                  isDark ? "hover:bg-[#3d1a26] text-[#F8BBD0]" : "hover:bg-[#FFF0F5] text-[#4A1528]"
                }`}
              >
                <FaImages className={isDark ? "text-[#F48FB1]" : "text-[#C2185B]"} />
                View updates
              </button>
            </div>
          )}

          {/* ── Loading spinner ── */}
          {loading && (
            <div className="flex justify-center items-center p-10">
              <div className="w-8 h-8 rounded-full border-2 border-[#F8BBD0] border-t-[#C2185B] animate-spin" />
            </div>
          )}

          {/* ── Other statuses ── */}
          {!loading && otherStatuses.length > 0 && (
            <div className="mx-4 mt-4">
              <p
                className={`text-xs font-semibold uppercase tracking-wider mb-2 px-1 ${
                  isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"
                }`}
              >
                Recent Updates
              </p>
              <div
                className={`rounded-2xl border overflow-hidden ${
                  isDark ? "bg-[#2d0f1c] border-[#3d1a26]" : "bg-white border-[#F8BBD0]"
                }`}
              >
                {otherStatuses.map((contact, index) => (
                  <React.Fragment key={contact?.id}>
                    <StatusList
                      contact={contact}
                      onPreview={() => handleStatusPreview(contact)}
                      theme={theme}
                    />
                    {index < otherStatuses.length - 1 && (
                      <div className={`mx-4 h-px ${isDark ? "bg-[#3d1a26]" : "bg-[#F8BBD0]"}`} />
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>
          )}

          {/* ── Empty state ── */}
          {!loading && statuses.length === 0 && (
            <div className="flex flex-col items-center justify-center px-8 py-16 text-center">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 ${
                  isDark ? "bg-[#2d0f1c]" : "bg-[#FCE4EC]"
                }`}
              >
                📱
              </div>
              <h3
                className={`text-base font-semibold mb-1 ${
                  isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
                }`}
              >
                No updates yet
              </h3>
              <p className={`text-sm ${isDark ? "text-[#7d3a50]" : "text-[#AD1457]/60"}`}>
                Be the first to share an update
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="mt-5 px-5 py-2.5 bg-[#C2185B] hover:bg-[#AD1457] text-white text-sm font-medium rounded-xl transition shadow-md shadow-pink-300/20"
              >
                Add update
              </button>
            </div>
          )}
        </div>

        {/* ── Create status modal ── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border ${
                isDark
                  ? "bg-[#1a0a10] border-[#3d1a26]"
                  : "bg-white border-[#F8BBD0]"
              }`}
            >
              {/* Modal header */}
              <div
                className={`flex items-center justify-between px-5 py-4 border-b ${
                  isDark ? "border-[#3d1a26]" : "border-[#F8BBD0]"
                }`}
              >
                <h3
                  className={`text-base font-semibold ${
                    isDark ? "text-[#F8BBD0]" : "text-[#880E4F]"
                  }`}
                >
                  Create Update
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewStatus("");
                    setSelectedFile(null);
                    setFilePreview(null);
                  }}
                  className={`p-1.5 rounded-full transition ${
                    isDark ? "hover:bg-[#2d0f1c] text-[#F48FB1]" : "hover:bg-[#FCE4EC] text-[#C2185B]"
                  }`}
                  aria-label="Close"
                >
                  <RxCross2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* File preview */}
                {filePreview && (
                  <div className="relative rounded-xl overflow-hidden">
                    {selectedFile?.type.startsWith("video/") ? (
                      <video src={filePreview} controls className="w-full max-h-48 object-cover" />
                    ) : (
                      <img src={filePreview} alt="preview" className="w-full max-h-48 object-cover" />
                    )}
                    <button
                      onClick={() => { setSelectedFile(null); setFilePreview(null); }}
                      className="absolute top-2 right-2 w-7 h-7 bg-[#C2185B] text-white rounded-full flex items-center justify-center shadow"
                      aria-label="Remove file"
                    >
                      <RxCross2 className="w-3 h-3" />
                    </button>
                  </div>
                )}

                {/* Textarea */}
                <textarea
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  placeholder="What's on your mind?"
                  rows={3}
                  className={`w-full px-4 py-3 rounded-xl text-sm border resize-none focus:outline-none focus:ring-2 focus:ring-[#C2185B]/30 transition ${
                    isDark
                      ? "bg-[#2d0f1c] border-[#3d1a26] text-[#F8BBD0] placeholder-[#7d3a50] focus:border-[#C2185B]"
                      : "bg-[#FFF0F5] border-[#F8BBD0] text-[#4A1528] placeholder-[#F48FB1] focus:border-[#C2185B] focus:bg-white"
                  }`}
                />

                {/* File input */}
                <label
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border cursor-pointer transition text-sm ${
                    isDark
                      ? "border-[#3d1a26] hover:bg-[#2d0f1c] text-[#F48FB1]"
                      : "border-[#F8BBD0] hover:bg-[#FFF0F5] text-[#C2185B]"
                  }`}
                >
                  <FaImages className="w-4 h-4" />
                  {selectedFile ? selectedFile.name : "Add photo or video"}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>

                {/* Action buttons */}
                <div className="flex gap-3 pt-1">
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewStatus("");
                      setSelectedFile(null);
                      setFilePreview(null);
                    }}
                    disabled={loading}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition ${
                      isDark
                        ? "border-[#3d1a26] text-[#F48FB1] hover:bg-[#2d0f1c]"
                        : "border-[#F8BBD0] text-[#C2185B] hover:bg-[#FFF0F5]"
                    }`}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleCreateStatus}
                    disabled={loading || (!newStatus.trim() && !selectedFile)}
                    className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-[#C2185B] hover:bg-[#AD1457] disabled:bg-[#F8BBD0] text-white transition"
                  >
                    {loading ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </Layout>
  );
};

export default Status;