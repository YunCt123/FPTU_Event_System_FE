import { useState, useEffect, useRef } from "react";
import { X, ImageIcon } from "lucide-react";
import { toast } from "react-toastify";
import type {
  Venue,
  VenueStatus,
  CreateVenueRequest,
  Seat,
} from "../../types/Venue";
import SeatMapEditor from "../common/SeatMapEditor";

interface VenueFormModalProps {
  venue: Venue | null;
  onClose: () => void;
  onSuccess: (venue: Venue) => void;
}

const VenueFormModal = ({
  venue,
  onClose,
  onSuccess,
}: VenueFormModalProps) => {
  const [formData, setFormData] = useState<CreateVenueRequest>({
    name: "",
    description: "",
    capacity: 0,
    status: "ACTIVE" as VenueStatus,
    imageUrl: "",
  });
  const [_imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Seat Map States
  const [seatRows, setSeatRows] = useState<number>(0);
  const [seatCols, setSeatCols] = useState<number>(0);
  const [seatMap, setSeatMap] = useState<Seat[][]>([]);
  const [rowLabels, setRowLabels] = useState<string[]>([]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        description: venue.description || "",
        capacity: venue.capacity,
        status: venue.status,
        imageUrl: venue.imageUrl || "",
        seatMap: venue.seatMap,
      });
      if (venue.imageUrl) {
        setImagePreview(venue.imageUrl);
      }
      // Load seat map if exists
      if (venue.seatMap) {
        setSeatRows(venue.seatMap.rows);
        setSeatCols(venue.seatMap.cols);
        setSeatMap(venue.seatMap.seats);
        setRowLabels(venue.seatMap.rowLabels);
      }
    }
  }, [venue]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "capacity" ? parseInt(value) || 0 : value,
    }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    setImageFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleImageRemove = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, imageUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("Đã xóa ảnh");
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      const fakeEvent = {
        target: { files: [file] },
      } as unknown as React.ChangeEvent<HTMLInputElement>;
      handleImageSelect(fakeEvent);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Vui lòng nhập tên địa điểm";
    }

    // Capacity validation: Nếu có seat map thì tự động tính, nếu không thì phải nhập
    if (seatMap.length === 0 && (!formData.capacity || formData.capacity <= 0)) {
      newErrors.capacity = "Vui lòng nhập sức chứa hoặc tạo sơ đồ ghế";
    }

    if (Object.keys(newErrors).length > 0) {
      toast.error("Vui lòng kiểm tra lại thông tin");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    // Simulate processing
    setTimeout(() => {
      // Calculate actual capacity from seat map
      // Admin mode: capacity = rows x cols (tổng số ô)
      let actualCapacity = formData.capacity;
      if (seatMap.length > 0 && seatRows && seatCols) {
        actualCapacity = seatRows * seatCols;
      }

      const newVenue: Venue = {
        id: venue?.id || Date.now(),
        name: formData.name,
        description: formData.description,
        capacity: actualCapacity,
        status: formData.status,
        imageUrl: imagePreview || formData.imageUrl,
        isActive: formData.status !== "INACTIVE",
        seatMap:
          seatMap.length > 0
            ? {
                rows: seatRows,
                cols: seatCols,
                seats: seatMap,
                rowLabels: rowLabels,
              }
            : undefined,
      };

      onSuccess(newVenue);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-7xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {venue ? "Chỉnh sửa địa điểm" : "Thêm địa điểm mới"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Form - 2 Column Layout */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left Column - Form Fields */}
          <div className="w-1/2 p-6 space-y-6 overflow-y-auto border-r border-gray-200">
            <form id="venue-form" onSubmit={handleSubmit} className="space-y-6">
              {/* Name Input */}
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Tên địa điểm <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập tên địa điểm"
                  disabled={loading}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              {/* Status Select */}
              <div>
                <label
                  htmlFor="status"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Trạng thái <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                >
                  <option value="ACTIVE">Hoạt động</option>
                  <option value="MAINTENANCE">Đang sửa chữa</option>
                  <option value="INACTIVE">Ngừng hoạt động</option>
                </select>
              </div>

              {/* Description Textarea */}
              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Mô tả
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  placeholder="Nhập mô tả về địa điểm"
                  disabled={loading}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hình ảnh
                </label>

                {/* Image Preview */}
                {imagePreview ? (
                  <div className="relative mb-4">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                      disabled={loading}
                    >
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  // Upload Area
                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      errors.image ? "border-red-500" : "border-gray-300"
                    } hover:border-blue-500 transition-colors cursor-pointer`}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <ImageIcon size={40} className="text-gray-400" />
                      <div>
                        <p className="text-gray-700 font-medium text-sm">
                          Kéo thả ảnh vào đây
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          PNG, JPG, GIF tối đa 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                  disabled={loading}
                />

                {errors.image && (
                  <p className="text-red-500 text-sm mt-1">{errors.image}</p>
                )}
              </div>
            </form>
          </div>

          {/* Right Column - Seat Map Preview */}
          <div className="w-1/2 p-6 overflow-y-auto bg-gray-50">
            <SeatMapEditor
              rows={seatRows}
              cols={seatCols}
              onRowsChange={setSeatRows}
              onColsChange={setSeatCols}
              seatMap={seatMap}
              onSeatMapChange={setSeatMap}
              rowLabels={rowLabels}
              onRowLabelsChange={setRowLabels}
              mode="admin"
            />
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="venue-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            {venue ? "Cập nhật" : "Tạo mới"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VenueFormModal;
