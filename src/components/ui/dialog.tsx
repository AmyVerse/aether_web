import { on } from "events";
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
}: DialogProps) {
  if (!isOpen) return null;

  const confirmButtonClass =
    confirmVariant === "destructive"
      ? "flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
      : "flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors";

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl w-full h-full border p-4 sm:p-6 border-gray-100 sm:max-w-4xl sm:h-auto max-h-screen overflow-y-auto shadow-xl flex flex-col animate-in fade-in-0 zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-row justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {title}
            </h3>
            {description && <p className="text-gray-600 mb-6">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 w-fit h-fit hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 flex-shrink-0"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>
        {children && <div className="mb-6">{children}</div>}
        {showActions && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
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
