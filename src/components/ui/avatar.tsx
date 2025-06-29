import { cn } from "@/lib/utils";
import Image from "next/image";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  fallback?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export function Avatar({
  src,
  alt = "Avatar",
  fallback,
  size = "md",
  className,
}: AvatarProps) {
  const sizes = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-12 h-12 text-base",
    xl: "w-16 h-16 text-lg",
  };

  const sizeMap = {
    sm: 32,
    md: 40,
    lg: 48,
    xl: 64,
  };

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        width={sizeMap[size]}
        height={sizeMap[size]}
        className={cn(
          "rounded-full object-cover border border-gray-200",
          sizes[size],
          className,
        )}
      />
    );
  }

  // Fallback to initials
  const initials =
    fallback ||
    alt
      .split(" ")
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

  return (
    <div
      className={cn(
        "rounded-full bg-indigo-500 text-white font-medium flex items-center justify-center",
        sizes[size],
        className,
      )}
    >
      {initials}
    </div>
  );
}
