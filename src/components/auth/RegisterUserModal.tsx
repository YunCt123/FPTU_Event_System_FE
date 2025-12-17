import React, { useState } from 'react';
import { toast } from 'react-toastify';
import authService from '../../services/authService';
import { useNavigate } from 'react-router-dom';
import { uploadImageToCloudinary } from '../../utils/uploadImg';
import { Upload, X } from 'lucide-react';
// import { jwtDecode } from 'jwt-decode';

interface RegisterUserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegisterUserModal: React.FC<RegisterUserModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const [studentCardFile, setStudentCardFile] = useState<File | null>(null);
  const [studentCardPreview, setStudentCardPreview] = useState<string>('');
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    campusId: 0,
    studentCode: '',
    phoneNumber: '',
    gender: true,
    address: '',
    avatar: '',
    studentCardImage: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleStudentCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Kích thước ảnh không được vượt quá 5MB');
        return;
      }
      setStudentCardFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setStudentCardPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview('');
  };

  const removeStudentCard = () => {
    setStudentCardFile(null);
    setStudentCardPreview('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    if (!formData.campusId) {
      toast.error('Vui lòng chọn cơ sở!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Upload images if selected
      let avatarUrl = formData.avatar;
      let studentCardUrl = formData.studentCardImage;

      if (avatarFile) {
        toast.info('Đang tải ảnh đại diện...');
        avatarUrl = await uploadImageToCloudinary(avatarFile);
      }

      if (studentCardFile) {
        toast.info('Đang tải ảnh thẻ sinh viên...');
        studentCardUrl = await uploadImageToCloudinary(studentCardFile);
      }

      const registerData = {
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        campusId: formData.campusId,
        studentCode: formData.studentCode || undefined,
        phoneNumber: formData.phoneNumber || undefined,
        gender: formData.gender,
        address: formData.address || undefined,
        avatar: avatarUrl || undefined,
        studentCardImage: studentCardUrl || undefined
      };

      const response = await authService.register(registerData);

      if (response.status === 201 || response.data.success) {
        toast.success('Đăng ký thành công! Hãy đăng nhập.');
        
        // Auto login after register
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          'Đăng ký thất bại. Vui lòng thử lại!';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleCancel = () => {
    setFormData({
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      campusId: 0,
      studentCode: '',
      phoneNumber: '',
      gender: true,
      address: '',
      avatar: '',
      studentCardImage: ''
    });
    setAvatarFile(null);
    setAvatarPreview('');
    setStudentCardFile(null);
    setStudentCardPreview('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl p-8 w-full max-w-3xl shadow-2xl transform transition-all duration-300 max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Đăng ký tài khoản</h3>
          {/* <button 
            onClick={handleCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button> */}
        </div>
        <div className="max-h-[calc(90vh-140px)] overflow-y-auto pr-4 custom-scrollbar">
            <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên đăng nhập <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="userName"
                value={formData.userName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="Nhập tên đăng nhập"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="example@fpt.edu.vn"
              />
            </div>
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="Nhập họ"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="Nhập tên"
              />
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="Ít nhất 6 ký tự"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
          </div>

          {/* Campus & Student Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cơ sở <span className="text-red-500">*</span>
              </label>
              <select
                name="campusId"
                value={formData.campusId}
                onChange={(e) => setFormData(prev => ({ ...prev, campusId: parseInt(e.target.value) }))}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              >
                <option value="0">Chọn cơ sở</option>
                <option value="1">FU - Hòa Lạc</option>
                <option value="2">FU - Hồ Chí Minh</option>
                <option value="3">FU - Đà Nẵng</option>
                <option value="4">FU - Cần Thơ</option>
                <option value="5">FU - Quy Nhơn</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mã sinh viên
              </label>
              <input
                type="text"
                name="studentCode"
                value={formData.studentCode}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="SE123456"
              />
            </div>
          </div>

          {/* Phone & Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số điện thoại
              </label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                placeholder="0123456789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính
              </label>
              <select
                name="gender"
                value={formData.gender ? 'true' : 'false'}
                onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value === 'true' }))}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              >
                <option value="true">Nam</option>
                <option value="false">Nữ</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Địa chỉ
            </label>
            <textarea
              name="address"
              value={formData.address}
              onChange={handleChange}
              rows={2}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition resize-none"
              placeholder="Nhập địa chỉ của bạn"
            />
          </div>
          {/* Avatar Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh đại diện
            </label>
            <div className="space-y-3">
              {avatarPreview ? (
                <div className="relative inline-block">
                  <img
                    src={avatarPreview}
                    alt="Avatar preview"
                    className="w-32 h-32 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeAvatar}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#F27125] transition-colors bg-gray-50 hover:bg-gray-100">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-500">Nhấn để chọn ảnh</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG (tối đa 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Student Card Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh thẻ sinh viên
            </label>
            <div className="space-y-3">
              {studentCardPreview ? (
                <div className="relative inline-block">
                  <img
                    src={studentCardPreview}
                    alt="Student card preview"
                    className="w-48 h-32 rounded-lg object-cover border-2 border-gray-200"
                  />
                  <button
                    type="button"
                    onClick={removeStudentCard}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#F27125] transition-colors bg-gray-50 hover:bg-gray-100">
                  <Upload className="text-gray-400 mb-2" size={32} />
                  <span className="text-sm text-gray-500">Nhấn để chọn ảnh thẻ</span>
                  <span className="text-xs text-gray-400 mt-1">PNG, JPG (tối đa 5MB)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleStudentCardChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d95c0b] transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang đăng ký...' : 'Đăng ký'}
            </button>
          </div>
        </form>
        </div>
        
      </div>
    </div>
  );
};

export default RegisterUserModal;
