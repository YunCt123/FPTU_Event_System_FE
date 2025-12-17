import { useState, useEffect, useMemo } from "react";
import { X, Users, Loader } from "lucide-react";
import { toast } from "react-toastify";
import type { Venue } from "../../../types/Venue";
import { uploadImageToCloudinary } from "../../../utils/uploadImg";

interface VenueFormModalProps {
  venue: Venue | null;
  onClose: () => void;
  onSuccess: (venue: Venue) => void;
}

interface FormData {
  name: string;
  location: string;
  row: number;
  column: number;
  hasSeats: boolean;
  mapImageUrl: string;
  capacity: number;
}

interface FormErrors {
  name?: string;
  location?: string;
  row?: string;
  column?: string;
}

const VenueFormModal = ({ venue, onClose, onSuccess }: VenueFormModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    location: "",
    row: 0,
    column: 0,
    hasSeats: false,
    mapImageUrl: "",
    capacity: 0,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  // Auto-calculate capacity when hasSeats is true
  const calculatedCapacity = useMemo(() => {
    if (formData.hasSeats && formData.row > 0 && formData.column > 0) {
      return formData.row * formData.column;
    }
    return formData.capacity;
  }, [formData.hasSeats, formData.row, formData.column, formData.capacity]);

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        location: venue.location,
        row: venue.row,
        column: venue.column,
        hasSeats: venue.hasSeats,
        mapImageUrl: venue.mapImageUrl || "",
        capacity: venue.capacity || 0,
      });
      setPreviewUrl(venue.mapImageUrl || "");
    } else {
      setPreviewUrl("");
    }
  }, [venue]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tên venue là bắt buộc";
    }

    if (!formData.location.trim()) {
      newErrors.location = "Vị trí là bắt buộc";
    }

    // Chỉ validate hasSeats, row, column khi tạo mới
    if (!venue && formData.hasSeats) {
      if (!formData.row || formData.row <= 0) {
        newErrors.row = "Số hàng phải lớn hơn 0";
      }
      if (!formData.column || formData.column <= 0) {
        newErrors.column = "Số cột phải lớn hơn 0";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "row" || name === "column" || name === "capacity") {
      const numValue = value === "" ? 0 : parseInt(value, 10);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Cleanup previous preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, mapImageUrl: imageUrl }));
      toast.success("Tải ảnh lên thành công!");
      // Update preview to show Cloudinary URL
      setPreviewUrl(imageUrl);
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
      console.error("Error uploading image:", err);
      // Revert to previous URL or clear
      if (venue?.mapImageUrl) {
        setPreviewUrl(venue.mapImageUrl);
      } else {
        setPreviewUrl("");
        if (previewUrl && previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(previewUrl);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    // Cleanup blob URL if exists
    if (previewUrl && previewUrl.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl("");
    setFormData((prev) => ({ ...prev, mapImageUrl: "" }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const venueData: Venue = {
        id: venue?.id || Date.now(),
        name: formData.name,
        location: formData.location,
        row: formData.row,
        column: formData.column,
        hasSeats: formData.hasSeats,
        mapImageUrl: formData.mapImageUrl || null,
        status: venue?.status || "ACTIVE",
        campusId: venue?.campusId || 0,
        capacity: formData.hasSeats ? calculatedCapacity : formData.capacity,
      };

      onSuccess(venueData);
    } catch (error) {
      console.error("Error saving venue:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {venue ? "Chỉnh sửa Venue" : "Thêm Venue mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên Venue <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="VD: Hội trường A"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Vị trí <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="VD: Tầng 3, Nhà A, FU Hòa Lạc"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.location && (
              <p className="text-red-500 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Has Seats Checkbox - Chỉ hiển thị khi tạo mới */}
          {!venue && (
            <div className="flex items-center">
              <input
                type="checkbox"
                name="hasSeats"
                checked={formData.hasSeats}
                onChange={handleChange}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-700">
                Venue này có sơ đồ ghế ngồi
              </label>
            </div>
          )}

          {/* Hiển thị thông tin hasSeats khi edit */}
          {venue && (
            <div className="bg-gray-50 p-4 rounded-lg space-y-2">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Trạng thái ghế ngồi:</span>{" "}
                {formData.hasSeats ? "Có sơ đồ ghế" : "Không có sơ đồ ghế"}
              </p>
              {formData.hasSeats && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Kích thước:</span>{" "}
                  {formData.row} hàng × {formData.column} cột
                </p>
              )}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-200 mt-2">
                <Users size={18} className="text-[#F27125]" />
                <span className="text-sm font-medium text-gray-700">
                  Sức chứa:
                </span>
                <span className="text-lg font-bold text-[#F27125]">
                  {venue.capacity || calculatedCapacity}
                </span>
                <span className="text-sm text-gray-500">người</span>
              </div>
            </div>
          )}

          {/* Row and Column - Chỉ hiển thị khi tạo mới và hasSeats = true */}
          {!venue && formData.hasSeats && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số hàng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="row"
                    value={formData.row || ""}
                    onChange={handleChange}
                    placeholder="VD: 10"
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.row ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.row && (
                    <p className="text-red-500 text-sm mt-1">{errors.row}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Số cột <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    name="column"
                    value={formData.column || ""}
                    onChange={handleChange}
                    placeholder="VD: 20"
                    min="1"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.column ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.column && (
                    <p className="text-red-500 text-sm mt-1">{errors.column}</p>
                  )}
                </div>
              </div>

              {/* Auto-calculated Capacity Display */}
              {formData.row > 0 && formData.column > 0 && (
                <div className="bg-linear-to-r from-[#F27125]/10 to-orange-50 border border-[#F27125]/20 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-[#F27125] rounded-full">
                      <Users size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">
                        Sức chứa (tự động tính)
                      </p>
                      <p className="text-2xl font-bold text-[#F27125]">
                        {calculatedCapacity}{" "}
                        <span className="text-sm font-normal text-gray-500">
                          chỗ ngồi
                        </span>
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        = {formData.row} hàng × {formData.column} cột
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Capacity input for venue without seats - Chỉ hiển thị khi tạo mới và hasSeats = false */}
          {!venue && !formData.hasSeats && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sức chứa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="capacity"
                value={formData.capacity || ""}
                onChange={handleChange}
                placeholder="VD: 200"
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">
                Nhập số lượng người tối đa có thể chứa
              </p>
            </div>
          )}

          {/* Map Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh sơ đồ
            </label>
            <div className="space-y-3">
              {/* Preview */}
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview sơ đồ"
                    className="w-full h-48 object-contain bg-gray-50 border border-gray-200 rounded-lg p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  {!isUploading && (
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition-colors"
                      title="Xóa ảnh"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-full h-48 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                  <div className="text-center">
                    <p className="text-sm text-gray-500 mb-2">
                      Chưa có hình ảnh
                    </p>
                    <p className="text-xs text-gray-400">
                      Chọn file để tải lên
                    </p>
                  </div>
                </div>
              )}

              {/* File Input */}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="w-full text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F27125] file:text-white hover:file:bg-[#d65c00] disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-[#F27125]">
                    <Loader className="animate-spin" size={16} />
                    <span>Đang tải ảnh lên...</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Chọn file ảnh từ máy tính (tối đa 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65c00] transition-colors ${
                isSubmitting ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Đang lưu..." : venue ? "Cập nhật" : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueFormModal;
