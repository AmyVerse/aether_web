import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  confirmVariant?: "default" | "destructive";
  showActions?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "full";
  width?: string;
  height?: string;
}

export default function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  onConfirm,
  confirmVariant = "default",
  showActions = true,
  size = "md",
  width,
  height,
}: DialogProps) {
  if (!isOpen) return null;

  // Size variants for predefined sizes
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    full: "max-w-4xl",
  };

  // Dynamic sizing styles
  const dynamicStyles = {
    ...(width && { width }),
    ...(height && { height }),
  };

  const confirmButtonClass =
    confirmVariant === "destructive"
      ? "px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
      : "px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium";

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={onClose}
    >
      <div
        className={`
          bg-white rounded-xl w-full 
          ${!width ? sizeClasses[size] : ""} 
          ${!height ? "max-h-[90vh]" : ""} 
          shadow-2xl border border-gray-200 
          flex flex-col 
          animate-in fade-in-0 zoom-in-95 duration-300 ease-out
          overflow-hidden
        `}
        style={dynamicStyles}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-100">
          <div className="flex-1 pr-4">
            <h3 className="text-xl font-semibold text-gray-900 leading-tight">
              {title}
            </h3>
            {description && (
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 flex-shrink-0"
            aria-label="Close dialog"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        {children && (
          <div className="flex-1 p-6 overflow-y-auto">{children}</div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-3 px-6 py-3 justify-end border-t border-gray-100 bg-gray-50/70">
            <button
              onClick={onClose}
              className="px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 text-sm font-medium"
            >
              {cancelText}
            </button>
            {onConfirm && (
              <button onClick={onConfirm} className={confirmButtonClass}>
                {confirmText}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
