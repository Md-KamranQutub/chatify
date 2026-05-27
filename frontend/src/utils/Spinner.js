import React from 'react';
import { motion } from 'framer-motion';

export default function Spinner({ size = 'medium', color = 'light' }) {
  const sizeMap = {
    small:  { ring: 'w-4 h-4',  border: 'border-2', text: 'text-xs'  },
    medium: { ring: 'w-6 h-6',  border: 'border-2', text: 'text-sm'  },
    large:  { ring: 'w-9 h-9',  border: 'border-[3px]', text: 'text-base' },
  };

  const colorMap = {
    light: {
      track:  'border-[#F8BBD0]',
      spin:   'border-t-[#C2185B]',
      label:  'text-white',
    },
    dark: {
      track:  'border-[#3d1a26]',
      spin:   'border-t-[#C2185B]',
      label:  'text-[#F8BBD0]',
    },
    pink: {
      track:  'border-[#FCE4EC]',
      spin:   'border-t-[#C2185B]',
      label:  'text-[#AD1457]',
    },
  };

  const { ring, border, text } = sizeMap[size] || sizeMap.medium;
  const { track, spin, label } = colorMap[color] || colorMap.light;

  return (
    <div className="flex items-center justify-center gap-2">
      <motion.div
        className={`${ring} ${border} ${track} ${spin} rounded-full`}
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 0.75, ease: 'linear' }}
      />
      <span className={`${text} ${label} font-medium`}>Loading…</span>
    </div>
  );
}