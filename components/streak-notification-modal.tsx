"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@heroui/button";

interface StreakNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const StreakNotificationModal = ({
  isOpen,
  onClose,
}: StreakNotificationModalProps) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Fire particles for animation
  const particles = Array.from({ length: 12 }).map((_, i) => ({
    id: i,
    x: Math.random() * 60 - 30, // Random x position relative to center
    delay: Math.random() * 2,
    duration: 1 + Math.random() * 1.5,
  }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Modal Content */}
          <motion.div
            className="relative z-10 w-full max-w-[500px] bg-white rounded-[32px] overflow-hidden shadow-2xl flex flex-col items-center p-8 text-center"
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              y: 0,
              transition: { 
                type: "spring", 
                damping: 20, 
                stiffness: 300 
              } 
            }}
            exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
          >
            {/* Animated Fire Container */}
            <div className="relative w-32 h-32 mb-6 flex items-center justify-center">
              {/* Outer Glow */}
              <motion.div
                className="absolute inset-0 bg-orange-500/20 rounded-full blur-2xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />

              {/* Fire Particles */}
              {particles.map((p) => (
                <motion.div
                  key={p.id}
                  className="absolute bottom-4 w-3 h-3 bg-orange-400 rounded-full blur-[1px]"
                  initial={{ opacity: 0, y: 0, x: p.x }}
                  animate={{
                    opacity: [0, 1, 0],
                    y: -60 - Math.random() * 40,
                    x: p.x + (Math.random() * 20 - 10),
                    scale: [0.5, 1.5, 0],
                  }}
                  transition={{
                    duration: p.duration,
                    repeat: Infinity,
                    delay: p.delay,
                    ease: "easeOut",
                  }}
                />
              ))}

              {/* Main Fire Emoji with Animation */}
              <motion.div
                className="text-[80px] leading-none relative z-10 drop-shadow-lg filter"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [-2, 2, -2],
                  y: [0, -5, 0],
                  filter: [
                    "brightness(1) drop-shadow(0 0 10px rgba(255,100,0,0.5))",
                    "brightness(1.2) drop-shadow(0 0 20px rgba(255,100,0,0.8))",
                    "brightness(1) drop-shadow(0 0 10px rgba(255,100,0,0.5))"
                  ]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                🔥
              </motion.div>
            </div>

            {/* Content Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex flex-col gap-3 mb-8"
            >
              <h2 className="text-[28px] font-bold text-[#FF6F47] leading-tight">
                STREAK +1 !
              </h2>
              <p className="text-[#323232] text-base leading-relaxed max-w-[260px] mx-auto">
                Kerjakan latihan setiap hari untuk menjaga streakmu tetap hidup
              </p>
            </motion.div>

            {/* Action Button */}
            <motion.div
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                className="w-full bg-[#3674B5] text-white font-bold text-lg h-12 rounded-xl shadow-[0_4px_0_0_#205994] active:shadow-none active:translate-y-[4px] transition-all"
                onPress={onClose}
              >
                Aku Siap!
              </Button>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
