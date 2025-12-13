import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Image as ImageIcon,
  Tag,
} from "lucide-react";
import type { Event, CreateEventRequest } from "../../../types/Event";
import { toast } from "react-toastify";
import { organizerService } from "../../../services";

interface EventFormModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: (event: Event) => void;
}

const EventFormModal = ({ event, onClose, onSuccess }: EventFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "", // ✅ Đổi default từ "WORKSHOP" thành ""
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    endTimeRegister: "",
    maxParticipants: 100,
    venueId: "",
    bannerUrl: "",
    imageUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Initialize form with event data if editing
  useEffect(() => {
    if (event) {
      console.log("Initializing form with event:", event);
      setFormData({
        title: event.title || "",
        description: event.description || "",
        eventType: event.eventType || "", // ✅ Giữ nguyên value từ event
        startDate: event.startDate
          ? new Date(event.startDate).toISOString().slice(0, 16)
          : "",
        endDate: event.endDate
          ? new Date(event.endDate).toISOString().slice(0, 16)
          : "",
        registrationDeadline: event.registrationDeadline
          ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
          : "",
        endTimeRegister: event.registrationDeadline
          ? new Date(event.registrationDeadline).toISOString().slice(0, 16)
          : "",
        maxParticipants: event.maxParticipants || 100,
        venueId: event.venueId?.toString() || "",
        bannerUrl: "",
        imageUrl: "",
      });
    }
  }, [event]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên sự kiện";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả sự kiện";
    }

    // ✅ THÊM VALIDATION CHO EVENT TYPE
    if (!formData.eventType.trim()) {
      newErrors.eventType = "Vui lòng nhập loại sự kiện";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn thời gian bắt đầu";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn thời gian kết thúc";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Vui lòng chọn thời gian mở đăng ký";
    }

    if (!formData.endTimeRegister) {
      newErrors.endTimeRegister = "Vui lòng chọn thời gian đóng đăng ký";
    }

    // VALIDATE: registrationDeadline < endTimeRegister <= startDate
    if (formData.registrationDeadline && formData.endTimeRegister) {
      if (
        new Date(formData.endTimeRegister) <=
        new Date(formData.registrationDeadline)
      ) {
        newErrors.endTimeRegister =
          "Thời gian đóng đăng ký phải sau thời gian mở đăng ký";
      }
    }

    if (formData.endTimeRegister && formData.startDate) {
      if (new Date(formData.endTimeRegister) > new Date(formData.startDate)) {
        newErrors.endTimeRegister =
          "Thời gian đóng đăng ký phải trước hoặc bằng thời gian bắt đầu sự kiện";
      }
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Số lượng người tham gia phải lớn hơn 0";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== SUBMIT START ===");
    console.log("Form data:", formData);

    if (!validateForm()) {
      console.log("❌ Validation failed");
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    console.log("✅ Validation passed");
    setIsSubmitting(true);

    try {
      // Log raw form values
      console.log("📝 Raw form values:");
      console.log("  startDate:", formData.startDate);
      console.log("  endDate:", formData.endDate);
      console.log("  registrationDeadline:", formData.registrationDeadline);
      console.log("  endTimeRegister:", formData.endTimeRegister);

      // Helper function để format datetime cho API
      const formatDateTime = (dateString: string): string => {
        const date = new Date(dateString);
        const offset = -date.getTimezoneOffset();
        const sign = offset >= 0 ? "+" : "-";
        const hours = Math.floor(Math.abs(offset) / 60)
          .toString()
          .padStart(2, "0");
        const minutes = (Math.abs(offset) % 60).toString().padStart(2, "0");
        return date.toISOString().slice(0, 19) + sign + hours + ":" + minutes;
      };

      // Map formData sang CreateEventRequest format theo Swagger
      const requestData: CreateEventRequest = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.eventType,
        bannerUrl: formData.bannerUrl?.trim() || undefined,
        startTime: formatDateTime(formData.startDate),
        endTime: formatDateTime(formData.endDate),
        startTimeRegister: formatDateTime(formData.registrationDeadline),
        endTimeRegister: formatDateTime(formData.endTimeRegister),
        maxCapacity: Number(formData.maxParticipants),
        isGlobal: true,
        organizerId: 1,
        venueId: Number(formData.venueId) || 1,
        hostId: 1,
        staffIds: [],
        speakers: [],
      };

      console.log("📤 Request data:", requestData);
      console.log("📤 Request JSON:");
      console.log(JSON.stringify(requestData, null, 2));

      // Log từng field để check
      console.log("🔍 Field validation:");
      console.log(
        "  title:",
        requestData.title,
        "(length:",
        requestData.title.length + ")"
      );
      console.log(
        "  description:",
        requestData.description.substring(0, 50) + "..."
      );
      console.log("  category:", requestData.category);
      console.log("  startTime:", requestData.startTime);
      console.log("  endTime:", requestData.endTime);
      console.log("  startTimeRegister:", requestData.startTimeRegister);
      console.log("  endTimeRegister:", requestData.endTimeRegister);
      console.log(
        "  maxCapacity:",
        requestData.maxCapacity,
        "(type:",
        typeof requestData.maxCapacity + ")"
      );
      console.log(
        "  venueId:",
        requestData.venueId,
        "(type:",
        typeof requestData.venueId + ")"
      );

      // Gọi API để tạo sự kiện
      const response = await organizerService.postEvent(requestData);

      console.log("📥 API response:", response);
      console.log("📥 Response data:", response.data);

      if (response.data.success && response.data.data) {
        const apiEvent = response.data.data;

        const savedEvent: Event = {
          id: parseInt(apiEvent.id),
          title: apiEvent.title,
          description: apiEvent.description,
          eventType: formData.eventType as any,
          status: (apiEvent.status as any) || "PENDING",
          startDate: apiEvent.startTime,
          endDate: apiEvent.endTime,
          registrationDeadline: apiEvent.startTimeRegistration,
          maxParticipants: apiEvent.maxCapacity,
          currentParticipants: apiEvent.registeredCount || 0,
          venueId: apiEvent.venueId,
          venueName: apiEvent.venue?.name || "",
          campusId: apiEvent.venue?.campusId,
          campusName: apiEvent.venue?.campus?.name || "",
          organizerId: apiEvent.organizerId,
          organizerName: apiEvent.organizer?.name || "",
          requiresApproval: true,
          isPublished: false,
        };

        console.log("Event created successfully:", savedEvent);
        toast.success("Tạo sự kiện thành công!");
        onSuccess(savedEvent);
      } else {
        console.error("API returned success=false:", response.data);
        throw new Error(response.data.message || "Không thể tạo sự kiện");
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error response:", error.response);
      console.error("Error response data:", error.response?.data);
      console.error("Error response status:", error.response?.status);
      console.error("Error response headers:", error.response?.headers);
      console.error("Error config:", error.config);

      // Log validation errors từ backend nếu có
      if (error.response?.data?.errors) {
        console.error(
          "Validation errors from backend:",
          error.response.data.errors
        );
      }

      // Parse error message từ API
      let errorMessage = "Đã xảy ra lỗi khi lưu sự kiện";

      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        // Handle validation errors array
        if (Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors
            .map((e: any) => e.message || e)
            .join(", ");
        } else if (typeof error.response.data.errors === "object") {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
        }
      } else if (error.response?.data?.error) {
        if (typeof error.response.data.error === "string") {
          errorMessage = error.response.data.error;
        } else if (Array.isArray(error.response.data.error)) {
          errorMessage = error.response.data.error.join(", ");
        }
      } else if (error.message) {
        errorMessage = error.message;
      }

      console.error("Final error message:", errorMessage);
      toast.error(errorMessage);
    } finally {
      console.log("=== SUBMIT END ===");
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
            <h2 className="text-2xl font-bold text-white">
              {event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tên sự kiện */}
            <div>
              <label
                htmlFor="title"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <FileText size={16} className="text-orange-500" />
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Nhập tên sự kiện..."
                className={`w-full px-4 py-3 border ${
                  errors.title ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                disabled={isSubmitting}
              />
              {errors.title && (
                <p className="text-red-500 text-xs mt-1">{errors.title}</p>
              )}
            </div>

            {/* Loại sự kiện - ĐỔI TỪ SELECT THÀNH INPUT */}
            <div>
              <label
                htmlFor="eventType"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <Tag size={16} className="text-orange-500" />
                Loại sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="eventType"
                name="eventType"
                value={formData.eventType}
                onChange={handleChange}
                placeholder="VD: Workshop, Seminar, Conference, Hackathon..."
                className={`w-full px-4 py-3 border ${
                  errors.eventType ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                disabled={isSubmitting}
              />
              {errors.eventType && (
                <p className="text-red-500 text-xs mt-1">{errors.eventType}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Nhập loại sự kiện theo ý bạn (VD: Workshop, Seminar, Conference, Hackathon, Training, Webinar...)
              </p>
            </div>

            {/* Mô tả */}
            <div>
              <label
                htmlFor="description"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <FileText size={16} className="text-orange-500" />
                Mô tả sự kiện <span className="text-red-500">*</span>
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Nhập mô tả chi tiết về sự kiện..."
                rows={4}
                className={`w-full px-4 py-3 border ${
                  errors.description ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all`}
                disabled={isSubmitting}
              />
              {errors.description && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.description}
                </p>
              )}
            </div>

            {/* Thời gian - Grid 2 cột */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Thời gian bắt đầu */}
              <div>
                <label
                  htmlFor="startDate"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Calendar size={16} className="text-orange-500" />
                  Thời gian bắt đầu <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.startDate ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.startDate}
                  </p>
                )}
              </div>

              {/* Thời gian kết thúc */}
              <div>
                <label
                  htmlFor="endDate"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Calendar size={16} className="text-orange-500" />
                  Thời gian kết thúc <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.endDate ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.endDate}</p>
                )}
              </div>
            </div>

            {/* Hạn đăng ký */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="registrationDeadline"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Clock size={16} className="text-orange-500" />
                  Thời gian mở đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="registrationDeadline"
                  name="registrationDeadline"
                  value={formData.registrationDeadline}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.registrationDeadline
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.registrationDeadline && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.registrationDeadline}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="endTimeRegister"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Clock size={16} className="text-orange-500" />
                  Thời gian đóng đăng ký <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  id="endTimeRegister"
                  name="endTimeRegister"
                  value={formData.endTimeRegister}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.endTimeRegister
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.endTimeRegister && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.endTimeRegister}
                  </p>
                )}
              </div>
            </div>

            {/* Số lượng người tham gia */}
            <div>
              <label
                htmlFor="maxParticipants"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <Users size={16} className="text-orange-500" />
                Số lượng người tham gia tối đa{" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleChange}
                min="1"
                placeholder="100"
                className={`w-full px-4 py-3 border ${
                  errors.maxParticipants ? "border-red-500" : "border-gray-300"
                } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                disabled={isSubmitting}
              />
              {errors.maxParticipants && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.maxParticipants}
                </p>
              )}
            </div>

            {/* Địa điểm - TODO: Add venue selector */}
            <div>
              <label
                htmlFor="venueId"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <MapPin size={16} className="text-orange-500" />
                Địa điểm
              </label>
              <select
                id="venueId"
                name="venueId"
                value={formData.venueId}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              >
                <option value="">Chọn địa điểm...</option>
                <option value="1">FU HCM Hall A</option>
                <option value="2">FU HCM Hall B</option>
                <option value="3">FU HCM Auditorium</option>
                {/* TODO: Load venues from API */}
              </select>
            </div>

            {/* Banner URL (optional) */}
            <div>
              <label
                htmlFor="bannerUrl"
                className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
              >
                <ImageIcon size={16} className="text-orange-500" />
                Banner URL (tùy chọn)
              </label>
              <input
                type="url"
                id="bannerUrl"
                name="bannerUrl"
                value={formData.bannerUrl}
                onChange={handleChange}
                placeholder="https://example.com/banner.jpg"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                disabled={isSubmitting}
              />
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang lưu...
              </>
            ) : event ? (
              "Cập nhật"
            ) : (
              "Tạo sự kiện"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EventFormModal;
