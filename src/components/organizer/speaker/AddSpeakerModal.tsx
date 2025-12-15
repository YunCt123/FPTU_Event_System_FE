

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { speakerService } from "../../../services";
import type { SpeakerRequest } from "../../../types/Speaker";
import { uploadImageToCloudinary } from "../../../utils/uploadImg";
import { toast } from "react-toastify";

interface AddSpeakerModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

const AddSpeakerModal = ({ onClose, onSuccess }: AddSpeakerModalProps) => {
  const [formData, setFormData] = useState<SpeakerRequest>({
    name: "",
    bio: "",
    avatar: "",
    type: "internal",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");

  // Cleanup preview URL when component unmounts
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      setError("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setSelectedFile(file);
    
    // Create preview using Object URL (lighter than base64)
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload image to Cloudinary immediately
    setIsUploading(true);
    setError("");
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({
        ...prev,
        avatar: imageUrl,
      }));
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi tải ảnh lên");
      console.error("Error uploading image:", err);
      setSelectedFile(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl("");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setSelectedFile(null);
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, avatar: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Vui lòng nhập tên speaker");
      return;
    }
    if (!formData.bio.trim()) {
      setError("Vui lòng nhập bio");
      return;
    }
    if (!formData.company.trim()) {
      setError("Vui lòng nhập công ty");
      return;
    }
    if (!formData.avatar) {
      setError("Vui lòng upload ảnh đại diện");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await speakerService.postSpeaker(formData);

      if (response.status === 200 || response.status === 201) {
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
        }
        toast.success("Thêm speaker thành công");
        onSuccess?.();
        onClose();
      } else {
        toast.error("Có lỗi xảy ra khi tạo speaker");
        setError("Có lỗi xảy ra khi tạo speaker");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi xảy ra khi tạo speaker");
      toast.error(err.response?.data?.message || "Có lỗi xảy ra khi tạo speaker");
      console.error("Error creating speaker:", err);

    } finally {
      setIsSubmitting(false);
    }
  };


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header - Rounded top */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl bg-linear-to-r from-[#F27125] to-[#d65d1a]">
          <h2 className="text-2xl font-bold text-white">Thêm Speaker Mới</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Speaker <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Nhập tên speaker"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                required
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Speaker <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                required
              >
                <option value="internal">Nội bộ (Internal)</option>
                <option value="external">Bên ngoài (External)</option>
              </select>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Công ty <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Nhập tên công ty"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                required
              />
            </div>

            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ảnh đại diện
              </label>
              <input
                type="file"
                name="avatar"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F27125] file:text-white hover:file:bg-[#d65d1a] file:cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploading && (
                <p className="text-sm text-blue-600 mt-2">Đang tải ảnh lên...</p>
              )}
              {previewUrl && !isUploading && (
                <div className="mt-3 flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="h-20 w-20 rounded-full object-cover border-2 border-gray-300"
                  />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm text-green-600">Đã tải lên thành công</span>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-sm text-red-600 hover:text-red-800 text-left"
                    >
                      Xóa ảnh
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / Giới thiệu <span className="text-red-500">*</span>
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Nhập giới thiệu về speaker"
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          {/* Footer - Rounded bottom */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 rounded-b-2xl bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting || isUploading}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang tạo..." : isUploading ? "Đang tải ảnh..." : "Tạo Speaker"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSpeakerModal;