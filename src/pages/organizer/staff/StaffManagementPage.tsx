import { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Mail,
  Phone,
  Shield,
  CheckCircle,
  XCircle,
  Smartphone,
} from 'lucide-react';

interface Staff {
  id: number;
  accountId: number;
  fullName: string;
  email: string;
  phone: string;
  role: 'CHECK_IN' | 'SUPPORT' | 'COORDINATOR';
  status: 'ACTIVE' | 'INACTIVE';
  assignedAt: string;
  hasAppAccess: boolean;
}

const StaffManagementPage = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockStaff: Staff[] = [
      {
        id: 1,
        accountId: 101,
        fullName: 'Nguyễn Văn A',
        email: 'staff1@fpt.edu.vn',
        phone: '0912345678',
        role: 'CHECK_IN',
        status: 'ACTIVE',
        assignedAt: '2024-12-01T10:00:00',
        hasAppAccess: true,
      },
      {
        id: 2,
        accountId: 102,
        fullName: 'Trần Thị B',
        email: 'staff2@fpt.edu.vn',
        phone: '0987654321',
        role: 'SUPPORT',
        status: 'ACTIVE',
        assignedAt: '2024-12-01T11:00:00',
        hasAppAccess: true,
      },
      {
        id: 3,
        accountId: 103,
        fullName: 'Lê Văn C',
        email: 'staff3@fpt.edu.vn',
        phone: '0901234567',
        role: 'COORDINATOR',
        status: 'ACTIVE',
        assignedAt: '2024-12-02T09:00:00',
        hasAppAccess: false,
      },
    ];
    setStaffList(mockStaff);
    setFilteredStaff(mockStaff);
  }, []);

  useEffect(() => {
    const filtered = staffList.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery)
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staffList]);

  const getRoleBadge = (role: string) => {
    const roleConfig: Record<string, { label: string; className: string }> = {
      CHECK_IN: { label: 'Check-in', className: 'bg-blue-100 text-blue-700' },
      SUPPORT: { label: 'Hỗ trợ', className: 'bg-green-100 text-green-700' },
      COORDINATOR: { label: 'Điều phối', className: 'bg-purple-100 text-purple-700' },
    };

    const config = roleConfig[role];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const handleGrantAppAccess = (staffId: number) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, hasAppAccess: true } : s
      )
    );
    setActionMenuOpen(null);
    alert('Đã cấp quyền truy cập Mobile App');
  };

  const handleRevokeAppAccess = (staffId: number) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, hasAppAccess: false } : s
      )
    );
    setActionMenuOpen(null);
    alert('Đã thu hồi quyền truy cập Mobile App');
  };

  const handleDeleteStaff = (staffId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa staff này?')) {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
      setActionMenuOpen(null);
    }
  };

  const stats = {
    total: staffList.length,
    checkIn: staffList.filter((s) => s.role === 'CHECK_IN').length,
    support: staffList.filter((s) => s.role === 'SUPPORT').length,
    coordinator: staffList.filter((s) => s.role === 'COORDINATOR').length,
    appAccess: staffList.filter((s) => s.hasAppAccess).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Staff</h1>
          <p className="text-gray-600 mt-1">
            Phân công staff và cấp quyền truy cập Mobile Check-in App
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors"
        >
          <UserPlus size={20} />
          Thêm Staff
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng Staff</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Check-in</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.checkIn}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Hỗ trợ</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.support}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Điều phối</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.coordinator}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">App Access</div>
          <div className="text-2xl font-bold text-orange-600 mt-1">{stats.appAccess}</div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm staff theo tên, email, số điện thoại..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
          />
        </div>
      </div>

      {/* Staff List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStaff.map((staff) => (
          <div
            key={staff.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-linear-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {staff.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{staff.fullName}</h3>
                  {getRoleBadge(staff.role)}
                </div>
              </div>
              <div className="relative">
                <button
                  onClick={() =>
                    setActionMenuOpen(actionMenuOpen === staff.id ? null : staff.id)
                  }
                  className="p-1 hover:bg-gray-100 rounded-lg"
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>
                {actionMenuOpen === staff.id && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={() => console.log('Edit staff', staff.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Edit size={16} />
                      Chỉnh sửa
                    </button>
                    {staff.hasAppAccess ? (
                      <button
                        onClick={() => handleRevokeAppAccess(staff.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <XCircle size={16} />
                        Thu hồi App Access
                      </button>
                    ) : (
                      <button
                        onClick={() => handleGrantAppAccess(staff.id)}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                      >
                        <CheckCircle size={16} />
                        Cấp App Access
                      </button>
                    )}
                    <button
                      onClick={() => handleDeleteStaff(staff.id)}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                      Xóa
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-4">
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-gray-400" />
                {staff.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-gray-400" />
                {staff.phone}
              </div>
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-400" />
                <span>Account ID: {staff.accountId}</span>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone
                  size={16}
                  className={staff.hasAppAccess ? 'text-green-600' : 'text-gray-400'}
                />
                <span
                  className={`text-sm font-medium ${
                    staff.hasAppAccess ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  {staff.hasAppAccess ? 'App Access' : 'No Access'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                Assigned {new Date(staff.assignedAt).toLocaleDateString('vi-VN')}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy staff
          </h3>
          <p className="text-gray-600">
            {searchQuery
              ? 'Thử điều chỉnh từ khóa tìm kiếm'
              : 'Bắt đầu bằng cách thêm staff cho sự kiện'}
          </p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Smartphone className="text-blue-600 mt-0.5" size={20} />
          <div>
            <h4 className="font-semibold text-blue-900">Mobile Check-in App</h4>
            <p className="text-sm text-blue-700 mt-1">
              Staff được cấp quyền App Access có thể sử dụng Mobile App để check-in người tham dự tại sự kiện. Đảm bảo staff đã được đào tạo về cách sử dụng app trước khi sự kiện diễn ra.
            </p>
          </div>
        </div>
      </div>

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Thêm Staff mới</h2>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Handle form submission
                setIsAddModalOpen(false);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID *
                </label>
                <input
                  type="number"
                  required
                  placeholder="Nhập Account ID..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vai trò *
                </label>
                <select
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="">Chọn vai trò</option>
                  <option value="CHECK_IN">Check-in</option>
                  <option value="SUPPORT">Hỗ trợ</option>
                  <option value="COORDINATOR">Điều phối</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="grantAppAccess"
                  className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                />
                <label htmlFor="grantAppAccess" className="ml-2 text-sm text-gray-700">
                  Cấp quyền truy cập Mobile App ngay
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a]"
                >
                  Thêm Staff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffManagementPage;
