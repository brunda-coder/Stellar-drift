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
      case 'primary': return 'border-plasma text-plasma before:bg-plasma/10 hover:border-plasma hover:shadow-[0_0_28px_rgba(0,232,255,0.2)] hover:text-white';
      case 'secondary': return 'border-white/10 text-white/30 hover:border-white/20 hover:text-white/50 border-white/20';
      case 'danger': return 'border-rose text-rose before:bg-rose/10 hover:border-rose hover:shadow-[0_0_28px_rgba(255,58,140,0.2)] hover:text-white';
      case 'safe': return 'border-safe text-safe before:bg-safe/10 hover:border-safe hover:shadow-[0_0_28px_rgba(0,255,170,0.2)] hover:text-white';
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
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={`relative overflow-hidden bg-transparent border uppercase font-oxanium font-semibold transition-all duration-300 group ${getVariantStyles()} ${getSizeStyles()} ${className}`}
      {...props}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 before-bg-inherit" style={{ backgroundColor: 'inherit' }} />
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
}
