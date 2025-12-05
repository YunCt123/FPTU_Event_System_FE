import { Search, Filter, Eye, SquarePen } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import EventModal from "../../../components/admin/event/EventModal";

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [events, setEvents] = useState([]);
  const navigate = useNavigate();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const mockEvents = [
      { id: 1, name: "Tech Conference 2025", organizer: "FPT University", date: "2025-12-10", venue: "Hall A", status: "pending" },
      { id: 2, name: "Music Festival Summer", organizer: "Student Club", date: "2025-08-15", venue: "Room 105", status: "approved" },
      { id: 3, name: "Startup Pitching Day", organizer: "Innovation Hub", date: "2025-07-22", venue: "Room 202", status: "rejected" },
      { id: 4, name: "AI Robotics Workshop", organizer: "Tech Labs", date: "2025-06-14", venue: "Room 231", status: "pending" },
      { id: 5, name: "Charity Marathon", organizer: "Community Group", date: "2025-05-30", venue: "Hall B", status: "approved" },
    ];
    setEvents(mockEvents);
  }, []);

  const filteredEvents = events.filter((e) => {
    const matchesStatus = statusFilter === "" || statusFilter === "all" || e.status === statusFilter;
    const matchesSearch =
      searchTerm === "" ||
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.venue.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Event Approval List</h1>
        <p className="text-gray-600 mt-1">Quản lý phê duyệt sự kiện</p>
      </div>

      {/* Search + Filter */}
      <div className="flex items-center gap-3 mb-4">
        {/* Search */}
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

        {/* Filter */}
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2.5 min-w-[200px]">
          <Filter size={20} className="text-gray-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full text-gray-700 cursor-pointer"
          >
            <option value="all">Tất cả</option>
            <option value="pending">Đang xử lý</option>
            <option value="approved">Đã duyệt</option>
            <option value="rejected">Bị từ chối</option>
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
                <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Action</th>
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
                    <td className="px-6 py-4 text-sm capitalize text-gray-900">{e.status}</td>

                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {/* View Detail Button */}
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

                        {/* Edit Event Button */}
                        <button
                          onClick={() => navigate(`/admin/events/${e.id}`)}
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

      {/* Total Count */}
      {filteredEvents.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{filteredEvents.length}</span> sự kiện
        </div>
      )}

      {/* Modal hiển thị chi tiết */}
      {showDetailModal && selectedEvent && (
        <EventModal
          title="Event Details"
          onClose={() => setShowDetailModal(false)}
        >
          <div className="space-y-2">
            <p className="text-sm"><strong>ID:</strong> {selectedEvent.id}</p>
            <p className="text-sm"><strong>Name:</strong> {selectedEvent.name}</p>
            <p className="text-sm"><strong>Organizer:</strong> {selectedEvent.organizer}</p>
            <p className="text-sm"><strong>Date:</strong> {selectedEvent.date}</p>
            <p className="text-sm"><strong>Venue:</strong> {selectedEvent.venue}</p>
            <p className="text-sm"><strong>Status:</strong> <span className="capitalize">{selectedEvent.status}</span></p>
          </div>
        </EventModal>
      )}
    </div>
  );
};

export default ListEventPage;
