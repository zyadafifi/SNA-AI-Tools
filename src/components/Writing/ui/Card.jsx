import { motion } from "framer-motion";
import { clsx } from "clsx";

const Card = ({
  children,
  variant = "default",
  hover = false,
  className,
  onClick,
  ...props
}) => {
  const baseClasses = "bg-white rounded-2xl shadow-soft border border-surface-200 transition-all duration-300";
  
  const variants = {
    default: "",
    elevated: "shadow-medium",
    flat: "shadow-none border-surface-300",
    glass: "bg-white/80 backdrop-blur-sm border-white/20",
  };
  
  const hoverClasses = hover ? "hover:shadow-medium hover:scale-[1.02] cursor-pointer" : "";
  
  const cardClasses = clsx(
    baseClasses,
    variants[variant],
    hoverClasses,
    className
  );
  
  const MotionCard = onClick ? motion.div : "div";
  const motionProps = onClick ? {
    whileHover: { y: -4 },
    whileTap: { scale: 0.98 },
    transition: { duration: 0.2 },
    onClick,
  } : {};
  
  return (
    <MotionCard className={cardClasses} {...motionProps} {...props}>
      {children}
    </MotionCard>
  );
};

export default Card;
