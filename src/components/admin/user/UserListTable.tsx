import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useSearchParams } from "react-router-dom";
import userService from "../../../services/userService";
import type { Meta, User } from "../../../types/User";
import {
  UserStar,
  UserCog,
  User as UserIcon,
  Search,
  Loader,
  Trash2,
  Eye,
  X,
  Check,
  UserPlus,
} from "lucide-react";
import UserDetailModal from "./UserDetailModal";
import ConfirmModal from "../../common/ConfirmModal";
import ActionDropdown from "../../ActionDropdown";

const UserListTable = () => {
  const [searchParams] = useSearchParams();
  const roleFromUrl = searchParams.get("role") as
    | "event_organizer"
    | "staff"
    | "student"
    | null;
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "event_organizer" | "staff" | "student"
  >(roleFromUrl || "event_organizer");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [pagination, setPagination] = useState<Meta>();
  const [currentPage, setCurrentPage] = useState(1);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    isDeactivate: boolean;
  }>({ isOpen: false, userId: null, isDeactivate: true });
  const [rejectModal, setRejectModal] = useState<{
    isOpen: boolean;
    userId: number | null;
    reason: string;
  }>({ isOpen: false, userId: null, reason: "" });

  const roleLabels = {
    event_organizer: "Event Organizer",
    staff: "Staff",
    student: "Student",
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, userId: id, isDeactivate: true });
  };

  const handleActivate = (id: number) => {
    setConfirmModal({ isOpen: true, userId: id, isDeactivate: false });
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, userId: null, isDeactivate: true });
  };

  const roleIcons = {
    event_organizer: <UserStar size={20} className="text-purple-600" />,
    staff: <UserCog size={20} className="text-blue-600" />,
    student: <UserIcon size={20} className="text-green-600" />,
  };

  const handleStatusUser = async (id: number, status: string) => {
    setLoading(true);
    try {
      const response = await userService.patchUserStatus(id, { status });
      if (response.data) {
        toast.success("Cập nhật trạng thái người dùng thành công");
        fetchUsers(currentPage);
      } else {
        toast.error("Cập nhật trạng thái người dùng thất bại");
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleReject = (id: number) => {
    setRejectModal({ isOpen: true, userId: id, reason: "" });
  };

  const confirmReject = async () => {
    if (!rejectModal.userId) return;
    if (!rejectModal.reason.trim()) {
      toast.warning("Vui lòng nhập lý do từ chối");
      return;
    }

    setLoading(true);
    try {
      const response = await userService.patchUserStatus(rejectModal.userId, {
        status: "REJECTED",
        reason: rejectModal.reason,
      });
      if (response.data) {
        toast.success("Từ chối người dùng thành công");
        setRejectModal({ isOpen: false, userId: null, reason: "" });
        fetchUsers(currentPage);
      } else {
        toast.error("Từ chối người dùng thất bại");
      }
    } catch (error) {
      console.error("Error rejecting user:", error);
      toast.error("Có lỗi xảy ra khi từ chối người dùng");
    } finally {
      setLoading(false);
    }
  };

  const cancelReject = () => {
    setRejectModal({ isOpen: false, userId: null, reason: "" });
  };

  useEffect(() => {
    if (roleFromUrl && roleFromUrl !== activeTab) {
      setActiveTab(roleFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [roleFromUrl]);

  useEffect(() => {
    setCurrentPage(1);
    fetchUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
    console.log("object", roleFromUrl);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [users, searchTerm, statusFilter]);
  const fetchUsers = async (page: number = 1) => {
    setLoading(true);
    try {
      const response = await userService.getUsers({
        roleName: activeTab,
        page: page,
        limit: 10,
      });
      console.log("user", response);
      if (response.status === 200) {
        // Filter out users with PENDING status and inactive users
        const approvedUsers = response.data.data.data.filter(
          (user: User) => user.status !== "REJECTED"
        );
        const pendingUsers = response.data.data.data.filter(
          (user: User) => user.status === "PENDING"
        );
        setPagination(response.data.data.meta);
        setPendingUsers(pendingUsers);
        setUsers(approvedUsers);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Không thể tải danh sách người dùng");
    } finally {
      setLoading(false);
    }
  };

  console.log("pagi", pagination);

  const handleDeactivate = async () => {
    const userIdConfirm = confirmModal.userId;
    if (!userIdConfirm) return;
    setLoading(true);
    try {
      if (confirmModal.isDeactivate) {
        const response = await userService.patchUserDeactivate(userIdConfirm);
        if (response.data) {
          toast.success("Vô hiệu người dùng thành công");
        } else {
          toast.error("Vô hiệu người dùng thất bại");
        }
      } else {
        const response = await userService.patchUserStatus(userIdConfirm, {
          status: "APPROVED",
        });
        if (response.data) {
          toast.success("Kích hoạt người dùng thành công");
        } else {
          toast.error("Kích hoạt người dùng thất bại");
        }
      }
      fetchUsers(currentPage);
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Có lỗi xảy ra khi cập nhật trạng thái người dùng");
    } finally {
      setLoading(false);
      setConfirmModal({ isOpen: false, userId: null, isDeactivate: true });
    }
  };

  const handleViewDetail = (user: User) => {
    setSelectedUser(user);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.userName.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.firstName.toLowerCase().includes(term) ||
          user.lastName.toLowerCase().includes(term) ||
          user.studentCode?.toLowerCase().includes(term)
      );
    }

    // Filter by status
    if (statusFilter === "active") {
      filtered = filtered.filter((user) => user.isActive);
    } else if (statusFilter === "inactive") {
      filtered = filtered.filter((user) => !user.isActive);
    }

    setFilteredUsers(filtered);
  };

  const getCampusName = (campusId: number) => {
    const campuses: { [key: number]: string } = {
      1: "FU - Hòa Lạc",
      2: "FU - Hồ Chí Minh",
      3: "FU - Đà Nẵng",
      4: "FU - Cần Thơ",
      5: "FU - Quy Nhơn",
    };
    return campuses[campusId] || "N/A";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên, email, mã sinh viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value as "all" | "active" | "inactive")
            }
            className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none bg-white"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Vô hiệu hóa</option>
          </select>
        </div>
      </div>

      {/* Pending Users Section */}
      {pendingUsers.length > 0 && (
        <div className="p-4 border-b border-gray-200 bg-yellow-50">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">
                Người dùng chờ duyệt ({pendingUsers.length})
              </h3>
            </div>
          </div>
          <div className="space-y-3">
            {pendingUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white p-3 rounded-lg border border-yellow-200 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.userName}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-white font-semibold">
                      {user.firstName.charAt(0)}
                      {user.lastName.charAt(0)}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                    title="Chấp nhận"
                    onClick={() => handleStatusUser(user.id, "APPROVED")}
                  >
                    <Check size={16} />
                    <span>Chấp nhận</span>
                  </button>
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    title="Từ chối"
                    onClick={() => handleReject(user.id)}
                  >
                    <X size={16} />
                    <span>Từ chối</span>
                  </button>
                  <button
                    onClick={() => handleViewDetail(user)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    title="Chi tiết"
                  >
                    <Eye size={16} />
                    <span>Chi tiết</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto" style={{ overflow: "visible" }}>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-[#F27125]" size={40} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              {roleIcons[activeTab]}
            </div>
            <p className="text-gray-500">
              {searchTerm
                ? "Không tìm thấy người dùng phù hợp"
                : `Chưa có ${roleLabels[activeTab]} nào`}
            </p>
          </div>
        ) : (
          <table className="w-full" style={{ overflow: "visible" }}>
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Campus
                </th>

                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#F27125] to-[#d95c0b] flex items-center justify-center text-white font-semibold">
                          {user.firstName.charAt(0)}
                          {user.lastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">
                          @{user.userName}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {getCampusName(user.campus?.id)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <a
                      href={`mailto:${user.email}`}
                      className="text-sm text-[#F27125] hover:text-[#d95c0b] hover:underline"
                    >
                      {user.email}
                    </a>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${
                        user.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }
                    `}
                    >
                      {user.isActive ? "Hoạt động" : "Vô hiệu hóa"}
                    </span>
                  </td>
                  <td className="px-6 py-4 relative overflow-visible">
                    <div className="flex items-center justify-end gap-2">
                      <ActionDropdown
                        actions={[
                          {
                            label: "Xem chi tiết",
                            icon: Eye,
                            onClick: () => handleViewDetail(user),
                            type: "detail",
                          },
                          user.isActive
                            ? {
                                label: "Vô hiệu hóa",
                                icon: Trash2,
                                onClick: () => handleDelete(user.id),
                                type: "danger",
                              }
                            : {
                                label: "Kích hoạt",
                                icon: UserPlus,
                                onClick: () => handleActivate(user.id),
                                type: "safe",
                              },
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer with Pagination */}
      {!loading && filteredUsers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Hiển thị{" "}
              <span className="font-semibold">
                {(currentPage - 1) * 10 + 1}
              </span>{" "}
              -{" "}
              <span className="font-semibold">
                {Math.min(currentPage * 10, pagination?.total || 0)}
              </span>{" "}
              trong tổng số{" "}
              <span className="font-semibold">{pagination?.total || 0}</span>{" "}
              {roleLabels[activeTab]}
            </p>

            {pagination && pagination.totalPages >= 1 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchUsers(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Trước
                </button>

                <div className="flex gap-1">
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => fetchUsers(pageNum)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                            currentPage === pageNum
                              ? "bg-[#F27125] text-white"
                              : "border border-gray-300 text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                </div>

                <button
                  onClick={() => fetchUsers(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Sau
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* User Detail Modal */}
      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        user={selectedUser}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={
          confirmModal.isDeactivate
            ? "Xác nhận dừng hoạt động"
            : "Xác nhận kích hoạt"
        }
        message={
          confirmModal.isDeactivate
            ? "Bạn có chắc chắn muốn dừng hoạt động người dùng này?"
            : "Bạn có chắc chắn muốn kích hoạt lại người dùng này?"
        }
        confirmText={loading ? "Đang xử lý..." : "Xác nhận"}
        cancelText="Hủy"
        type={confirmModal.isDeactivate ? "danger" : "info"}
        onConfirm={handleDeactivate}
        onCancel={cancelDelete}
      />

      {/* Reject Modal */}
      {rejectModal.isOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                Từ chối người dùng
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Vui lòng nhập lý do từ chối
              </p>
            </div>
            <div className="p-6">
              <textarea
                value={rejectModal.reason}
                onChange={(e) =>
                  setRejectModal({ ...rejectModal, reason: e.target.value })
                }
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none resize-none"
              />
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={cancelReject}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Hủy
              </button>
              <button
                onClick={confirmReject}
                disabled={loading || !rejectModal.reason.trim()}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang xử lý..." : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListTable;
