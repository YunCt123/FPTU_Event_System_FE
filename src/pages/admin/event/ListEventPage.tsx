import { Search, Filter, Eye, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import EditEventModal from "../../../components/admin/event/EditEventModal";

interface Event {
  id: number;
  name: string;
  organizer: string;
  date: string;
  venue: string;
  status: string;
  description: string;
  image: string;
}

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState<Event[]>([]);

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const mockEvents: Event[] = [
      {
        id: 1,
        name: "Tech Conference 2025",
        organizer: "FPT University",
        date: "2025-12-10",
        venue: "Hall A",
        status: "Đang xử lý",
        description: "A comprehensive technology conference",
        image: "https://thanhnien.mediacdn.vn/Uploaded/dieutrang-qc/2022_04_24/fpt2-7865.jpg",
      },
      {
        id: 2,
        name: "Music Festival Summer",
        organizer: "Student Club",
        date: "2025-08-15",
        venue: "Room 105",
        status: "Đã duyệt",
        description: "An exciting summer music festival",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
      },
      {
        id: 3,
        name: "Startup Pitching Day",
        organizer: "Innovation Hub",
        date: "2025-07-22",
        venue: "Room 202",
        status: "Bị từ chối",
        description: "Entrepreneurs showcase ideas",
        image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
      },
      {
        id: 4,
        name: "AI Robotics Workshop",
        organizer: "Tech Labs",
        date: "2025-06-14",
        venue: "Room 231",
        status: "Đang xử lý",
        description: "Hands-on AI workshop",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
      },
      {
        id: 5,
        name: "Charity Marathon",
        organizer: "Community Group",
        date: "2025-05-30",
        venue: "Hall B",
        status: "Đã duyệt",
        description: "Marathon for education",
        image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
      },
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesStatus =
      statusFilter === "" || statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  const handleEditSubmit = async (formData: Event) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Updated event:", formData);
    alert("Cập nhật sự kiện thành công!");
    setSubmitting(false);
    setShowEditModal(false);
    // TODO: Call API to update event
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, string> = {
      "Đã duyệt": "bg-green-100 text-green-700",
      "Đang xử lý": "bg-yellow-100 text-yellow-700",
      "Bị từ chối": "bg-red-100 text-red-700",
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${statusConfig[status] || "bg-gray-100 text-gray-700"}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Approval List</h1>
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
            <option value="Đang xử lý">Đang xử lý</option>
            <option value="Đã duyệt">Đã duyệt</option>
            <option value="Bị từ chối">Bị từ chối</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên sự kiện</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ban tổ chức</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Ngày tổ chức</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Địa điểm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                filteredEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{e.id}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.organizer}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">{e.venue}</td>
                    <td className="px-6 py-4 text-sm">{getStatusBadge(e.status)}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowDetailModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded-md hover:bg-blue-50 transition-colors"
                          title="View Details"
                        >
                          <Eye size={20} />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedEvent(e);
                            setShowEditModal(true);
                          }}
                          className="text-green-600 hover:text-green-800 p-1 rounded-md hover:bg-green-50 transition-colors"
                          title="Edit Event"
                        >
                          <SquarePen size={20} />
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
        <EventModal title="Event Details" onClose={() => setShowDetailModal(false)}>
          <div className="space-y-3">
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">ID:</span>
              <span>{selectedEvent.id}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Tên:</span>
              <span>{selectedEvent.name}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Ban tổ chức:</span>
              <span>{selectedEvent.organizer}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Ngày:</span>
              <span>{selectedEvent.date}</span>
            </div>
            <div className="flex gap-2">
              <span className="font-semibold min-w-[100px]">Địa điểm:</span>
              <span>{selectedEvent.venue}</span>
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
    </div>
  );
};

export default ListEventPage;
