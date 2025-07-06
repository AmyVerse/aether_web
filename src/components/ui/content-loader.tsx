import LoadingSpinner from "./loading-spinner";

interface ContentLoaderProps {
  message?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function ContentLoader({
  message = "Loading...",
  size = "lg",
  className = "",
}: ContentLoaderProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
    >
      <LoadingSpinner size={size} color="text-indigo-600" className="mb-4" />
      <p className="text-muted-foreground text-sm font-medium">{message}</p>
    </div>
  );
}
