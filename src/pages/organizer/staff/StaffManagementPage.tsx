import { useState, useEffect } from 'react';
import {
  UserPlus,
  Search,
  Mail,
  Phone,
  Shield,
  Smartphone,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Staff, StaffRole, CreateStaffRequest } from '../../../types/Staff';
import type { Event } from '../../../types/Event';

const StaffManagementPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStaff, setFilteredStaff] = useState<Staff[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Partial<CreateStaffRequest>>({
    role: 'CHECK_IN',
    hasAppAccess: true,
  });

  useEffect(() => {
    // Mock events data
    const mockEvents: Event[] = [
      {
        id: 1,
        title: 'Workshop: AI & Machine Learning',
        description: 'Hội thảo về AI',
        eventType: 'WORKSHOP',
        status: 'APPROVED',
        startDate: '2024-12-10T09:00:00',
        endDate: '2024-12-10T17:00:00',
        registrationDeadline: '2024-12-08T23:59:59',
        maxParticipants: 100,
        currentParticipants: 85,
        organizerId: 1,
        requiresApproval: true,
        isPublished: true,
      },
      {
        id: 2,
        title: 'Tech Conference 2024',
        description: 'Hội nghị công nghệ',
        eventType: 'CONFERENCE',
        status: 'APPROVED',
        startDate: '2024-12-15T08:00:00',
        endDate: '2024-12-16T18:00:00',
        registrationDeadline: '2024-12-12T23:59:59',
        maxParticipants: 200,
        currentParticipants: 150,
        organizerId: 1,
        requiresApproval: true,
        isPublished: true,
      },
    ];
    setEvents(mockEvents);
    if (mockEvents.length > 0) {
      setSelectedEventId(mockEvents[0].id);
    }
  }, []);

  useEffect(() => {
    if (!selectedEventId) {
      setStaffList([]);
      return;
    }

    // Mock data - Replace with actual API call filtered by selectedEventId
    const mockStaff: Staff[] = [
      {
        id: 1,
        eventId: selectedEventId,
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
        eventId: selectedEventId,
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
        eventId: selectedEventId,
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
  }, [selectedEventId]);

  useEffect(() => {
    const filtered = staffList.filter(
      (staff) =>
        staff.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.phone.includes(searchQuery)
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staffList]);

  const getRoleBadge = (role: StaffRole) => {
    const roleConfig: Record<StaffRole, { label: string; className: string }> = {
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

  const handleToggleAppAccess = (staffId: number, currentStatus: boolean) => {
    setStaffList((prev) =>
      prev.map((s) =>
        s.id === staffId ? { ...s, hasAppAccess: !currentStatus } : s
      )
    );
  };

  const handleDeleteStaff = (staffId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa staff này?')) {
      setStaffList((prev) => prev.filter((s) => s.id !== staffId));
    }
  };

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaff.accountId || !newStaff.role || !selectedEventId) return;

    // Mock add staff - Replace with actual API call
    const staff: Staff = {
      id: Math.max(...staffList.map((s) => s.id), 0) + 1,
      eventId: selectedEventId,
      accountId: newStaff.accountId,
      fullName: `Staff ${newStaff.accountId}`,
      email: `staff${newStaff.accountId}@fpt.edu.vn`,
      phone: '0900000000',
      role: newStaff.role,
      status: 'ACTIVE',
      assignedAt: new Date().toISOString(),
      hasAppAccess: newStaff.hasAppAccess || false,
    };

    setStaffList((prev) => [...prev, staff]);
    setIsAddModalOpen(false);
    setNewStaff({ role: 'CHECK_IN', hasAppAccess: true });
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
            Phân công staff và cấp quyền truy cập Mobile Check-in App theo sự kiện
          </p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          disabled={!selectedEventId}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={20} />
          Thêm Staff
        </button>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn Sự kiện
        </label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
        >
          {events.length === 0 ? (
            <option value="">Không có sự kiện nào</option>
          ) : (
            events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.startDate).toLocaleDateString('vi-VN')}
              </option>
            ))
          )}
        </select>
      </div>

      {!selectedEventId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Shield className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng chọn sự kiện
          </h3>
          <p className="text-gray-600">
            Chọn một sự kiện để xem danh sách staff
          </p>
        </div>
      ) : (
        <>
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

          {/* Search */}
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

          {/* Staff Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Staff
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Liên hệ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Vai trò
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      App Access
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ngày phân công
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStaff.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-6 py-12 text-center">
                        <Shield className="mx-auto text-gray-400 mb-3" size={48} />
                        <p className="text-gray-600">
                          {searchQuery
                            ? 'Không tìm thấy staff'
                            : 'Chưa có staff nào được phân công cho sự kiện này'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredStaff.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                              {staff.fullName.charAt(0)}
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {staff.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Mail size={14} />
                              {staff.email}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone size={14} />
                              {staff.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {staff.accountId}
                        </td>
                        <td className="px-6 py-4">{getRoleBadge(staff.role)}</td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleToggleAppAccess(staff.id, staff.hasAppAccess)}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                              staff.hasAppAccess
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {staff.hasAppAccess ? (
                              <>
                                <CheckCircle size={14} />
                                Có quyền
                              </>
                            ) : (
                              <>
                                <XCircle size={14} />
                                Không
                              </>
                            )}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(staff.assignedAt).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteStaff(staff.id)}
                            className="text-red-600 hover:text-red-800 text-sm font-medium"
                          >
                            Xóa
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
        </>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Thêm Staff mới</h2>
            </div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Account ID *
                </label>
                <input
                  type="number"
                  required
                  value={newStaff.accountId || ''}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, accountId: Number(e.target.value) })
                  }
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
                  value={newStaff.role}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, role: e.target.value as StaffRole })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="CHECK_IN">Check-in</option>
                  <option value="SUPPORT">Hỗ trợ</option>
                  <option value="COORDINATOR">Điều phối</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="grantAppAccess"
                  checked={newStaff.hasAppAccess || false}
                  onChange={(e) =>
                    setNewStaff({ ...newStaff, hasAppAccess: e.target.checked })
                  }
                  className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                />
                <label htmlFor="grantAppAccess" className="ml-2 text-sm text-gray-700">
                  Cấp quyền truy cập Mobile App ngay
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddModalOpen(false);
                    setNewStaff({ role: 'CHECK_IN', hasAppAccess: true });
                  }}
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
