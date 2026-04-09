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
      case 'primary':
        return 'border-2 border-primary-container text-primary-container bg-surface-container-high hover:bg-primary-container hover:text-on-primary hover:shadow-[0_0_40px_rgba(0,255,255,0.4)] active:scale-95';
      case 'secondary':
        return 'border border-outline-variant/30 text-secondary bg-transparent glass-panel hover:border-secondary/50 hover:shadow-[0_0_25px_rgba(216,115,255,0.25)] hover:text-white active:scale-95';
      case 'danger':
        return 'border-2 border-tertiary-container text-tertiary-container bg-tertiary-container/10 hover:bg-tertiary-container hover:text-on-tertiary hover:shadow-[0_0_40px_rgba(255,6,127,0.5)] active:scale-95';
      case 'safe':
        return 'border border-primary-dim/50 text-primary-dim bg-transparent hover:bg-primary-dim/10 hover:border-primary-dim hover:shadow-[0_0_30px_rgba(0,230,230,0.3)] active:scale-95';
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm': return 'text-[10px] px-6 py-2 tracking-[3px]';
      case 'md': return 'text-[12px] px-12 py-3 tracking-[5px]';
      case 'lg': return 'text-[14px] px-16 py-5 tracking-[6px]';
    }
  };

  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className={`relative overflow-hidden uppercase headline-font font-bold italic transition-all duration-300 group ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      {/* shimmer sweep */}
      <div className="absolute inset-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.15)_50%,transparent_75%)] bg-[length:250%_250%] opacity-0 group-hover:opacity-100 group-hover:animate-shimmer" />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
