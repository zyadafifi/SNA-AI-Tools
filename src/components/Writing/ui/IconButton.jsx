import { motion } from "framer-motion";
import { clsx } from "clsx";

const IconButton = ({
  children,
  variant = "default",
  size = "md",
  disabled = false,
  className,
  onClick,
  "aria-label": ariaLabel,
  ...props
}) => {
  const baseClasses = "inline-flex items-center justify-center rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    default: "text-surface-600 hover:text-primary-600 hover:bg-primary-50 focus:ring-primary-500",
    primary: "text-white bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 shadow-soft",
    secondary: "text-primary-600 bg-primary-50 hover:bg-primary-100 focus:ring-primary-500",
    ghost: "text-surface-600 hover:text-primary-600 hover:bg-surface-50 focus:ring-primary-500",
  };
  
  const sizes = {
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-12 h-12",
    xl: "w-14 h-14",
  };
  
  const buttonClasses = clsx(
    baseClasses,
    variants[variant],
    sizes[size],
    className
  );
  
  return (
    <motion.button
      className={buttonClasses}
      disabled={disabled}
      onClick={onClick}
      aria-label={ariaLabel}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.15 }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default IconButton;
