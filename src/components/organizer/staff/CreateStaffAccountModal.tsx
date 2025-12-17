import { useState, useEffect } from "react";
import { X, UserPlus, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import { userService } from "../../../services";
import campusService from "../../../services/campusSerivce";
import type { CreateStaffRequest } from "../../../types/User";
import type { Campus } from "../../../types/Campus";

interface CreateStaffAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStaffCreated: () => void;
}

const CreateStaffAccountModal = ({
  isOpen,
  onClose,
  onStaffCreated,
}: CreateStaffAccountModalProps) => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<CreateStaffRequest>({
    userName: "",
    email: "",
    password: "",
    campusId: 0,
    roleName: "staff",
    firstName: "",
    lastName: "",
    studentCode: "",
    phoneNumber: "",
    gender: true,
    address: "",
    avatar: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateStaffRequest, string>>
  >({});

  useEffect(() => {
    if (isOpen) {
      fetchCampuses();
      resetForm();
    }
  }, [isOpen]);

  const fetchCampuses = async () => {
    try {
      const response = await campusService.getAllCampuses();
      if (response.status === 200 && response.data) {
        setCampuses(response.data);
        if (response.data.length > 0) {
          setFormData((prev) => ({ ...prev, campusId: response.data[0].id }));
        }
      }
    } catch (error) {
      console.log("Error fetching campuses:", error);
      toast.error("Không thể tải danh sách campus");
    }
  };

  const resetForm = () => {
    setFormData({
      userName: "",
      email: "",
      password: "",
      campusId: 0,
      roleName: "staff",
      firstName: "",
      lastName: "",
      studentCode: "",
      phoneNumber: "",
      gender: true,
      address: "",
      avatar: "",
    });
    setErrors({});
    setShowPassword(false);
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof CreateStaffRequest, string>> = {};

    if (!formData.userName.trim()) {
      newErrors.userName = "Tên đăng nhập là bắt buộc";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email là bắt buộc";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.password.trim()) {
      newErrors.password = "Mật khẩu là bắt buộc";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.firstName.trim()) {
      newErrors.firstName = "Họ là bắt buộc";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Tên là bắt buộc";
    }

    if (!formData.campusId || formData.campusId === 0) {
      newErrors.campusId = "Vui lòng chọn campus";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === "campusId") {
      setFormData((prev) => ({ ...prev, [name]: parseInt(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    // Clear error when user types
    if (errors[name as keyof CreateStaffRequest]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await userService.createStaff(formData);
      if (response.status === 201) {
        toast.success("Tạo tài khoản staff thành công");
        onStaffCreated();
        onClose();
      } else {
        toast.error("Tạo tài khoản thất bại");
      }
    } catch (error: unknown) {
      console.log("Error creating staff:", error);
      const err = error as { response?: { data?: { message?: string } } };
      toast.error(
        err.response?.data?.message || "Có lỗi xảy ra khi tạo tài khoản"
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 shrink-0 from-[#F27125] to-[#d95c0b] rounded-t-xl">
          <div className="flex items-center gap-3">
            <UserPlus className="text-white" size={24} />
            <div>
              <h2 className="text-xl font-bold text-white">
                Tạo Tài Khoản Staff
              </h2>
              <p className="text-sm text-white/90">
                Tạo tài khoản mới cho nhân viên
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                  errors.userName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên đăng nhập"
              />
              {errors.userName && (
                <p className="text-red-500 text-xs mt-1">{errors.userName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập email"
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nhập mật khẩu"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
            </div>

            {/* Campus */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Campus <span className="text-red-500">*</span>
              </label>
              <select
                name="campusId"
                value={formData.campusId}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                  errors.campusId ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value={0}>Chọn campus</option>
                {campuses.map((campus) => (
                  <option key={campus.id} value={campus.id}>
                    {campus.name} ({campus.code})
                  </option>
                ))}
              </select>
              {errors.campusId && (
                <p className="text-red-500 text-xs mt-1">{errors.campusId}</p>
              )}
            </div>

            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                  errors.firstName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập họ"
              />
              {errors.firstName && (
                <p className="text-red-500 text-xs mt-1">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent ${
                  errors.lastName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Nhập tên"
              />
              {errors.lastName && (
                <p className="text-red-500 text-xs mt-1">{errors.lastName}</p>
              )}
            </div>

            {/* Student Code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Mã sinh viên
              </label>
              <input
                type="text"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                placeholder="Nhập mã sinh viên (nếu có)"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số điện thoại
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                placeholder="Nhập số điện thoại"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender ? "true" : "false"}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    gender: e.target.value === "true",
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
              >
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Địa chỉ
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                placeholder="Nhập địa chỉ"
              />
            </div>

            {/* Avatar URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                URL Ảnh đại diện
              </label>
              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                placeholder="https://example.com/avatar.png"
              />
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            disabled={isLoading}
            className="px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <UserPlus size={18} />
            {isLoading ? "Đang tạo..." : "Tạo Tài Khoản"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateStaffAccountModal;
