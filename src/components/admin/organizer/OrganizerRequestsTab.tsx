import { useState, useEffect } from "react";
import {
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  X,
  ExternalLink,
} from "lucide-react";
import { toast } from "react-toastify";
import organizerRequestService from "../../../services/organizerRequestService";
import type {
  OrganizerRequestItem,
  OrganizerRequestStatus,
  OrganizerRequestMeta,
} from "../../../types/Organizer";

const OrganizerRequestsTab = () => {
  const [requests, setRequests] = useState<OrganizerRequestItem[]>([]);
  const [meta, setMeta] = useState<OrganizerRequestMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<OrganizerRequestStatus | "">(
    ""
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRequest, setSelectedRequest] =
    useState<OrganizerRequestItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewAction, setReviewAction] = useState<"APPROVED" | "REJECTED">(
    "APPROVED"
  );
  const [rejectReason, setRejectReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 10;

  useEffect(() => {
    fetchRequests();
  }, [currentPage, statusFilter]);

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      const response = await organizerRequestService.getAllOrganizerRequests({
        page: currentPage,
        limit,
        status: statusFilter || undefined,
      });
      if (response.data) {
        setRequests(response.data.data);
        setMeta(response.data.meta);
      }
    } catch (error: any) {
      console.error("Error fetching organizer requests:", error);
      toast.error(
        error.response?.data?.message || "Không thể tải danh sách yêu cầu"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewDetails = (request: OrganizerRequestItem) => {
    setSelectedRequest(request);
    setIsDetailModalOpen(true);
  };

  const handleOpenReviewModal = (
    request: OrganizerRequestItem,
    action: "APPROVED" | "REJECTED"
  ) => {
    setSelectedRequest(request);
    setReviewAction(action);
    setRejectReason("");
    setIsReviewModalOpen(true);
  };

  const handleReview = async () => {
    if (!selectedRequest) return;

    if (reviewAction === "REJECTED" && !rejectReason.trim()) {
      toast.error("Vui lòng nhập lý do từ chối");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await organizerRequestService.reviewOrganizerRequest(
        selectedRequest.id,
        {
          status: reviewAction,
          reason: reviewAction === "REJECTED" ? rejectReason : undefined,
        }
      );

      if (response.data) {
        toast.success(
          reviewAction === "APPROVED"
            ? "Đã duyệt yêu cầu thành công"
            : "Đã từ chối yêu cầu"
        );
        setIsReviewModalOpen(false);
        setIsDetailModalOpen(false);
        fetchRequests();
      }
    } catch (error: any) {
      console.error("Error reviewing request:", error);
      toast.error(error.response?.data?.message || "Không thể xử lý yêu cầu");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status: OrganizerRequestStatus) => {
    const statusConfig = {
      PENDING: {
        bg: "bg-yellow-100",
        text: "text-yellow-800",
        icon: <Clock size={14} />,
        label: "Chờ duyệt",
      },
      APPROVED: {
        bg: "bg-green-100",
        text: "text-green-800",
        icon: <CheckCircle size={14} />,
        label: "Đã duyệt",
      },
      REJECTED: {
        bg: "bg-red-100",
        text: "text-red-800",
        icon: <XCircle size={14} />,
        label: "Từ chối",
      },
    };

    const config = statusConfig[status];

    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
      >
        {config.icon}
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRequests = requests.filter(
    (req) =>
      req.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#F27125] transition-all flex-1 max-w-md">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-700"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as OrganizerRequestStatus | "");
            setCurrentPage(1);
          }}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent text-sm"
        >
          <option value="">Tất cả trạng thái</option>
          <option value="PENDING">Chờ duyệt</option>
          <option value="APPROVED">Đã duyệt</option>
          <option value="REJECTED">Từ chối</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Logo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tên tổ chức
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Người yêu cầu
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Cơ sở
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Ngày tạo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#F27125] border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không có yêu cầu nào
                  </td>
                </tr>
              ) : (
                filteredRequests.map((request) => (
                  <tr
                    key={request.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {request.id}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={request.logoUrl}
                        alt={request.name}
                        className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {request.name}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.contactEmail}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {request.user.firstName} {request.user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {request.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {request.campus.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {formatDate(request.createdAt)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(request.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(request)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        {request.status === "PENDING" && (
                          <>
                            <button
                              onClick={() =>
                                handleOpenReviewModal(request, "APPROVED")
                              }
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Duyệt"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() =>
                                handleOpenReviewModal(request, "REJECTED")
                              }
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Từ chối"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {meta && meta.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Hiển thị {(currentPage - 1) * limit + 1} -{" "}
            {Math.min(currentPage * limit, meta.total)} trong tổng số{" "}
            {meta.total} yêu cầu
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={18} />
            </button>
            <span className="px-4 py-2 text-sm font-medium">
              Trang {currentPage} / {meta.totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
              }
              disabled={currentPage === meta.totalPages}
              className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
              <h2 className="text-xl font-bold text-gray-900">
                Chi tiết yêu cầu
              </h2>
              <button
                onClick={() => setIsDetailModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {/* Organization Info */}
              <div className="flex items-start gap-6">
                <img
                  src={selectedRequest.logoUrl}
                  alt={selectedRequest.name}
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedRequest.name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {selectedRequest.description}
                  </p>
                  <div className="mt-3">
                    {getStatusBadge(selectedRequest.status)}
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Email liên hệ
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRequest.contactEmail}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Cơ sở
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {selectedRequest.campus.name}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <label className="text-xs font-medium text-gray-500 uppercase">
                    Ngày tạo
                  </label>
                  <p className="text-sm text-gray-900 mt-1">
                    {formatDate(selectedRequest.createdAt)}
                  </p>
                </div>
                {selectedRequest.reviewedAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <label className="text-xs font-medium text-gray-500 uppercase">
                      Ngày duyệt
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {formatDate(selectedRequest.reviewedAt)}
                    </p>
                  </div>
                )}
              </div>

              {/* Requester Info */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Thông tin người yêu cầu
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Họ tên:</span>{" "}
                    <span className="text-gray-900">
                      {selectedRequest.user.firstName}{" "}
                      {selectedRequest.user.lastName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Email:</span>{" "}
                    <span className="text-gray-900">
                      {selectedRequest.user.email}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Username:</span>{" "}
                    <span className="text-gray-900">
                      {selectedRequest.user.userName}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Role:</span>{" "}
                    <span className="text-gray-900 capitalize">
                      {selectedRequest.user.roleName}
                    </span>
                  </div>
                </div>
              </div>

              {/* Proof Image */}
              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">
                  Hình ảnh minh chứng
                </h4>
                <a
                  href={selectedRequest.proofImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <img
                    src={selectedRequest.proofImageUrl}
                    alt="Proof"
                    className="max-h-64 object-contain rounded-lg border border-gray-200 hover:opacity-90 transition-opacity"
                  />
                  <span className="inline-flex items-center gap-1 mt-2 text-sm text-[#F27125] hover:underline">
                    <ExternalLink size={14} />
                    Xem ảnh đầy đủ
                  </span>
                </a>
              </div>

              {/* Rejection Reason */}
              {selectedRequest.status === "REJECTED" &&
                selectedRequest.reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <h4 className="text-sm font-semibold text-red-800 mb-2">
                      Lý do từ chối
                    </h4>
                    <p className="text-sm text-red-700">
                      {selectedRequest.reason}
                    </p>
                  </div>
                )}

              {/* Admin Reviewer */}
              {selectedRequest.adminReviewer && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">
                    Người duyệt
                  </h4>
                  <p className="text-sm text-gray-600">
                    {selectedRequest.adminReviewer.firstName}{" "}
                    {selectedRequest.adminReviewer.lastName} (
                    {selectedRequest.adminReviewer.email})
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            {selectedRequest.status === "PENDING" && (
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenReviewModal(selectedRequest, "REJECTED");
                  }}
                  className="px-5 py-2.5 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors font-medium"
                >
                  Từ chối
                </button>
                <button
                  onClick={() => {
                    setIsDetailModalOpen(false);
                    handleOpenReviewModal(selectedRequest, "APPROVED");
                  }}
                  className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Duyệt yêu cầu
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Review Confirmation Modal */}
      {isReviewModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">
                {reviewAction === "APPROVED"
                  ? "Xác nhận duyệt"
                  : "Xác nhận từ chối"}
              </h3>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={selectedRequest.logoUrl}
                  alt={selectedRequest.name}
                  className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {selectedRequest.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {selectedRequest.user.firstName}{" "}
                    {selectedRequest.user.lastName}
                  </p>
                </div>
              </div>

              {reviewAction === "APPROVED" ? (
                <p className="text-sm text-gray-600">
                  Bạn có chắc chắn muốn duyệt yêu cầu này? Người dùng sẽ được
                  cấp quyền Organizer.
                </p>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    Vui lòng nhập lý do từ chối yêu cầu này:
                  </p>
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Nhập lý do từ chối..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none text-sm"
                  />
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                disabled={isSubmitting}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleReview}
                disabled={isSubmitting}
                className={`px-5 py-2.5 text-white rounded-lg transition-colors font-medium disabled:opacity-50 flex items-center gap-2 ${
                  reviewAction === "APPROVED"
                    ? "bg-green-600 hover:bg-green-700"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSubmitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                )}
                {reviewAction === "APPROVED" ? "Duyệt" : "Từ chối"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerRequestsTab;
