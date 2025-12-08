import { Search, Filter, Eye, Trash2, Check, X, Image as ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import eventService from "../../../services/eventService";
import type { GetEventResponse } from "../../../types/Event";
import { toast } from "react-toastify";

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<GetEventResponse[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setIsLoading(true);
    try {
      const response = await eventService.getAllEvents({ status: "PUBLISHED" });
      if(response){
        setEvents(response.data.data);
        console.log("response loaded", response);
      }
    } catch (error: any) {
      console.error("Error fetching events:", error);
      toast.error("Không thể tải danh sách sự kiện.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchesStatus =
      statusFilter === "" || statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue?.name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

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
      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig[status] || "bg-gray-100 text-gray-700"}`}>
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
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e, index) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.organizer.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {new Date(e.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.venue?.name || "-"}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(e.status)}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowDetailModal(true);                        
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Xóa"
                          disabled={submitting}
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {filteredEvents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{filteredEvents.length}</span> sự kiện
        </div>
      )}

      {/* Detail Modal */}
      {showDetailModal && selectedEvent && (
        <EventModal title="Chi tiết sự kiện" onClose={() => setShowDetailModal(false)}>
          <div className="space-y-6">
            {/* Event Image */}
            <div className="relative w-full h-64 rounded-lg overflow-hidden bg-gray-100 mt-4">
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

            {/* Thông tin chi tiết */}
            <div className="space-y-3 overflow-y-auto max-h-96">
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">ID:</span>
                <span className="text-gray-700 break-all">{selectedEvent.id}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Tên sự kiện:</span>
                <span className="text-gray-700">{selectedEvent.title}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Ban tổ chức:</span>
                <span className="text-gray-700">{selectedEvent.organizer.name}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Ngày tạo:</span>
                <span className="text-gray-700">{new Date(selectedEvent.createdAt).toLocaleString('vi-VN')}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Địa điểm:</span>
                <span className="text-gray-700">{selectedEvent.venue?.name || "-"}</span>
              </div>
              <div className="flex gap-2">
                <span className="font-semibold min-w-[120px]">Trạng thái:</span>
                {getStatusBadge(selectedEvent.status)}
              </div>
              {(selectedEvent.imageUrl || selectedEvent.bannerUrl) && (
                <div className="flex gap-2 items-start">
                  <span className="font-semibold min-w-[120px]">URL Ảnh:</span>
                  <a 
                    href={selectedEvent.bannerUrl || selectedEvent.imageUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 hover:underline break-all flex-1 text-sm"
                  >
                    {selectedEvent.bannerUrl || selectedEvent.imageUrl}
                  </a>
                </div>
              )}
              {selectedEvent.description && (
                <div className="flex gap-2 items-start">
                  <span className="font-semibold min-w-[120px]">Mô tả:</span>
                  <span className="text-gray-700 flex-1">{selectedEvent.description}</span>
                </div>
              )}
            </div>

            {/* Action buttons */}
            {selectedEvent.status === "PENDING" && (
              <div className="flex gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => {
                    handleApproveEvent(selectedEvent.id, "PUBLISHED");
                    setShowDetailModal(false);
                  }}
                  disabled={submitting}
                  className="flex-1 flex items-center justify-center gap-2 bg-green-600 text-white py-2.5 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-2.5 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <X size={18} />
                  {submitting ? "Đang xử lý..." : "Từ chối"}
                </button>
              </div>
            )}

            {(selectedEvent.status === "PUBLISHED" || selectedEvent.status === "CANCELED") && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  {selectedEvent.status === "PUBLISHED" 
                    ? "Sự kiện đã được duyệt" 
                    : "Sự kiện đã bị từ chối"}
                </p>
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
