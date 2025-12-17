import { useState, useEffect } from 'react';
import { X, Loader } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Campus, Status } from '../../../types/Campus';
import { uploadImageToCloudinary } from '../../../utils/uploadImg';

interface CampusFormModalProps {
  campus: Campus | null;
  onClose: () => void;
  onSuccess: (campus: Campus) => void;
}

interface FormData {
  code: string;
  name: string;
  address: string;
  capacity?: number;
  image: string;
  status: Status;
}

interface FormErrors {
  code?: string;
  name?: string;
  address?: string;
  capacity?: number;
  image?: string;
}

const CampusFormModal = ({ campus, onClose, onSuccess }: CampusFormModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    code: '',
    name: '',
    address: '',
    capacity: undefined,
    image: '',
    status: 'Active',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (campus) {
      setFormData({
        code: campus.code,
        name: campus.name,
        address: campus.address,
        capacity: campus.capacity ?? undefined,
        image: campus.image || '',
        status: campus.status,
      });
      setPreviewUrl(campus.image || '');
    } else {
      setPreviewUrl('');
    }
  }, [campus]);

  // Cleanup object URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.code.trim()) {
      newErrors.code = 'Mã campus là bắt buộc';
    }

    if (!formData.name.trim()) {
      newErrors.name = 'Tên campus là bắt buộc';
    }

    if (!formData.address.trim()) {
      newErrors.address = 'Địa chỉ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    
    // Handle capacity as number
    if (name === 'capacity') {
      const numValue = value === '' ? undefined : parseInt(value, 10);
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
    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    // Cleanup previous preview URL if it's a blob URL
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }

    // Create preview URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, image: imageUrl }));
      toast.success('Tải ảnh lên thành công!');
      // Update preview to show Cloudinary URL
      setPreviewUrl(imageUrl);
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
      console.error('Error uploading image:', err);
      // Revert to previous URL or clear
      if (campus?.image) {
        setPreviewUrl(campus.image);
      } else {
        setPreviewUrl('');
        if (previewUrl && previewUrl.startsWith('blob:')) {
          URL.revokeObjectURL(previewUrl);
        }
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    // Cleanup blob URL if exists
    if (previewUrl && previewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFormData((prev) => ({ ...prev, image: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      const campusData: Campus = {
        id: campus?.id || Date.now(),
        code: formData.code.toUpperCase(),
        name: formData.name,
        address: formData.address,
        capacity: formData.capacity,
        image: formData.image,
        status: formData.status,
        venues: campus?.venues || [],
      };

      onSuccess(campusData);
    } catch (error) {
      console.error('Error saving campus:', error);
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
            {campus ? 'Chỉnh sửa Campus' : 'Thêm Campus mới'}
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
          {/* Code & Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã Campus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="code"
                value={formData.code}
                onChange={handleChange}
                placeholder="VD: HCM, HN, DN"
                disabled={!!campus}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.code ? 'border-red-500' : 'border-gray-300'
                } ${campus ? 'bg-gray-100 cursor-not-allowed' : ''}`}
              />
              {errors.code && (
                <p className="text-red-500 text-sm mt-1">{errors.code}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên Campus <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="VD: Campus Hồ Chí Minh"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-1">{errors.name}</p>
              )}
            </div>
          </div>

         {/* Capacity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sức chứa
            </label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity ?? ''}
              onChange={handleChange}
              placeholder="VD: 2000"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.capacity && (
              <p className="text-red-500 text-sm mt-1">{errors.capacity}</p>
            )}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ <span className="text-red-500">*</span>
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Nhập địa chỉ chi tiết của campus"
              rows={3}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh Campus
            </label>
            <div className="space-y-3">
              {/* Preview */}
              {previewUrl ? (
                <div className="relative">
                  <img
                    src={previewUrl}
                    alt="Preview hình ảnh campus"
                    className="w-full h-48 object-contain bg-gray-50 border border-gray-200 rounded-lg p-2"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
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
                  className="w-full text-sm border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                {isUploading && (
                  <div className="flex items-center gap-2 mt-2 text-sm text-blue-600">
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

          {/* Status
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Active">Hoạt động</option>
              <option value="Inactive">Ngừng hoạt động</option>
            </select>
          </div> */}

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
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang lưu...' : campus ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CampusFormModal;
