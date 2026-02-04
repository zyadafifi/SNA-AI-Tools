import { motion } from "framer-motion";
import { clsx } from "clsx";
import { useState } from "react";

const Input = ({
  label,
  error,
  helperText,
  variant = "default",
  size = "md",
  className,
  ...props
}) => {
  const [focused, setFocused] = useState(false);
  
  const baseClasses = "w-full border bg-white rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0";
  
  const variants = {
    default: "border-surface-300 focus:border-primary-500 focus:ring-primary-500",
    error: "border-red-300 focus:border-red-500 focus:ring-red-500",
    success: "border-green-300 focus:border-green-500 focus:ring-green-500",
  };
  
  const sizes = {
    sm: "px-3 py-2 text-sm",
    md: "px-4 py-3 text-base",
    lg: "px-5 py-4 text-lg",
  };
  
  const inputClasses = clsx(
    baseClasses,
    variants[error ? "error" : "default"],
    sizes[size],
    className
  );
  
  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {label && (
        <label className="block text-sm font-medium text-surface-700">
          {label}
        </label>
      )}
      <motion.input
        className={inputClasses}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        whileFocus={{ scale: 1.01 }}
        transition={{ duration: 0.15 }}
        {...props}
      />
      {error && (
        <motion.p
          className="text-sm text-red-600"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
      {helperText && !error && (
        <p className="text-sm text-surface-500">{helperText}</p>
      )}
    </motion.div>
  );
};

export default Input;
