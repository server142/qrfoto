import React from "react";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  isDark?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = "", size = "md", isDark = false }) => {
  const sizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-4xl",
    xl: "text-6xl md:text-8xl"
  };

  return (
    <span className={`${sizeClasses[size]} font-black tracking-tighter italic ${className}`}>
      <span className="text-purple-600">QR</span>
      <span className={isDark ? "text-white" : "text-zinc-900"}>Foto</span>
    </span>
  );
};
