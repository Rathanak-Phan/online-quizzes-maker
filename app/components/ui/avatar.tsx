"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Avatar({
  src,
  alt = "Avatar",
  size = "md",
  className = ""
}: AvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-sm",
    lg: "w-16 h-16 text-base"
  };

  const fallbackInitial = alt?.charAt(0).toUpperCase() || "U";

  return (
    <div className={`${sizeClasses[size]} ${className} relative rounded-full overflow-hidden 
      bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center 
      text-white font-semibold border-2 border-white shadow-lg`}>
      {src ? (
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span>{fallbackInitial}</span>
      )}
    </div>
  );
}