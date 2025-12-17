import { Search, Filter, Eye, Check, X, Image as ImageIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import eventService from "../../../services/eventService";
import type { GetEventResponse } from "../../../types/Event";
import { toast } from "react-toastify";
import ActionDropdown from "../../../components/ActionDropdown";

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<GetEventResponse[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [totalEvents, setTotalEvents] = useState(0); // Thêm biến này

  useEffect(() => {
    fetchEvents();
  }, [currentPage, statusFilter, searchTerm]); // Thêm các biến này để fetch lại khi đổi trang/filter/search

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const params: any = {
  page: currentPage,
  limit: itemsPerPage,
  search: searchTerm || undefined,
};

if (statusFilter !== "all") {
  params.status = statusFilter;
}
      const response: any = await eventService.getAllEvents(params);
      if (response && response.data) {
        setEvents(response.data.data || []);
        setTotalEvents(response.data.meta?.total || 0); // Lưu tổng số sự kiện
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(totalEvents / itemsPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const goToPage = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const goToPrevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

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

  const handleApproveEvent = async (eventId: string | number, status: string) => {
    setSubmitting(true);
    try {
      console.log("Approving event:", eventId);
      
      const response = await eventService.patchEvent(String(eventId), { status : "PUBLISHED" });
      
      console.log("Approve response:", response);
      
      if (response) {
        toast.success("Duyệt sự kiện thành công!");
        
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === eventId ? { ...e, status: "PUBLISHED" } : e
          )
        );
        
        fetchEvents();
      } 
    } catch (error: any) {
      console.error("Error approving event:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Duyệt sự kiện thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectEvent = async (eventId: string | number) => {
    setSubmitting(true);
    try {
      console.log("Rejecting event:", eventId);
      
      const response = await eventService.patchEvent(String(eventId), { status: "CANCELED" });
      
      console.log("Reject response:", response);
      
      if (response) {
        toast.success("Từ chối sự kiện thành công!");
        
        setEvents(prevEvents => 
          prevEvents.map(e => 
            e.id === eventId ? { ...e, status: "CANCELED" } : e
          )
        );
        
        fetchEvents();
      } 
    } catch (error: any) {
      console.error("Error rejecting event:", error);
      console.error("Error response:", error.response?.data);
      toast.error(error.response?.data?.message || "Từ chối sự kiện thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setSubmitting(true);
    try {
      const response = await eventService.deleteEvent(selectedEvent.id);
      
      if (response.status == 200) {
        toast.success("Xóa sự kiện thành công!");
        
        setEvents(prevEvents => prevEvents.filter(e => e.id !== selectedEvent.id));
        
        setShowDeleteConfirm(false);
        setSelectedEvent(null);
        
        await fetchEvents();
      } else {
        toast.error(response.data.message || "Xóa sự kiện thất bại!");
      }
    } catch (error: any) {
      console.error("Error deleting event:", error);
      toast.error(error.response?.data?.message || "Xóa sự kiện thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "PUBLISHED": "bg-green-100 text-green-700",
      "PENDING": "bg-yellow-100 text-yellow-700",
      "CANCELED": "bg-red-100 text-red-700",
      "DRAFT": "bg-gray-100 text-gray-700",
    };

    const statusLabel: Record<string, string> = {
      "PUBLISHED": "Đã duyệt",
      "PENDING": "Đang xử lý",
      "CANCELED": "Bị từ chối",
      "DRAFT": "Nháp",
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-medium whitespace-nowrap ${statusConfig[status] || "bg-gray-100 text-gray-700"}`}>
        {statusLabel[status] || status}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Danh sách sự kiện</h1>
        <p className="text-gray-600 mt-1">Quản lý phê duyệt sự kiện</p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2.5 flex-1 max-w-md">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm sự kiện"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700"
          />
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2.5 min-w-[200px]">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="PUBLISHED">Đã duyệt</option>
            <option value="CANCELED">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">STT</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên sự kiện</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ban tổ chức</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày tạo</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Địa điểm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900"></th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                events.map((e, index) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.organizer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(e.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.venue?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(e.status)}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <ActionDropdown
                          actions={[
                            {
                              label: "Xem chi tiết",
                              icon: Eye,
                              onClick: () => {
                                setSelectedEvent(e);
                                setShowDetailModal(true);
                              },
                            },
                            // {  
                            //   label: "Xóa",
                            //   icon: Trash2,
                            //   onClick: () => {
                            //     setSelectedEvent(e);
                            //     setShowDeleteConfirm(true);
                            //   },
                            //   danger: true,
                            //   disabled: submitting,
                            // },
                          ]}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* {filteredEvents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{filteredEvents.length}</span> sự kiện
        </div>
      )} */}

      {/* ✅ Detail Modal - ĐÃ THÊM SPEAKER */}
      {showDetailModal && selectedEvent && (
        <EventModal title="Chi tiết sự kiện" onClose={() => setShowDetailModal(false)}>
          <div className="space-y-4">
            {/* ✅ Layout 2 cột: Image + Info */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* ===== CỘT TRÁI: IMAGE ===== */}
              <div className="space-y-4">
                {/* Event Image */}
                <div className="relative w-full h-64 lg:h-80 rounded-lg overflow-hidden bg-gray-100">
                  {selectedEvent.imageUrl || selectedEvent.bannerUrl ? (
                    <img 
                      src={selectedEvent.bannerUrl || selectedEvent.imageUrl} 
                      alt={selectedEvent.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div class="flex flex-col items-center justify-center h-full text-gray-400">
                              <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                              </svg>
                              <p class="text-sm">Không thể tải ảnh</p>
                            </div>
                          `;
                        }
                      }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <ImageIcon size={48} className="mb-2" />
                      <p className="text-sm">Không có ảnh</p>
                    </div>
                  )}
                </div>
              </div>

              {/* ===== CỘT PHẢI: INFO ===== */}
              <div className="space-y-3">
                {/* Grid thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-3">
                  {/* ID */}
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">ID</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{selectedEvent.id}</p>
                  </div>

                  {/* Tên sự kiện */}
                  <div className="col-span-2 bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Tên sự kiện</p>
                    <p className="text-sm font-semibold text-gray-900">{selectedEvent.title}</p>
                  </div>

                  {/* Ban tổ chức */}
                  <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 mb-1">Ban tổ chức</p>
                    <p className="text-sm font-medium text-blue-900">{selectedEvent.organizer.name}</p>
                  </div>

                  {/* Địa điểm */}
                  <div className="bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <p className="text-xs text-purple-600 mb-1">Địa điểm</p>
                    <p className="text-sm font-medium text-purple-900">{selectedEvent.venue?.name || "-"}</p>
                  </div>

                  {/* Ngày bắt đầu */}
                  <div className="bg-green-50 rounded-lg p-3 border border-green-200">
                    <p className="text-xs text-green-600 mb-1">Ngày bắt đầu</p>
                    <p className="text-sm font-medium text-green-900">
                      {new Date(selectedEvent.startTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Ngày kết thúc */}
                  <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
                    <p className="text-xs text-orange-600 mb-1">Ngày kết thúc</p>
                    <p className="text-sm font-medium text-orange-900">
                      {new Date(selectedEvent.endTime).toLocaleString('vi-VN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>

                  {/* Trạng thái */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Trạng thái</p>
                    {getStatusBadge(selectedEvent.status)}
                  </div>

                  {/* Mô tả */}
                  {selectedEvent.description && (
                    <div className="bg-amber-50 rounded-lg p-3 border border-amber-200">
                      <p className="text-xs text-amber-600 mb-1">Mô tả</p>
                      <p className="text-sm text-amber-900 line-clamp-3">
                        {selectedEvent.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* ✅ THÊM: Speaker Section - DƯỚI GRID INFO */}
                <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Speaker
                    {selectedEvent.eventSpeakers && selectedEvent.eventSpeakers.length > 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {selectedEvent.eventSpeakers.length}
                      </span>
                    )}
                  </h3>
                  
                  {selectedEvent.eventSpeakers && selectedEvent.eventSpeakers.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {selectedEvent.eventSpeakers.map((eventSpeaker) => (
                        <div 
                          key={eventSpeaker.id} 
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:border-blue-300 transition-colors"
                        >
                          <div className="flex items-start gap-3">
                            {/* Avatar */}
                            {eventSpeaker.speaker.avatar ? (
                              <img 
                                src={eventSpeaker.speaker.avatar} 
                                alt={eventSpeaker.speaker.name}
                                className="w-12 h-12 rounded-full object-cover flex-shrink-0 border-2 border-blue-200"
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(eventSpeaker.speaker.name)}&background=4F46E5&color=fff&size=128`;
                                }}
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-lg flex-shrink-0 border-2 border-blue-200">
                                {eventSpeaker.speaker.name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                              {/* Name */}
                              <p className="font-semibold text-sm text-gray-900 mb-0.5">
                                {eventSpeaker.speaker.name}
                              </p>
                              
                              {/* Company */}
                              {eventSpeaker.speaker.company && (
                                <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                  </svg>
                                  {eventSpeaker.speaker.company}
                                </p>
                              )}
                              
                              {/* Topic */}
                              {eventSpeaker.topic && (
                                <p className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded inline-block mb-1">
                                  📚 {eventSpeaker.topic}
                                </p>
                              )}
                              
                              {/* Bio */}
                              {eventSpeaker.speaker.bio && (
                                <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                  {eventSpeaker.speaker.bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-gray-500 text-sm py-4">
                      Chưa có thông tin diễn giả cho sự kiện này.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* ✅ Action buttons - Dính đáy */}
            {selectedEvent.status === "PENDING" && (
              <div className="flex gap-3 pt-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApproveEvent(selectedEvent.id, "PUBLISHED");
                    setShowDetailModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <Check size={18} />
                  {submitting ? "Đang xử lý..." : "Duyệt"}
                </button>

                <button
                  onClick={() => {
                    handleRejectEvent(selectedEvent.id);
                    setShowDetailModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  <X size={18} />
                  {submitting ? "Đang xử lý..." : "Từ chối"}
                </button>
              </div>
            )}
          </div>
        </EventModal>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Xác nhận xóa sự kiện"
        message={`Bạn có chắc chắn muốn xóa sự kiện "${selectedEvent?.title}"? Hành động này không thể hoàn tác!`}
        confirmText={submitting ? "Đang xóa..." : "Xóa"}
        cancelText="Hủy"
        onConfirm={handleDeleteEvent}
        onCancel={() => {
          setShowDeleteConfirm(false);
          setSelectedEvent(null);
        }}
        type="danger"
      />

      {/* Pagination Controls */}
      {events.length > 0 && (
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            {/* Showing info */}
            <div className="text-sm text-gray-600">
              {/* Hiển thị <span className="font-semibold text-gray-900">{startIndex + 1}</span> đến{' '}
              <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredEvents.length)}</span> trong tổng số{' '}
              <span className="font-semibold text-gray-900">{filteredEvents.length}</span> sự kiện */}
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
                        ? 'bg-orange-600 text-white'
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
    </div>
  );
};

export default ListEventPage;
