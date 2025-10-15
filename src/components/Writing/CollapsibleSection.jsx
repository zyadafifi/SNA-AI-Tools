import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function CollapsibleSection({
  title,
  count,
  icon,
  iconColor,
  bgColor,
  borderColor,
  isExpanded,
  onToggle,
  children,
  defaultCollapsed = false,
}) {
  return (
    <div className="border-b border-gray-200 pb-4">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2 transition"
      >
        <div className="flex items-center space-x-2">
          <div className={iconColor}>{icon}</div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <span className="text-sm text-gray-500">({count})</span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="space-y-2 mt-3"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
