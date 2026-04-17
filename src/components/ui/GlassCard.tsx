import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  active?: boolean;
}

export default function GlassCard({ children, active = false, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`p-6 backdrop-blur-xl transition-all duration-300
        ${active
          ? 'bg-primary-container/5 shadow-[0_0_30px_rgba(0,255,255,0.15)] border-l-4 border-primary-container'
          : 'border border-white/15 hover:border-primary-dim/40 hover:shadow-[0_0_20px_rgba(0,255,255,0.1)]'
        } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
