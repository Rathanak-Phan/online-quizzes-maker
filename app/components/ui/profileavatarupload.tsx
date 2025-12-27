"use client";

import { useRef, useState, useEffect, ChangeEvent } from "react";
import axios, { AxiosError } from "axios";

interface ProfileAvatarUploadProps {
  userId: number;
  avatarUrl?: string | null;
  setUser: React.Dispatch<any>; // parent state updater
}

const ProfileAvatarUpload: React.FC<ProfileAvatarUploadProps> = ({
  userId,
  avatarUrl,
  setUser,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string>(
    avatarUrl ? `http://localhost:5000${avatarUrl}` : "/avatar-default.png"
  );
  const [loading, setLoading] = useState(false);

  // Update preview when avatarUrl changes (like on login)
  useEffect(() => {
    setPreview(
      avatarUrl ? `http://localhost:5000${avatarUrl}` : "/avatar-default.png"
    );
  }, [avatarUrl]);

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPreview(URL.createObjectURL(file)); // temporary preview

    const formData = new FormData();
    formData.append("profile", file);

    try {
      setLoading(true);

      const res = await axios.post(
        `http://localhost:5000/api/users/upload-profile/${userId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Use full URL for preview
      const imageUrl = `http://localhost:5000${res.data.image}`;
      setPreview(imageUrl);

      // Update parent user state
      setUser((prev: any) => ({
        ...prev,
        profile_image: res.data.image,
      }));

      // Update localStorage so it persists across pages
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...storedUser, profile_image: res.data.image })
      );
    } catch (err) {
      console.error(err);
      if (err instanceof AxiosError) {
        alert(err.response?.data?.message || "Upload failed");
      } else {
        alert("Upload failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={handleClick}
      className="relative w-10 h-10 rounded-full overflow-hidden cursor-pointer group"
    >
      <img
        src={preview}
        alt="Profile Avatar"
        className="w-full h-full object-cover"
      />

      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black/40 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
        Change
      </div>

      {/* Loading spinner */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/70">
          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={handleChange}
      />
    </div>
  );
};

export default ProfileAvatarUpload;
