import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Venue } from '../../../types/Venue';

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
}

interface FormErrors {
  name?: string;
  location?: string;
  row?: string;
  column?: string;
}

const VenueFormModal = ({ venue, onClose, onSuccess }: VenueFormModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    location: '',
    row: 0,
    column: 0,
    hasSeats: false,
    mapImageUrl: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name,
        location: venue.location,
        row: venue.row,
        column: venue.column,
        hasSeats: venue.hasSeats,
        mapImageUrl: venue.mapImageUrl || '',
      });
    }
  }, [venue]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Tên venue là bắt buộc';
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Vị trí là bắt buộc';
    }

    // Chỉ validate hasSeats, row, column khi tạo mới
    if (!venue && formData.hasSeats) {
      if (!formData.row || formData.row <= 0) {
        newErrors.row = 'Số hàng phải lớn hơn 0';
      }
      if (!formData.column || formData.column <= 0) {
        newErrors.column = 'Số cột phải lớn hơn 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'row' || name === 'column') {
      const numValue = value === '' ? 0 : parseInt(value, 10);
      setFormData((prev) => ({ ...prev, [name]: numValue }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
    
    // Clear error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
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
        status: venue?.status || 'Active',
        campusId: venue?.campusId || 0,
      };

      onSuccess(venueData);
    } catch (error) {
      console.error('Error saving venue:', error);
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
            {venue ? 'Chỉnh sửa Venue' : 'Thêm Venue mới'}
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
                errors.name ? 'border-red-500' : 'border-gray-300'
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
                errors.location ? 'border-red-500' : 'border-gray-300'
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
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                <span className="font-medium">Trạng thái ghế ngồi:</span> {formData.hasSeats ? 'Có sơ đồ ghế' : 'Không có sơ đồ ghế'}
              </p>
              {formData.hasSeats && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Kích thước:</span> {formData.row} hàng × {formData.column} cột
                </p>
              )}
            </div>
          )}

          {/* Row and Column - Chỉ hiển thị khi tạo mới và hasSeats = true */}
          {!venue && formData.hasSeats && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số hàng <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="row"
                  value={formData.row || ''}
                  onChange={handleChange}
                  placeholder="VD: 10"
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.row ? 'border-red-500' : 'border-gray-300'
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
                  value={formData.column || ''}
                  onChange={handleChange}
                  placeholder="VD: 20"
                  min="1"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.column ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.column && (
                  <p className="text-red-500 text-sm mt-1">{errors.column}</p>
                )}
              </div>
            </div>
          )}

          {/* Map Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Hình ảnh sơ đồ
            </label>
            <input
              type="text"
              name="mapImageUrl"
              value={formData.mapImageUrl}
              onChange={handleChange}
              placeholder="https://example.com/map.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.mapImageUrl && (
              <div className="mt-2">
                <img
                  src={formData.mapImageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
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
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang lưu...' : venue ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VenueFormModal;
