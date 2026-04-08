import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  active?: boolean;
}

export default function GlassCard({ children, active = false, className = '', ...props }: GlassCardProps) {
  return (
    <motion.div
      className={`rounded-xl border p-6 backdrop-blur-xl transition-all duration-300
        ${active 
          ? 'bg-plasma/5 border-plasma/40 shadow-[0_0_30px_rgba(0,232,255,0.15)]' 
          : 'bg-white/5 border-white/10 hover:border-plasma/30 hover:bg-white/10'
        } ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}
