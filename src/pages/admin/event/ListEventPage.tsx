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
      // @ts-ignore - deleteEvent parameter type compatibility
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

  console.log("sad", selectedEvent);

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
        <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
          <table className="w-full" style={{ overflow: 'visible' }}>
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

      {/* {filteredEvents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{filteredEvents.length}</span> sự kiện
        </div>
      )} */}

      {/* ✅ Detail Modal - REDESIGNED UI */}
      {showDetailModal && selectedEvent && (
        <EventModal title="Chi tiết sự kiện" onClose={() => setShowDetailModal(false)}>
          <div className="space-y-6">
            {/* Banner Image - Full Width */}
            <div className="relative w-full h-72 rounded-xl overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg">
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
                          <svg class="w-16 h-16 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                          </svg>
                          <p class="text-sm font-medium">Không thể tải ảnh banner</p>
                        </div>
                      `;
                    }
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                  <ImageIcon size={64} className="mb-3" />
                  <p className="text-sm font-medium">Chưa có ảnh banner</p>
                </div>
              )}
              
              {/* Status Badge Overlay */}
              <div className="absolute top-4 right-4">
                {getStatusBadge(selectedEvent.status)}
              </div>
            </div>

            {/* Event Title & ID */}
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{selectedEvent.title}</h2>
              <p className="text-sm text-gray-500 font-mono">ID: {selectedEvent.id}</p>
            </div>

            {/* Main Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Organizer */}
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Ban tổ chức</p>
                </div>
                <p className="text-lg font-bold text-blue-900">{selectedEvent.organizer.name}</p>
              </div>

              {/* Venue */}
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Địa điểm</p>
                </div>
                <p className="text-lg font-bold text-purple-900">{selectedEvent.venue?.name || "Sự kiện Online"}</p>
              </div>

              {/* Category */}
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-4 border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-amber-500 rounded-lg">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <p className="text-xs font-semibold text-amber-600 uppercase tracking-wide">Danh mục</p>
                </div>
                <p className="text-lg font-bold text-amber-900">{selectedEvent.category || "Chưa phân loại"}</p>
              </div>
            </div>

            {/* Time Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Time */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-4 border border-green-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-green-700">Thời gian bắt đầu</p>
                </div>
                <p className="text-base font-bold text-green-900">
                  {new Date(selectedEvent.startTime).toLocaleString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>

              {/* End Time */}
              <div className="bg-gradient-to-br from-orange-50 to-red-100 rounded-xl p-4 border border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-orange-700">Thời gian kết thúc</p>
                </div>
                <p className="text-base font-bold text-orange-900">
                  {new Date(selectedEvent.endTime).toLocaleString('vi-VN', {
                    weekday: 'long',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {/* Registration Time - Only for Offline Events */}
            {selectedEvent.venue && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Registration Start */}
                <div className="bg-gradient-to-br from-cyan-50 to-blue-100 rounded-xl p-4 border border-cyan-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm font-semibold text-cyan-700">Mở đăng ký</p>
                  </div>
                  <p className="text-base font-bold text-cyan-900">
                    {selectedEvent.startTimeRegister ? new Date(selectedEvent.startTimeRegister).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>

                {/* Registration End */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-100 rounded-xl p-4 border border-pink-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-3">
                    <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-sm font-semibold text-pink-700">Đóng đăng ký</p>
                  </div>
                  <p className="text-base font-bold text-pink-900">
                    {selectedEvent.endTimeRegister ? new Date(selectedEvent.endTimeRegister).toLocaleString('vi-VN', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Description */}
            {selectedEvent.description && (
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                  <p className="text-sm font-semibold text-gray-700">Mô tả sự kiện</p>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Speakers Section */}
            {selectedEvent.eventSpeakers && selectedEvent.eventSpeakers.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-5 border border-indigo-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-500 rounded-lg">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-indigo-900">Diễn giả</h3>
                  </div>
                  <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                    {selectedEvent.eventSpeakers.length}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedEvent.eventSpeakers.map((eventSpeaker) => (
                    <div 
                      key={eventSpeaker.id} 
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                    >
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        {eventSpeaker.speaker.avatar ? (
                          <img 
                            src={eventSpeaker.speaker.avatar} 
                            alt={eventSpeaker.speaker.name}
                            className="w-16 h-16 rounded-full object-cover flex-shrink-0 border-3 border-indigo-200 shadow-md"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(eventSpeaker.speaker.name)}&background=6366F1&color=fff&size=128`;
                            }}
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0 border-3 border-indigo-200 shadow-md">
                            {eventSpeaker.speaker.name.charAt(0).toUpperCase()}
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base text-gray-900 mb-1">
                            {eventSpeaker.speaker.name}
                          </p>
                          
                          {eventSpeaker.speaker.company && (
                            <div className="flex items-center gap-1 mb-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-sm text-gray-600 font-medium">{eventSpeaker.speaker.company}</p>
                            </div>
                          )}
                          
                          {eventSpeaker.topic && (
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mb-2">
                              <p className="text-xs text-indigo-700 font-semibold flex items-center gap-1">
                                <span>📚</span>
                                <span>{eventSpeaker.topic}</span>
                              </p>
                            </div>
                          )}
                          
                          {eventSpeaker.speaker.bio && (
                            <p className="text-xs text-gray-600 leading-relaxed line-clamp-2">
                              {eventSpeaker.speaker.bio}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {selectedEvent.status === "PENDING" && (
              <div className="flex gap-4 pt-4 border-t-2 border-gray-200">
                <button
                  onClick={() => {
                    handleApproveEvent(selectedEvent.id, "PUBLISHED");
                    setShowDetailModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3.5 rounded-xl hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-base font-bold"
                >
                  <Check size={20} />
                  {submitting ? "Đang xử lý..." : "Phê duyệt sự kiện"}
                </button>

                <button
                  onClick={() => {
                    handleRejectEvent(selectedEvent.id);
                    setShowDetailModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-3 bg-gradient-to-r from-red-600 to-rose-600 text-white py-3.5 rounded-xl hover:from-red-700 hover:to-rose-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-base font-bold"
                >
                  <X size={20} />
                  {submitting ? "Đang xử lý..." : "Từ chối sự kiện"}
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

      
    </div>
  );
};

export default ListEventPage;
