"use client";

export default function Toast({
  message,
  type,
  onCloseAction,
}: {
  message: string;
  type: "success" | "error";
  onCloseAction: () => void;
}) {
  return (
    <div
      className={`
        fixed top-6 left-1/2 z-50 px-6 py-3 rounded-lg shadow-lg
        text-white font-semibold transition-all
        ${type === "success" ? "bg-green-600" : "bg-red-600"}
        -translate-x-1/2
      `}
      style={{ minWidth: 220 }}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            className="h-5 w-5 text-white"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        )}
        <span>{message}</span>
        <button className="ml-2" onClick={onCloseAction} aria-label="Close">
          <svg
            className="h-4 w-4"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
