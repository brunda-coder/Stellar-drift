import React from 'react';
import { motion } from 'framer-motion';
import type { HTMLMotionProps } from 'framer-motion';

interface NeonButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'danger' | 'safe';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export default function NeonButton({ variant = 'primary', size = 'md', children, className = '', ...props }: NeonButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary': return 'border-plasma/50 text-plasma hover:bg-plasma/20 hover:border-plasma hover:shadow-[0_0_40px_rgba(0,232,255,0.4)] hover:text-white';
      case 'secondary': return 'border-white/10 text-white/50 hover:bg-white/10 hover:border-white/40 hover:text-white hover:shadow-[0_0_25px_rgba(255,255,255,0.15)]';
      case 'danger': return 'border-rose/50 text-rose hover:bg-rose/20 hover:border-rose hover:shadow-[0_0_40px_rgba(255,58,140,0.4)] hover:text-white';
      case 'safe': return 'border-safe/50 text-safe hover:bg-safe/20 hover:border-safe hover:shadow-[0_0_40px_rgba(0,255,170,0.4)] hover:text-white';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'text-[10px] px-6 py-2 tracking-[3px]';
      case 'md': return 'text-[12px] px-12 py-3 tracking-[5px]';
      case 'lg': return 'text-[14px] px-16 py-4 tracking-[6px]';
    }
  };

  return (
    <motion.button
      whileHover={{ y: -3, scale: 1.02 }}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden bg-white/[0.02] backdrop-blur-sm border uppercase font-oxanium font-bold transition-all duration-300 group ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
      <span className="relative z-10 tracking-[inherit]">{children}</span>
    </motion.button>
  );
}
