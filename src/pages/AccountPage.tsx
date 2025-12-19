import { useEffect, useState } from "react";
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Building2,
  Shield,
  Edit,
  Camera,
  CheckCircle,
  XCircle,
  IdCard,
  Save,
  X,
  Loader,
  Lock,
} from "lucide-react";
import type { User } from "../types/User";
import { authService, userService } from "../services";
import type { UpdateAccountRequest } from "../types/Auth";
import { toast } from "react-toastify";
import { uploadImageToCloudinary } from "../utils/uploadImg";
import ChangePasswordModal from "../components/auth/ChangePasswordModal";


const InfoItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: any;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border">
    <Icon size={20} className="text-[#F27125]" />
    <div>
      <div className="text-sm text-gray-500">{label}</div>
      <div className="font-semibold text-gray-900">{value}</div>
    </div>
  </div>
);

const AccountPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [formData, setFormData] = useState<UpdateAccountRequest>({
    userName: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: true,
    address: "",
    avatar: "",
  });


  const fetchUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await userService.getUserInUse();
      if (res.status === 200) {
        setUser(res.data);
        setFormData({
          userName: res.data.userName,
          firstName: res.data.firstName,
          lastName: res.data.lastName,
          phoneNumber: res.data.phoneNumber || "",
          gender: res.data.gender ?? true,
          address: res.data.address || "",
          avatar: res.data.avatar || "",
        });
        setAvatarPreview(res.data.avatar || "");
      }
    } catch {
      setError("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        userName: user.userName,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber || "",
        gender: user.gender ?? true,
        address: user.address || "",
        avatar: user.avatar || "",
      });
      setAvatarPreview(user.avatar || "");
      setAvatarFile(null);
    }
    setEditing(false);
  };

  const handleSubmit = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('Vui lòng nhập họ và tên');
      return;
    }

    setIsSubmitting(true);
    try {
      let avatarUrl = formData.avatar;

      // Upload avatar if changed
      if (avatarFile) {
        toast.info('Đang tải ảnh đại diện...');
        avatarUrl = await uploadImageToCloudinary(avatarFile);
      }

      const updateData: UpdateAccountRequest = {
        ...formData,
        avatar: avatarUrl,
      };

      const response = await authService.updateAccount(updateData);
      
      if (response.status === 200) {
        toast.success('Cập nhật thông tin thành công!');
        await fetchUser();
        setEditing(false);
        setAvatarFile(null);
      }
    } catch (error: any) {
      console.error('Error updating account:', error);
      const errorMessage = error.response?.data?.message || 'Cập nhật thất bại. Vui lòng thử lại!';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <div className="animate-spin h-12 w-12 border-b-2 border-[#F27125] rounded-full" />
      </div>
    );
  }

  if (!user || error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <XCircle size={64} className="text-red-500 mb-4" />
        <p className="text-gray-600 mb-4">{error}</p>
        <button
          onClick={fetchUser}
          className="px-6 py-2 bg-[#F27125] text-white rounded-lg"
        >
          Thử lại
        </button>
      </div>
    );
  }

  const roleMap: Record<string, string> = {
    admin: "Quản trị viên",
    event_organizer: "Tổ chức sự kiện",
    staff: "Nhân viên",
    student: "Sinh viên",
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="bg-gradient-to-br from-[#F27125] to-[#d95c0b] rounded-2xl shadow-lg p-8">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          {/* Avatar */}
          <div className="relative shrink-0">
            <div className="w-36 h-36 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              {avatarPreview ? (
                <img
                  src={avatarPreview}
                  alt={user.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <UserIcon size={64} className="text-gray-400" />
                </div>
              )}
            </div>
            {editing && (
              <label className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:scale-105 transition cursor-pointer">
                <Camera size={18} className="text-[#F27125]" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-white text-center md:text-left">
            <h1 className="text-3xl font-bold">
              {user.firstName} {user.lastName}
            </h1>
            <p className="opacity-80">@{user.userName}</p>

            <div className="mt-3 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm">
                {roleMap[user.roleName]}
              </span>
              {user.isActive ? (
                <span className="flex items-center gap-1 bg-green-500/20 px-3 py-1 rounded-full text-sm">
                  <CheckCircle size={14} /> Hoạt động
                </span>
              ) : (
                <span className="flex items-center gap-1 bg-red-500/20 px-3 py-1 rounded-full text-sm">
                  <XCircle size={14} /> Ngừng hoạt động
                </span>
              )}
            </div>
          </div>

          {!editing ? (
            <button
              onClick={handleEdit}
              className="bg-white text-[#F27125] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow hover:shadow-lg transition"
            >
              <Edit size={18} /> Chỉnh sửa
            </button>
          ) : (
            <div className="flex gap-3">
              <button
                onClick={handleCancel}
                disabled={isSubmitting}
                className="bg-white/20 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:bg-white/30 transition disabled:opacity-50"
              >
                <X size={18} /> Hủy
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-white text-[#F27125] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow hover:shadow-lg transition disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader size={18} className="animate-spin" /> Đang lưu...
                  </>
                ) : (
                  <>
                    <Save size={18} /> Lưu
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserIcon className="text-[#F27125]" /> Thông tin cá nhân
          </h2>

          {editing ? (
            <div className="space-y-4">
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none"
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
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={user.email}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none"
                  placeholder="0123456789"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none resize-none"
                  placeholder="Nhập địa chỉ"
                />
              </div>

              <button
                onClick={() => setIsChangePasswordModalOpen(true)}
                className="w-full bg-[#F27125] text-white px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 shadow hover:bg-[#d95c0b] transition"
              >
                <Lock size={18} /> Đổi mật khẩu
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <InfoItem icon={Mail} label="Email" value={user.email} />
              <InfoItem
                icon={Phone}
                label="Số điện thoại"
                value={user.phoneNumber || "—"}
              />
              <InfoItem
                icon={MapPin}
                label="Địa chỉ"
                value={user.address || "—"}
              />
              <InfoItem
                icon={Calendar}
                label="Ngày tạo"
                value={new Date(user.createdAt).toLocaleDateString("vi-VN")}
              />
            </div>
          )}
        </div>

        {/* Academic Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <IdCard className="text-[#F27125]" /> Thông tin học tập
          </h2>

          <div className="grid grid-cols-1 gap-4">
            <InfoItem
              icon={IdCard}
              label="Mã sinh viên"
              value={user.studentCode || "Không có"}
            />
            <InfoItem
              icon={Building2}
              label="Campus"
              value={user.campus?.name || "—"}
            />
            <InfoItem
              icon={Shield}
              label="Vai trò"
              value={roleMap[user.roleName]}
            />
          </div>
        </div>
      </div>
      {/* Student Card */}
      {user.studentCode && (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <IdCard className="text-[#F27125]" /> Thẻ sinh viên
          </h2>

          <div className="max-w-md mx-auto rounded-xl overflow-hidden border">
            <div className="bg-linear-to-r from-[#F27125] to-[#d95c0b] text-white p-3 font-semibold">
              Student Card
            </div>
            <img
              src={user.avatar || "https://via.placeholder.com/400x250"}
              className="w-full bg-gray-100 object-contain"
            />
          </div>
        </div>
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => setIsChangePasswordModalOpen(false)}
      />
    </div>
  );
};

export default AccountPage;
