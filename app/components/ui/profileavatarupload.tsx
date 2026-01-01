"use client";

import { useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import Image from "next/image";

interface ProfileAvatarUploadProps {
  userId: string;
  avatarUrl?: string | null;
  setUser?: (user: any) => void;
  size?: "sm" | "md" | "lg";
}

export default function ProfileAvatarUpload({
  userId,
  avatarUrl,
  setUser,
  size = "md"
}: ProfileAvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const sizeClasses = {
    sm: "w-10 h-10",
    md: "w-12 h-12",
    lg: "w-16 h-16"
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to server
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("userId", userId);

      const response = await fetch("/api/upload/avatar", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (setUser) {
          setUser((prev: any) => ({
            ...prev,
            profile_image: data.url
          }));
        }
      }
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const imageUrl = previewUrl || avatarUrl || "/default-avatar.png";

  return (
    <div className="relative group">
      <div className={`${sizeClasses[size]} rounded-full overflow-hidden border-2 border-white shadow-lg`}>
        {uploading ? (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
          </div>
        ) : (
          <Image
            src={imageUrl}
            alt="Profile"
            width={96}
            height={96}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/default-avatar.png";
            }}
          />
        )}
      </div>

      <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full 
        opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
        <input
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={uploading}
        />
        <Camera className="w-5 h-5 text-white" />
      </label>
    </div>
  );
}