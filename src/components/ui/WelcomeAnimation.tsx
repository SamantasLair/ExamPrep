'use client';

import { motion } from 'framer-motion';
import { useEffect } from 'react';

interface WelcomeAnimationProps {
  name: string;
  onComplete: () => void;
}

export function WelcomeAnimation({ name, onComplete }: WelcomeAnimationProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 2800); // Allow time for animation to finish before unmounting
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary overflow-hidden">
      {/* Central Welcome Text */}
      <motion.div
        initial={{ scale: 0, rotate: -10 }}
        animate={{ scale: [0, 1.1, 1], rotate: [-10, 5, 0] }}
        transition={{ 
          duration: 0.7, 
          ease: "easeOut",
          times: [0, 0.7, 1]
        }}
        exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
        className="text-center z-10"
      >
        <motion.div 
          animate={{ y: [0, -25, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-7xl md:text-9xl mb-8"
        >
          🚀
        </motion.div>
        <h1 className="text-4xl md:text-6xl font-black text-primary-foreground tracking-tight drop-shadow-lg">
          Selamat Datang,
        </h1>
        <motion.h2 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5, type: "spring" }}
          className="text-3xl md:text-5xl font-bold text-primary-foreground/90 mt-4 px-4 py-2 bg-black/10 rounded-2xl inline-block backdrop-blur-sm"
        >
          {name}!
        </motion.h2>
      </motion.div>

      {/* Playful Particles / Confetti */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            opacity: 0, 
            y: "120vh", 
            x: `${(i * 15)}vw`,
            scale: Math.random() * 0.8 + 0.4
          }}
          animate={{ 
            opacity: [0, 1, 0], 
            y: "-20vh",
            rotate: Math.random() * 360 + 180
          }}
          transition={{ 
            duration: 1.8 + Math.random(), 
            delay: Math.random() * 0.3,
            ease: "easeOut"
          }}
          className="absolute w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md"
        />
      ))}

      {/* Screen wipe out animation at the very end */}
      <motion.div 
        initial={{ top: "100%" }}
        animate={{ top: "0%" }}
        transition={{ delay: 2.3, duration: 0.5, ease: "easeInOut" }}
        className="absolute inset-0 bg-background z-20"
      />
    </div>
  );
}
