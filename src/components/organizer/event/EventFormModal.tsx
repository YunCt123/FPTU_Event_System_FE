import { useState, useEffect } from 'react';
import { X, Calendar, Users, MapPin, Clock } from 'lucide-react';
import type { Event, EventType } from '../../../types/Event';

interface EventFormModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: (event: Event) => void;
}

interface FormData {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  venueId: string;
  campusId: string;
  imageUrl: string;
  requiresApproval: boolean;
}

interface FormErrors {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  maxParticipants?: string;
}

const EventFormModal = ({ event, onClose, onSuccess }: EventFormModalProps) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    eventType: 'CONFERENCE',
    startDate: '',
    endDate: '',
    registrationDeadline: '',
    maxParticipants: 50,
    venueId: '',
    campusId: '',
    imageUrl: '',
    requiresApproval: true,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        description: event.description,
        eventType: event.eventType,
        startDate: event.startDate.split('T')[0],
        endDate: event.endDate.split('T')[0],
        registrationDeadline: event.registrationDeadline.split('T')[0],
        maxParticipants: event.maxParticipants,
        venueId: event.venueId?.toString() || '',
        campusId: event.campusId?.toString() || '',
        imageUrl: event.imageUrl || '',
        requiresApproval: event.requiresApproval,
      });
    }
  }, [event]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Tên sự kiện là bắt buộc';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Mô tả là bắt buộc';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Ngày bắt đầu là bắt buộc';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc là bắt buộc';
    }

    if (formData.startDate && formData.endDate && formData.startDate > formData.endDate) {
      newErrors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu';
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = 'Hạn đăng ký là bắt buộc';
    }

    if (formData.registrationDeadline && formData.startDate && formData.registrationDeadline > formData.startDate) {
      newErrors.registrationDeadline = 'Hạn đăng ký phải trước ngày bắt đầu';
    }

    if (!formData.maxParticipants || formData.maxParticipants <= 0) {
      newErrors.maxParticipants = 'Số lượng tham gia phải lớn hơn 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

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
      await new Promise((resolve) => setTimeout(resolve, 500));

      const eventData: Event = {
        id: event?.id || Date.now(),
        title: formData.title,
        description: formData.description,
        eventType: formData.eventType,
        status: event?.status || 'DRAFT',
        startDate: new Date(formData.startDate).toISOString(),
        endDate: new Date(formData.endDate).toISOString(),
        registrationDeadline: new Date(formData.registrationDeadline).toISOString(),
        maxParticipants: formData.maxParticipants,
        currentParticipants: event?.currentParticipants || 0,
        venueId: formData.venueId ? parseInt(formData.venueId) : undefined,
        venueName: event?.venueName,
        campusId: formData.campusId ? parseInt(formData.campusId) : undefined,
        campusName: event?.campusName,
        organizerId: event?.organizerId || 1,
        organizerName: event?.organizerName || 'FPT Event Club',
        imageUrl: formData.imageUrl || undefined,
        requiresApproval: formData.requiresApproval,
        isPublished: event?.isPublished || false,
        createdAt: event?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      onSuccess(eventData);
    } catch (error) {
      console.error('Error saving event:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const eventTypes: { value: EventType; label: string }[] = [
    { value: 'CONFERENCE', label: 'Hội nghị' },
    { value: 'WORKSHOP', label: 'Workshop' },
    { value: 'SEMINAR', label: 'Hội thảo' },
    { value: 'COMPETITION', label: 'Cuộc thi' },
    { value: 'CULTURAL', label: 'Văn hóa' },
    { value: 'SPORTS', label: 'Thể thao' },
    { value: 'OTHER', label: 'Khác' },
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h2 className="text-2xl font-bold text-gray-900">
            {event ? 'Chỉnh sửa Sự kiện' : 'Tạo Sự kiện mới'}
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
          {/* Title & Event Type */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="VD: Hội thảo Công nghệ AI 2024"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại sự kiện
              </label>
              <select
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {eventTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Mô tả chi tiết về sự kiện..."
              rows={4}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} />
                Ngày bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.startDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.startDate && (
                <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={16} />
                Ngày kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.endDate ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.endDate && (
                <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Clock size={16} />
                Hạn đăng ký <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.registrationDeadline ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.registrationDeadline && (
                <p className="text-red-500 text-sm mt-1">{errors.registrationDeadline}</p>
              )}
            </div>
          </div>

          {/* Max Participants, Venue, Campus */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Users size={16} />
                Số lượng tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.maxParticipants ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.maxParticipants && (
                <p className="text-red-500 text-sm mt-1">{errors.maxParticipants}</p>
              )}
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <MapPin size={16} />
                Địa điểm
              </label>
              <input
                type="text"
                name="venueId"
                value={formData.venueId}
                onChange={handleChange}
                placeholder="ID địa điểm"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Campus
              </label>
              <input
                type="text"
                name="campusId"
                value={formData.campusId}
                onChange={handleChange}
                placeholder="ID campus"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Hình ảnh
            </label>
            <input
              type="text"
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {formData.imageUrl && (
              <div className="mt-2">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-48 object-cover rounded-lg"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Requires Approval */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requiresApproval"
              name="requiresApproval"
              checked={formData.requiresApproval}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="requiresApproval" className="ml-2 text-sm text-gray-700">
              Yêu cầu phê duyệt từ admin
            </label>
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
              className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors ${
                isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? 'Đang lưu...' : event ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
