import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import formatTimestamp from "../../utils/Data";
import {
  FaChevronDown,
  FaChevronLeft,
  FaChevronRight,
  FaEye,
  FaTrash,
  FaTimes,
} from "react-icons/fa";

const StatusPreview = ({
  contact,
  currentIndex,
  onClose,
  onPrev,
  onNext,
  currentUser,
  onDelete,
  theme,
  loading,
}) => {
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);

  const currentStatus = contact?.statuses[currentIndex];
  const isOwner = contact?.id === currentUser?._id;

  useEffect(() => {
    setProgress(0);
    let current = 0;
    const interval = setInterval(() => {
      current += 2;
      setProgress(current);
      if (current >= 100) {
        clearInterval(interval);
        onNext();
      }
    }, 100);
    return () => clearInterval(interval);
  }, [currentIndex, onNext]);

  const handleViewersToggle = () => setShowViewers((p) => !p);

  const handleDeleteStatus = () => {
    if (onDelete && currentStatus?.id) onDelete(currentStatus.id);
    if (contact.statuses.length === 1) onClose();
    else onPrev();
  };

  if (!currentStatus) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      style={{ backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full h-full max-w-sm mx-auto flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Main card ── */}
        <div className="relative w-full h-full bg-[#1a0a10] overflow-hidden flex flex-col">

          {/* ── Progress bars ── */}
          <div className="absolute top-0 left-0 right-0 flex gap-1 px-3 pt-3 z-20">
            {contact?.statuses.map((_, index) => (
              <div
                key={index}
                className="flex-1 h-[3px] rounded-full bg-white/20 overflow-hidden"
              >
                <div
                  className="h-full bg-[#F48FB1] rounded-full transition-all duration-100 ease-linear"
                  style={{
                    width:
                      index < currentIndex
                        ? "100%"
                        : index === currentIndex
                        ? `${progress}%`
                        : "0%",
                  }}
                />
              </div>
            ))}
          </div>

          {/* ── Header ── */}
          <div className="absolute top-6 left-0 right-0 px-3 z-20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={contact?.avatar}
                alt={contact?.name}
                className="w-10 h-10 rounded-full object-cover border-2 border-[#F48FB1]"
              />
              <div>
                <p className="text-white text-sm font-semibold leading-tight">
                  {contact?.name}
                </p>
                <p className="text-[#F8BBD0]/60 text-xs">
                  {formatTimestamp(currentStatus.timeStamps)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isOwner && (
                <button
                  onClick={handleDeleteStatus}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/20 hover:bg-red-500/40 border border-red-500/30 transition"
                  aria-label="Delete status"
                >
                  <FaTrash className="w-3.5 h-3.5 text-red-400" />
                </button>
              )}
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition"
                aria-label="Close"
              >
                <FaTimes className="w-3.5 h-3.5 text-white" />
              </button>
            </div>
          </div>

          {/* ── Content ── */}
          <div className="flex-1 flex items-center justify-center">
            {currentStatus.contentType === "text" ? (
              <div
                className="w-full h-full flex items-center justify-center px-8"
                style={{
                  background:
                    "radial-gradient(ellipse at center, #3d1a26 0%, #1a0a10 70%)",
                }}
              >
                <p className="text-white text-2xl font-medium text-center leading-relaxed">
                  {currentStatus.media}
                </p>
              </div>
            ) : currentStatus.contentType === "image" ? (
              <img
                src={currentStatus.media}
                alt="status"
                className="w-full h-full object-contain"
              />
            ) : currentStatus.contentType === "video" ? (
              <video
                src={currentStatus.media}
                controls
                autoPlay
                muted
                className="w-full h-full object-contain"
              />
            ) : null}
          </div>

          {/* ── Prev / Next navigation ── */}
          {currentIndex > 0 && (
            <button
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 transition"
              aria-label="Previous"
            >
              <FaChevronLeft className="w-4 h-4 text-white" />
            </button>
          )}
          {currentIndex < contact.statuses.length - 1 && (
            <button
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 flex items-center justify-center rounded-full bg-black/40 hover:bg-black/60 border border-white/10 transition"
              aria-label="Next"
            >
              <FaChevronRight className="w-4 h-4 text-white" />
            </button>
          )}

          {/* ── Viewers panel (owner only) ── */}
          {isOwner && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-3">
              <button
                onClick={handleViewersToggle}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-[#2d0f1c]/80 border border-[#3d1a26] hover:bg-[#3d1a26]/80 transition backdrop-blur-sm"
              >
                <div className="flex items-center gap-2">
                  <FaEye className="w-4 h-4 text-[#F48FB1]" />
                  <span className="text-sm text-[#F8BBD0] font-medium">
                    {currentStatus?.viewers?.length ?? 0} viewer
                    {currentStatus?.viewers?.length !== 1 ? "s" : ""}
                  </span>
                </div>
                <FaChevronDown
                  className={`w-3.5 h-3.5 text-[#F48FB1] transition-transform duration-200 ${
                    showViewers ? "rotate-180" : ""
                  }`}
                />
              </button>

              <AnimatePresence>
                {showViewers && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-1.5 rounded-xl bg-[#2d0f1c]/90 border border-[#3d1a26] overflow-hidden backdrop-blur-sm"
                  >
                    <div className="max-h-40 overflow-y-auto p-3 space-y-2">
                      {loading ? (
                        <div className="flex items-center justify-center py-4 gap-2">
                          <div className="w-5 h-5 rounded-full border-2 border-[#F8BBD0]/20 border-t-[#C2185B] animate-spin" />
                          <p className="text-[#F8BBD0]/60 text-sm">
                            Loading viewers…
                          </p>
                        </div>
                      ) : currentStatus?.viewers?.length > 0 ? (
                        currentStatus.viewers.map((viewer) => (
                          <div
                            key={viewer._id}
                            className="flex items-center gap-3"
                          >
                            <img
                              src={viewer.profilePicture}
                              alt={viewer.username}
                              className="w-8 h-8 rounded-full object-cover border border-[#F48FB1]/40"
                            />
                            <span className="text-[#F8BBD0] text-sm">
                              {viewer.username}
                            </span>
                          </div>
                        ))
                      ) : (
                        <p className="text-[#7d3a50] text-sm text-center py-3">
                          No viewers yet
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default StatusPreview;