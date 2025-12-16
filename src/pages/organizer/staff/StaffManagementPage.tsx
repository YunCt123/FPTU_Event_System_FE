import { useState, useEffect } from "react";
import {
  UserPlus,
  Search,
  Shield,
  Smartphone,
  UserRoundPlus,
} from "lucide-react";

import type { eventStaff, GetEventResponse } from "../../../types/Event";
import { organizerService } from "../../../services";
import eventService from "../../../services/eventService";
import StaffTable from "../../../components/organizer/staff/StaffTable";
import AddStaffModal from "../../../components/organizer/staff/AddStaffModal";
import CreateStaffAccountModal from "../../../components/organizer/staff/CreateStaffAccountModal";
// import { toast } from 'react-toastify';
// import { ConfirmModal } from '../../../components';

const StaffManagementPage = () => {
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse>();
  const [staffList, setStaffList] = useState<eventStaff[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredStaff, setFilteredStaff] = useState<eventStaff[]>([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] =
    useState(false);

  const fetchEvent = async () => {
    try {
      const response = await organizerService.getOrganizerEvents();
      if (response.status === 200 && response.data.data) {
        setEvents(response.data.data);
      } else {
        console.log("No event Data or Api");
      }
    } catch (error) {
      console.log("Error fetching event data:", error);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  console.log("eventList", events[0]?.id);
  console.log("eventSelectedId", selectedEventId);

  const fetchStaff = async (eventId: string) => {
    try {
      const response = await eventService.getEventById(eventId);
      if (response) {
        console.log("response2", response);
        setStaffList(response.data.eventStaffs);
        setSelectedEvent(response.data);
      }
    } catch (error) {
      console.log("Error fetching staff data:", error);
    }
  };

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    fetchStaff(selectedEventId);
  }, [selectedEventId]);

  console.log("eventID", selectedEventId);
  console.log("staffList123", staffList);

  useEffect(() => {
    const filtered = staffList.filter(
      (staff) =>
        staff.user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        staff.id.toString().includes(searchQuery)
    );
    setFilteredStaff(filtered);
  }, [searchQuery, staffList]);

  const handleDeleteStaff = (userId: number) => {
    if (selectedEventId) {
      fetchStaff(selectedEventId);
    }
  };

  const handleStaffAdded = () => {
    if (selectedEventId) {
      fetchStaff(selectedEventId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Staff</h1>
          <p className="text-gray-600 mt-1">
            Phân công staff và cấp quyền truy cập Mobile Check-in App theo sự
            kiện
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setIsCreateAccountModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
          >
            <UserRoundPlus size={20} />
            Tạo Tài Khoản Staff
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={!selectedEventId}
            className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus size={20} />
            Thêm Staff
          </button>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn Sự kiện
        </label>
        <select
          value={selectedEventId || ""}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
        >
          {events.length === 0 ? (
            <option value="">Không có sự kiện nào</option>
          ) : (
            events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} -{" "}
                {new Date(event.startTime).toLocaleDateString("vi-VN")}
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
          {searchQuery && filteredStaff.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Shield className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">Không tìm thấy staff</p>
            </div>
          ) : (
            <StaffTable
              staffList={filteredStaff}
              onDeleteStaff={handleDeleteStaff}
              eventId={selectedEventId}
            />
          )}

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Smartphone className="text-blue-600 mt-0.5" size={20} />
              <div>
                <h4 className="font-semibold text-blue-900">
                  Mobile Check-in App
                </h4>
                <p className="text-sm text-blue-700 mt-1">
                  Staff được cấp quyền App Access có thể sử dụng Mobile App để
                  check-in người tham dự tại sự kiện. Đảm bảo staff đã được đào
                  tạo về cách sử dụng app trước khi sự kiện diễn ra.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Add Staff Modal */}
      {isAddModalOpen && (
        <AddStaffModal
          staffList={staffList}
          eventId={selectedEventId}
          eventCampusId={selectedEvent?.venue?.campus?.id}
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onStaffAdded={handleStaffAdded}
        />
      )}

      {/* Create Staff Account Modal */}
      <CreateStaffAccountModal
        isOpen={isCreateAccountModalOpen}
        onClose={() => setIsCreateAccountModalOpen(false)}
        onStaffCreated={handleStaffAdded}
      />
    </div>
  );
};

export default StaffManagementPage;
