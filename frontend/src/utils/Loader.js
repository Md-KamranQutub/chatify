import React from 'react';
import { motion } from 'framer-motion';
import { HiChatBubbleLeftRight } from 'react-icons/hi2';

export default function Loader({ progress = 0 }) {
  return (
    <div className="fixed inset-0 bg-[#FCE4EC] flex flex-col items-center justify-center z-50">

      {/* Soft radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(194,24,91,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Logo mark */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, duration: 0.6 }}
        className="relative mb-8"
      >
        {/* Outer pulsing ring */}
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-[#F48FB1]"
          animate={{ scale: [1, 1.18, 1], opacity: [0.6, 0, 0.6] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <div className="w-24 h-24 bg-[#C2185B] rounded-2xl flex items-center justify-center shadow-xl shadow-pink-400/30">
          <HiChatBubbleLeftRight className="w-12 h-12 text-white" />
        </div>
      </motion.div>

      {/* App name */}
      <motion.h1
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
        className="text-2xl font-semibold text-[#880E4F] mb-1 tracking-tight"
      >
        Chatify
      </motion.h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.45, duration: 0.4 }}
        className="text-sm text-[#AD1457]/60 mb-8"
      >
        Your cozy chat corner
      </motion.p>

      {/* Progress bar */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-56 flex flex-col items-center gap-2"
      >
        <div className="w-full h-1.5 bg-[#F8BBD0] rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#C2185B] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
        <p className="text-xs text-[#AD1457]/60 font-medium">
          {progress < 100 ? `Loading… ${progress}%` : 'Almost there!'}
        </p>
      </motion.div>
    </div>
  );
}