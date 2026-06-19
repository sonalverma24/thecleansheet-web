'use client';

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

interface MobileSplashProps {
  onComplete: () => void;
}

export function MobileSplash({ onComplete }: MobileSplashProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800); // 2.8 seconds delay
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="w-full h-full bg-[#fcf9f8] flex flex-col items-center justify-center p-6 relative overflow-hidden select-none">
      {/* Background soft glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-[#248179]/5 rounded-bl-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#fd6158]/5 rounded-tr-full pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.2, ease: [0.2, 0.8, 0.2, 1] }}
        className="flex flex-col items-center text-center max-w-sm"
      >
        {/* Circular Logo Container */}
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 1.0, ease: [0.2, 0.8, 0.2, 1] }}
          className="w-36 h-36 md:w-44 md:h-44 rounded-full overflow-hidden border border-[#b0a8a4]/20 bg-[#ffffff] flex items-center justify-center p-4 mb-8 shadow-[0_20px_40px_rgba(0,103,96,0.04)]"
        >
          <img 
            alt="The Clean Sheet Logo" 
            className="w-full h-full object-contain"
            src="/logo.png" 
          />
        </motion.div>

        {/* Title */}
        <motion.h1 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="font-display text-3xl md:text-4xl text-[#248179] tracking-tight mb-2"
        >
          The Clean Sheet
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="font-sans text-[12px] tracking-[0.15em] text-[#b0a8a4] uppercase"
        >
          Decode. Decide. Do Better.
        </motion.p>
      </motion.div>
    </div>
  );
}
