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
} from "lucide-react";
import type { User } from "../types/User";
import { userService } from "../services";


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

  const fetchUser = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await userService.getUserInUse();
      if (res.status === 200) setUser(res.data);
    } catch {
      setError("Không thể tải thông tin người dùng");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

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
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserIcon size={64} className="m-auto text-gray-400" />
              )}
            </div>
            <button className="absolute bottom-2 right-2 bg-white p-2 rounded-full shadow hover:scale-105 transition">
              <Camera size={18} />
            </button>
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

          <button className="bg-white text-[#F27125] px-6 py-3 rounded-xl font-semibold flex items-center gap-2 shadow hover:shadow-lg">
            <Edit size={18} /> Chỉnh sửa
          </button>
        </div>
      </div>

      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <UserIcon className="text-[#F27125]" /> Thông tin cá nhân
          </h2>

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
            <div className="bg-gradient-to-r from-[#F27125] to-[#d95c0b] text-white p-3 font-semibold">
              Student Card
            </div>
            <img
              src={user.avatar || "https://via.placeholder.com/400x250"}
              className="w-full bg-gray-100 object-contain"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountPage;
