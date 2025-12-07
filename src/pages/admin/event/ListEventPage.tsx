import { Search, Filter, Eye, SquarePen, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import EditEventModal from "../../../components/admin/event/EditEventModal";
import eventService from "../../../services/eventService";
import type { GetEventResponse } from "../../../types/Event";
import { toast } from "react-toastify";

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<GetEventResponse[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // const [confirmModal, setConfirmModal] = useState <{
  //   isOpen: boolean;
  //   eventId: number | null;
  // }>({
  //   isOpen: false,
  //   eventId: null,
  // });

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

  const handleEditSubmit = async (formData: any) => {
    setSubmitting(true);
    try {
      // TODO: Call API to update event
      await new Promise((resolve) => setTimeout(resolve, 1000));
      console.log("Updated event:", formData);
      toast.success("Cập nhật sự kiện thành công!");
      setShowEditModal(false);
      await fetchEvents();
    } catch (error) {
      toast.error("Cập nhật sự kiện thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteEvent = async () => {
    if (!selectedEvent) return;
    
    setSubmitting(true);
    try {
      // TODO: Call API to delete event
      // await eventService.deleteEvent(selectedEvent.id);
      await new Promise((resolve) => setTimeout(resolve, 1000));
      toast.success("Xóa sự kiện thành công!");
      setShowDeleteConfirm(false);
      setSelectedEvent(null);
      await fetchEvents();
    } catch (error) {
      toast.error("Xóa sự kiện thất bại!");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "PUBLISHED": "bg-green-100 text-green-700",
      "PENDING": "bg-yellow-100 text-yellow-700",
      "REJECTED": "bg-red-100 text-red-700",
      "DRAFT": "bg-gray-100 text-gray-700",
    };

    const statusLabel: Record<string, string> = {
      "PUBLISHED": "Đã duyệt",
      "PENDING": "Đang xử lý",
      "REJECTED": "Bị từ chối",
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
            <option value="REJECTED">Bị từ chối</option>
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
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50 transition-colors"
                          title="Chỉnh sửa"
                        >
                          <SquarePen size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 p-1 rounded-md hover:bg-red-50 transition-colors"
                          title="Xóa"
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
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">ID:</span>
              <span>{selectedEvent.id}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Tên:</span>
              <span>{selectedEvent.title}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Ban tổ chức:</span>
              <span>{selectedEvent.organizer.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Ngày tạo:</span>
              <span>{new Date(selectedEvent.createdAt).toLocaleString('vi-VN')}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Địa điểm:</span>
              <span>{selectedEvent.venue?.name || "-"}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Trạng thái:</span>
              {getStatusBadge(selectedEvent.status)}
            </div>
            {selectedEvent.description && (
              <div className="flex gap-2">
                <span className="font-semibold min-w-[100px]">Mô tả:</span>
                <span>{selectedEvent.description}</span>
              </div>
            )}
          </div>
        </EventModal>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedEvent && (
        <EventModal title="Chỉnh sửa sự kiện" onClose={() => setShowEditModal(false)}>
          <EditEventModal
            initialData={selectedEvent}
            onSubmit={handleEditSubmit}
            submitting={submitting}
          />
        </EventModal>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <EventModal title="Xác nhận xóa" onClose={() => setShowDeleteConfirm(false)}>
          <div className="space-y-4">
            <p className="text-gray-700">
              Bạn có chắc chắn muốn xóa sự kiện <strong>"{selectedEvent.title}"</strong>?
            </p>
            <p className="text-sm text-red-600">
              Hành động này không thể hoàn tác!
            </p>
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleDeleteEvent}
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? "Đang xóa..." : "Xóa"}
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={submitting}
                className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        </EventModal>
      )}
    </div>
  );
};

export default ListEventPage;
