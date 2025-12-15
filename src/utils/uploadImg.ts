import { CLOUDINARY_CONFIG } from "../config/cloudinary";
import type { CloudinaryUploadResponse } from "../types/Cloudinary";

export const uploadImageToCloudinary = async (
  file: File
): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_CONFIG.UPLOAD_PRESET);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.CLOUD_NAME}/image/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    throw new Error("Upload image failed");
  }

  const data: CloudinaryUploadResponse = await response.json();
  return data.secure_url;
};