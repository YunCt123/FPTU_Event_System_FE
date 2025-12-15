import { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Mail,
  Phone,
  User,
  FileSpreadsheet,
  Send,
} from 'lucide-react';
import type { CheckInStatus, AttendanceReponse, Data} from '../../../types/Attendee';
import type { GetEventResponse } from '../../../types/Event';
import { organizerService, userService } from '../../../services';
// import eventService from '../../../services/eventService';

const AttendeesManagementPage = () => {
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  // const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(null);
  const [attendees, setAttendees] = useState<Data[]>([]);
  const [filteredAttendees, setFilteredAttendees] = useState<Data[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | CheckInStatus>('ALL');
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(new Set());
  const [attendee, setAttendee] = useState<AttendanceReponse>();


  

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

  // const fetchAttendees = async (eventId: string) => {
  //   try {
  //     const response = await eventService.getEventById(eventId);
  //     if (response) {
  //       console.log("Event attendees:", response.data);
  //       setSelectedEvent(response.data);
  //       // TODO: Replace with actual attendees data from API
  //       // setAttendees(response.data.attendees || []);
        
  //       // Mock data for now - will be replaced when API is ready
  //       const mockAttendees: Attendee[] = [
  //         {
  //           id: 1,
  //           eventId: Number(eventId),
  //           studentId: 'SE160001',
  //           fullName: 'Nguyễn Văn A',
  //           email: 'anvse160001@fpt.edu.vn',
  //           phone: '0912345678',
  //           registeredAt: '2024-12-01T10:30:00',
  //           checkInStatus: 'CHECKED_IN',
  //           checkInTime: '2024-12-10T08:45:00',
  //           seat: 'A1',
  //         },
  //         {
  //           id: 2,
  //           eventId: Number(eventId),
  //           studentId: 'SE160002',
  //           fullName: 'Trần Thị B',
  //           email: 'bttse160002@fpt.edu.vn',
  //           phone: '0987654321',
  //           registeredAt: '2024-12-01T11:00:00',
  //           checkInStatus: 'NOT_CHECKED_IN',
  //           seat: 'A2',
  //         },
  //       ];
  //       setAttendees(mockAttendees);
  //       setFilteredAttendees(mockAttendees);
  //     }
  //   } catch (error) {
  //     console.log("Error fetching attendees data:", error);
  //   }
  // };

  const fetchAttendees = async (eventId: string) => {
    try{
      const response = await userService.getAttendUser(eventId);
      if(response){
        console.log("response stats", response.data);
        setAttendee(response.data);
        setAttendees(response.data.data);
      }else{
        console.log("No attendees data or Api");
      }
    }catch(error){
      console.log("Error fetching attendees data:", error);    
    }
  };

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    fetchAttendees(selectedEventId);
  }, [selectedEventId]);
  
  console.log(selectedEventId);
  
  useEffect(() => {
    let filtered = attendees;

    if (searchQuery) {
      filtered = filtered.filter(
        (attendee) =>
          attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (attendee.phoneNumber && attendee.phoneNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
          (attendee.studentCode && attendee.studentCode.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((attendee) => attendee.status === statusFilter);
    }

    setFilteredAttendees(filtered);
  }, [searchQuery, statusFilter, attendees]);

  const stats = {
    total: attendee?.summary?.totalRegistered || 0,
    checkedIn: attendee?.summary?.checkedIn || 0,
    notCheckedIn: (attendee?.summary?.totalRegistered || 0) - (attendee?.summary?.checkedIn || 0) - (attendee?.summary?.cancelled || 0),
    cancelled: attendee?.summary?.cancelled || 0,
    attendanceRate: attendee?.summary?.attendanceRate || 0,
  };

  // const getStatusBadge = (status: string) => {
  //   const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
  //     CHECKED_IN: {
  //       label: 'Đã check-in',
  //       className: 'bg-green-100 text-green-700',
  //       icon: CheckCircle,
  //     },
  //     NOT_CHECKED_IN: {
  //       label: 'Chưa check-in',
  //       className: 'bg-yellow-100 text-yellow-700',
  //       icon: Clock,
  //     },
  //     CANCELLED: {
  //       label: 'Đã hủy',
  //       className: 'bg-red-100 text-red-700',
  //       icon: XCircle,
  //     },
  //   };

  //   const config = statusConfig[status];
  //   const Icon = config.icon;
  //   return (
  //     <span className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
  //       <Icon size={14} />
  //       {config.label}
  //     </span>
  //   );
  // };

  const handleSelectAll = () => {
    if (selectedAttendees.size === filteredAttendees.length) {
      setSelectedAttendees(new Set());
    } else {
      setSelectedAttendees(new Set(filteredAttendees.map((a) => a.ticketId)));
    }
  };

  const handleSelectAttendee = (id: string) => {
    const newSelected = new Set(selectedAttendees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAttendees(newSelected);
  };

  const exportToExcel = () => {
    // Mock export - Replace with actual Excel export logic
    const dataToExport = selectedAttendees.size > 0
      ? attendees.filter((a) => selectedAttendees.has(a.ticketId))
      : filteredAttendees;

    const csvContent = [
      ['Mã SV', 'Họ tên', 'Email', 'SĐT', 'Trạng thái', 'Thời gian đăng ký', 'Thời gian check-in', 'Ghế ngồi'],
      ...dataToExport.map((a) => [
        a.studentCode || '',
        a.fullName,
        a.email,
        a.phoneNumber || '',
        a.status === 'CHECKED_IN' ? 'Đã tham dự' : a.status === 'NOT_CHECKED_IN' ? 'Chưa tham dự' : 'Đã hủy',
        a.bookingDate ? new Date(a.bookingDate).toLocaleString('vi-VN') : '',
        a.checkinTime ? new Date(a.checkinTime).toLocaleString('vi-VN') : '',
        a.seat?.label || '',
      ]),
    ]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `attendees_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const sendEmailToSelected = () => {
    const selectedEmails = attendees
      .filter((a) => selectedAttendees.has(a.ticketId))
      .map((a) => a.email);
    
    if (selectedEmails.length === 0) {
      alert('Vui lòng chọn ít nhất một người tham dự');
      return;
    }

    console.log('Sending email to:', selectedEmails);
    alert(`Đã gửi email đến ${selectedEmails.length} người tham dự`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Người tham dự</h1>
          <p className="text-gray-600 mt-1">
            Theo dõi, quản lý và xuất danh sách người tham dự theo sự kiện
          </p>
        </div>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn Sự kiện
        </label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
        >
          {events.length === 0 ? (
            <option value="">Không có sự kiện nào</option>
          ) : (
            events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event.startTime).toLocaleDateString('vi-VN')}
              </option>
            ))
          )}
        </select>
      </div>

      {!selectedEventId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <User className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng chọn sự kiện
          </h3>
          <p className="text-gray-600">
            Chọn một sự kiện để xem danh sách người tham dự
          </p>
        </div>
      ) : (
        <>
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-orange-100 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600 ">Tổng đăng ký</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 p-4 ">
          <div className="text-sm text-gray-600 ">Đã check-in</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.checkedIn}</div>
        </div>
        <div className="bg-yellow-100 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Chưa check-in</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.notCheckedIn}</div>
        </div>
        <div className="bg-red-100 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đã hủy</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{stats.cancelled}</div>
        </div>
        <div className="bg-blue-100 rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tỷ lệ tham dự</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{Math.round(stats.attendanceRate)}%</div>
        </div>
      </div>

      {/* Actions & Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã SV, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(
                  e.target.value as 'ALL' | 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'CANCELLED'
                )
              }
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="CHECKED_IN">Đã check-in</option>
              <option value="NOT_CHECKED_IN">Chưa check-in</option>
              <option value="CANCELLED">Đã hủy</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={sendEmailToSelected}
              disabled={selectedAttendees.size === 0}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send size={20} />
              <span className="hidden sm:inline">Gửi email</span>
            </button>
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <FileSpreadsheet size={20} />
              <span className="hidden sm:inline">Xuất Excel</span>
            </button>
          </div>
        </div>

        {selectedAttendees.size > 0 && (
          <div className="mt-3 flex items-center justify-between p-3 bg-blue-50 rounded-lg">
            <span className="text-sm text-blue-800 font-medium">
              Đã chọn {selectedAttendees.size} người tham dự
            </span>
            <button
              onClick={() => setSelectedAttendees(new Set())}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Bỏ chọn tất cả
            </button>
          </div>
        )}
      </div>

      {/* Attendees Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedAttendees.size === filteredAttendees.length &&
                      filteredAttendees.length > 0
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                  />
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Mã SV
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Họ tên
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Liên hệ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Ghế
                </th>
                {/* <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th> */}
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thời gian
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAttendees.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <User className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600">Không tìm thấy người tham dự</p>
                  </td>
                </tr>
              ) : (
                filteredAttendees.map((attendee) => (
                  <tr key={attendee.ticketId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedAttendees.has(attendee.ticketId)}
                        onChange={() => handleSelectAttendee(attendee.ticketId)}
                        className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                      />
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {attendee.studentCode || '-'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={20} className="text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {attendee.fullName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          <a
                          href={`mailto:${attendee.email}`}
                          className="text-sm text-[#F27125] hover:text-[#d95c0b] hover:underline"
                          >
                          {attendee.email}
                          </a>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {attendee.phoneNumber || '-'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {attendee.seat?.label || '-'} {attendee.seat?.row ? `(${attendee.seat.row})` : ''}
                    </td>
                    <td className="px-6 py-4">{(attendee.status)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {attendee.bookingDate ? new Date(attendee.bookingDate).toLocaleDateString('vi-VN') : '-'}
                      <br />
                      {attendee.bookingDate ? new Date(attendee.bookingDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }) : ''}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {attendee.checkinTime
                        ? new Date(attendee.checkinTime).toLocaleString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                            day: '2-digit',
                            month: '2-digit',
                          })
                        : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AttendeesManagementPage;
