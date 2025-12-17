import { useState, useEffect } from 'react';
import { 
  Trash2, 
  CheckCircle, 
  XCircle, 
  Calendar,
  MapPin,
  User,
  Clock,
  AlertCircle,
  Search,
  Filter,
  FileText,
  Eye,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { toast } from 'react-toastify';
import eventService from '../../../services/eventService';
import type { DeleteRequestItem } from '../../../types/Event';
import ActionDropdown from '../../../components/ActionDropdown';
import ConfirmModal from '../../../components/common/ConfirmModal';

const DeleteResponsePage = () => {
  const [deleteRequests, setDeleteRequests] = useState<DeleteRequestItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedRequest, setSelectedRequest] = useState<DeleteRequestItem | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal confirm states
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectConfirm, setShowRejectConfirm] = useState(false);
  const [pendingRequestId, setPendingRequestId] = useState<number | null>(null);

  // ✅ THÊM: Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số items mỗi page

  useEffect(() => {
    fetchDeleteRequests();
  }, []);

  const fetchDeleteRequests = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching delete requests...');
      
      const response = await eventService.getDeleteRequests({
        page: 1,
        limit: 100,
      });

      console.log('Full response:', response);
      console.log('response.data:', response.data);
      console.log('response.data type:', typeof response.data);
      
      if (!response || !response.data) {
        console.warn('⚠️ No response.data');
        setDeleteRequests([]);
        return;
      }

      let requests: DeleteRequestItem[] = [];

      if (response.data.data?.data && Array.isArray(response.data.data.data)) {
        requests = response.data.data.data;
        console.log('Found requests in response.data.data.data:', requests.length);
      }
      else if (response.data.data && Array.isArray(response.data.data)) {
        requests = response.data.data;
        console.log('Found requests in response.data.data:', requests.length);
      }
      else if (Array.isArray(response.data)) {
        requests = response.data;
        console.log('Found requests in response.data:', requests.length);
      }
      else {
        console.warn('Unexpected response structure:', response.data);
        setDeleteRequests([]);
        return;
      }

      if (requests.length > 0) {
        console.log('First request sample:', requests[0]);
        console.log('Request keys:', Object.keys(requests[0]));
      }

      setDeleteRequests(requests);
      console.log('✅ Total requests loaded:', requests.length);
      
    } catch (error: any) {
      console.error('Error fetching delete requests:', error);
      console.error('Error response:', error.response);
      console.error('Error response data:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Không thể tải danh sách yêu cầu xóa';
      
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Kiểm tra lại URL.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập. Cần role ADMIN.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      setDeleteRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    setIsProcessing(true);
    try {
      console.log('✅ Approving delete request:', requestId);
      
      // ✅ GỌI API VỚI PARAMS ĐÚNG THEO SWAGGER
      // @ts-ignore - Method may not exist in type definition yet
      await eventService.approveDeleteRequest({
        requestId,
        status: 'APPROVED', // ✅ "status" thay vì "action"
        adminNote: 'Đã xem xét và chấp thuận yêu cầu hủy sự kiện'
      });
      
      toast.success('Đã phê duyệt yêu cầu xóa sự kiện. Status đã được cập nhật.', {
        autoClose: 5000,
      });
      
      await fetchDeleteRequests();
      setIsDetailModalOpen(false);
      setShowApproveConfirm(false);
      setPendingRequestId(null);
      
    } catch (error: any) {
      console.error('Error approving delete request:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Không thể phê duyệt yêu cầu';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy yêu cầu xóa';
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data?.message || 'Yêu cầu không hợp lệ';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ HÀM TỪ CHỐI - SỬA PARAMS
  const handleReject = async (requestId: number) => {
    setIsProcessing(true);
    try {
      console.log('Rejecting delete request:', requestId);
      
      // ✅ GỌI API VỚI PARAMS ĐÚNG THEO SWAGGER
      // @ts-ignore - Method may not exist in type definition yet
      await eventService.approveDeleteRequest({
        requestId,
        status: 'REJECTED', // ✅ "status" thay vì "action"
        adminNote: 'Yêu cầu xóa sự kiện không được chấp thuận'
      });
      
      toast.success('Đã từ chối yêu cầu xóa sự kiện');
      
      await fetchDeleteRequests();
      setIsDetailModalOpen(false);
      setShowRejectConfirm(false);
      setPendingRequestId(null);
      
    } catch (error: any) {
      console.error('Error rejecting delete request:', error);
      
      let errorMessage = 'Không thể từ chối yêu cầu';
      
      if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy yêu cầu xóa';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const configs = {
      PENDING: { label: 'Chờ xử lý', className: 'bg-yellow-100 text-yellow-700' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Đã từ chối', className: 'bg-red-100 text-red-700' },
    };
    const config = configs[status as keyof typeof configs] || configs.PENDING;
    return (
      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredRequests = deleteRequests.filter(request => {
    const matchesSearch = 
      request.event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.requester.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'ALL' || request.status === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  // ✅ THÊM: Pagination logic
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentRequests = filteredRequests.slice(startIndex, endIndex);

  // ✅ THÊM: Reset page khi search hoặc filter thay đổi
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterStatus]);

  // ✅ THÊM: Pagination handlers
  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  // ✅ THÊM: Generate page numbers
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  };

  const stats = {
    total: deleteRequests.length,
    pending: deleteRequests.filter(r => r.status === 'PENDING').length,
    approved: deleteRequests.filter(r => r.status === 'APPROVED').length,
    // rejected: deleteRequests.filter(r => r.status === 'REJECTED').length, // ✅ COMMENT
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yêu Cầu Hủy Sự Kiện</h1>
              <p className="text-gray-600 mt-1">Quản lý các yêu cầu hủy sự kiện từ organizer</p>
            </div>
          </div>
          
          <button
            onClick={fetchDeleteRequests}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <svg 
              className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Tổng yêu cầu */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tổng yêu cầu</p>
              <p className="text-4xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl">
              <FileText className="text-gray-600" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Chờ xử lý */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Chờ xử lý</p>
              <p className="text-4xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-xl">
              <Clock className="text-yellow-600" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* Đã duyệt */}
        <div className="bg-white rounded-xl shadow-sm border-2 border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Đã duyệt</p>
              <p className="text-4xl font-bold text-green-600">{stats.approved}</p>
            </div>
            <div className="bg-green-50 p-4 rounded-xl">
              <CheckCircle className="text-green-600" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div>

        {/* ✅ COMMENT: Đã từ chối */}
        {/* <div className="bg-white rounded-xl shadow-sm border-2 border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Đã từ chối</p>
              <p className="text-4xl font-bold text-red-600">{stats.rejected}</p>
            </div>
            <div className="bg-red-50 p-4 rounded-xl">
              <XCircle className="text-red-600" size={32} strokeWidth={2.5} />
            </div>
          </div>
        </div> */}
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm theo tên sự kiện, organizer, hoặc lý do..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400" size={20} />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="PENDING">Chờ xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Đã từ chối</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Đang tải dữ liệu...</p>
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 text-lg">
              {searchTerm || filterStatus !== 'ALL' 
                ? 'Không tìm thấy yêu cầu nào' 
                : 'Chưa có yêu cầu xóa nào'}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
              <table className="w-full" style={{ overflow: 'visible' }}>
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sự kiện
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Organizer
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Thời gian sự kiện
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Lý do
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      {/* Hành động */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {/* ✅ SỬA: Dùng currentRequests thay vì filteredRequests */}
                  {currentRequests.map((request) => (
                    <tr key={request.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-3">
                          <div className="p-2 bg-red-50 rounded-lg">
                            <Calendar className="text-red-500" size={20} />
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{request.event.title}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              Organizer: {request.event.organizer.name}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <User size={16} className="text-gray-400" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {request.requester.firstName} {request.requester.lastName}
                            </p>
                            <p className="text-xs text-gray-500">{request.requester.email}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="text-gray-900 font-medium">
                            {new Date(request.event.startTime).toLocaleDateString('vi-VN')}
                          </p>
                          <p className="text-gray-500">
                            {new Date(request.event.startTime).toLocaleTimeString('vi-VN', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-700 line-clamp-2 max-w-xs">
                          {request.reason}
                        </p>
                      </td>
                      
                      <td className="px-6 py-4">
                        {getStatusBadge(request.status)}
                      </td>
                      
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Xem chi tiết',
                                icon: Eye,
                                onClick: () => {
                                  setSelectedRequest(request);
                                  setIsDetailModalOpen(true);
                                },
                              },
                              // @ts-ignore - ActionType compatibility
                              ...(request.status === 'PENDING' ? [
                                {
                                  label: 'Phê duyệt',
                                  icon: CheckCircle,
                                  onClick: () => {
                                    setPendingRequestId(request.id);
                                    setShowApproveConfirm(true);
                                  },
                                },
                                {
                                  label: 'Từ chối',
                                  icon: XCircle,
                                  onClick: () => {
                                    setPendingRequestId(request.id);
                                    setShowRejectConfirm(true);
                                  },
                                  type: 'danger',
                                },
                              ] : []),
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ THÊM: Pagination */}
            {filteredRequests.length > 0 && (
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  {/* Showing info */}
                  <div className="text-sm text-gray-600">
                    {/* Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}</span> đến{' '}
                    <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredRequests.length)}</span> trong tổng số{' '}
                    <span className="font-semibold text-gray-900">{filteredRequests.length}</span> yêu cầu */}
                  </div>

                  {/* Pagination controls */}
                  <div className="flex items-center gap-2">
                    {/* Previous button */}
                    <button
                      onClick={goToPrevPage}
                      disabled={currentPage === 1}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Trang trước"
                    >
                      <ChevronLeft size={20} className="text-gray-600" />
                    </button>

                    {/* Page numbers */}
                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((pageNum) => (
                        <button
                          key={pageNum}
                          onClick={() => goToPage(pageNum)}
                          className={`min-w-[40px] h-10 px-3 rounded-lg font-medium transition-colors ${
                            pageNum === currentPage
                              ? 'bg-red-500 text-white'
                              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>

                    {/* Next button */}
                    <button
                      onClick={goToNextPage}
                      disabled={currentPage === totalPages}
                      className="p-2 rounded-lg border border-gray-300 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      title="Trang sau"
                    >
                      <ChevronRight size={20} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Detail Modal - KHÔNG THAY ĐỔI */}
      {isDetailModalOpen && selectedRequest && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 shrink-0 from-red-500 to-red-600 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Trash2 size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Chi Tiết Yêu Cầu Xóa</h2>
                    <p className="text-red-100 text-sm mt-1">
                      Ngày yêu cầu: {formatDate(selectedRequest.createdAt)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsDetailModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Status */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-sm font-medium text-gray-600">Trạng thái:</span>
                {getStatusBadge(selectedRequest.status)}
              </div>

              {/* Event Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="text-red-500" size={20} />
                  Thông Tin Sự Kiện
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Tên sự kiện</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.event.title}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Địa điểm</p>
                    <p className="font-semibold text-gray-900">{selectedRequest.event.organizer.name}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Thời gian bắt đầu</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedRequest.event.startTime)}</p>
                  </div>
                  
                  <div className="p-4 bg-gray-50 rounded-xl">
                    <p className="text-xs text-gray-500 mb-1">Thời gian kết thúc</p>
                    <p className="font-semibold text-gray-900">{formatDate(selectedRequest.event.endTime)}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-2">Mô tả sự kiện</p>
                  {/* @ts-ignore - description may be optional */}
                  <p className="text-gray-700">{selectedRequest.event.description}</p>
                </div>
              </div>

              {/* Organizer Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <User className="text-red-500" size={20} />
                  Thông Tin Organizer
                </h3>
                
                <div className="p-4 bg-gray-50 rounded-xl">
                  <p className="text-xs text-gray-500 mb-1">Tên organizer</p>
                  <p className="font-semibold text-gray-900">{selectedRequest.requester.firstName} {selectedRequest.requester.lastName}</p>
                </div>
              </div>

              {/* Reason */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={20} />
                  Lý Do Yêu Cầu Xóa
                </h3>
                
                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-xl">
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedRequest.reason}</p>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            {selectedRequest.status === 'PENDING' && (
              <div className="sticky bottom-0 bg-gray-50 p-6 rounded-b-2xl border-t border-gray-200">
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setIsDetailModalOpen(false)}
                    className="px-6 py-2.5 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  >
                    Đóng
                  </button>
                  
                  <button
                    onClick={() => {
                      setPendingRequestId(selectedRequest.id);
                      setShowRejectConfirm(true);
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <XCircle size={18} />
                    Từ Chối
                  </button>
                  
                  <button
                    onClick={() => {
                      setPendingRequestId(selectedRequest.id);
                      setShowApproveConfirm(true);
                    }}
                    disabled={isProcessing}
                    className="px-6 py-2.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium disabled:opacity-50 flex items-center gap-2"
                  >
                    <CheckCircle size={18} />
                    Phê Duyệt
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Approve Confirm Modal */}
      <ConfirmModal
        isOpen={showApproveConfirm}
        title="Xác nhận phê duyệt"
        message="Bạn có chắc chắn muốn PHÊ DUYỆT yêu cầu xóa sự kiện này? Sự kiện sẽ được đổi status sang CANCELED."
        confirmText="Phê duyệt"
        cancelText="Hủy"
        onConfirm={() => {
          if (pendingRequestId) {
            handleApprove(pendingRequestId);
          }
        }}
        onCancel={() => {
          setShowApproveConfirm(false);
          setPendingRequestId(null);
        }}
        type="success"
      />

      {/* Reject Confirm Modal */}
      <ConfirmModal
        isOpen={showRejectConfirm}
        title="Xác nhận từ chối"
        message="Bạn có chắc chắn muốn TỪ CHỐI yêu cầu xóa sự kiện này?"
        confirmText="Từ chối"
        cancelText="Hủy"
        onConfirm={() => {
          if (pendingRequestId) {
            handleReject(pendingRequestId);
          }
        }}
        onCancel={() => {
          setShowRejectConfirm(false);
          setPendingRequestId(null);
        }}
        type="danger"
      />
    </div>
  );
};

export default DeleteResponsePage;