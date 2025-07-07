import { cn } from "@/lib/utils";
import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning"
    | "info"
    | "outline"
    | "ghost";
  width?: string;
  height?: string;
  font?: string;
  padding?: string;
  children: React.ReactNode;
}

export function Button({
  children,
  className,
  variant = "default",
  width = "w-full",
  height,
  font = "font-[poppins]",
  padding = "py-3 px-6",
  ...props
}: ButtonProps) {
  const baseStyles = `
    inline-flex items-center justify-center rounded-lg
    transition-colors duration-200 ease-in-out
    disabled:opacity-50 disabled:cursor-not-allowed w-fit
    ${font} ${padding}
  `
    .trim()
    .replace(/\s+/g, " ");

  const variants = {
    default: "text-white bg-gray-800 hover:bg-gray-900",
    primary: "text-white bg-blue-600 hover:bg-blue-700",
    secondary: "text-gray-700 bg-gray-200 hover:bg-gray-300",
    success: "text-white bg-green-600 hover:bg-green-700",
    danger: "text-white bg-red-600 hover:bg-red-700",
    warning: "text-white bg-yellow-600 hover:bg-yellow-700",
    info: "text-white bg-cyan-600 hover:bg-cyan-700",
    outline: "text-gray-700 border border-gray-300 bg-white hover:bg-gray-50",
    ghost: "text-gray-700 hover:bg-gray-100",
  };

  return (
    <button className={cn(baseStyles, variants[variant], className)} {...props}>
      {children}
    </button>
  );
}
