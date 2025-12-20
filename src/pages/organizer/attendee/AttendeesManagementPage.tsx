import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import type {
  CheckInStatus,
  AttendanceReponse,
  Data,
  meta,
} from "../../../types/Attendee";
import type { GetEventResponse } from "../../../types/Event";
import { organizerService, userService } from "../../../services";

// import eventService from '../../../services/eventService';

const AttendeesManagementPage = () => {
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(
    null
  );
  // const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(null);
  const [attendees, setAttendees] = useState<Data[]>([]);
  const [pagination, setPagination] = useState<meta>();
  const [filteredAttendees, setFilteredAttendees] = useState<Data[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<
    "ALL" | CheckInStatus | "VALID" | "USED" | "EXPIRED"
  >("ALL");
  const [selectedAttendees, setSelectedAttendees] = useState<Set<string>>(
    new Set()
  );
  const [attendee, setAttendee] = useState<AttendanceReponse>();
  const [currentPage, setCurrentPage] = useState(1);

  // Event dropdown states
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [eventPagination, setEventPagination] = useState<{
    totalPages: number;
    totalItems: number;
    currentPage: number;
  } | null>(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  // Cache for events (without search)
  const eventsCacheRef = useRef<GetEventResponse[]>([]);
  const eventsCacheLoadedRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEventDropdownOpen(false);
      }
    };

    if (isEventDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEventDropdownOpen]);

  const fetchEvents = async (
    page: number = 1,
    search: string = "",
    append: boolean = false,
    useCache: boolean = false
  ) => {
    // Use cache if available and no search query
    if (
      useCache &&
      !search.trim() &&
      eventsCacheLoadedRef.current &&
      eventsCacheRef.current.length > 0
    ) {
      setEvents(eventsCacheRef.current);
      // Auto-select first event if not selected
      if (!selectedEventId && eventsCacheRef.current.length > 0) {
        const firstEvent = eventsCacheRef.current[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
      return;
    }

    try {
      setIsLoadingEvents(true);
      const response: any = await organizerService.getOrganizerEvents({
        page,
        limit: 10,
        search: search.trim() || undefined,
      });

      // Extract data from response - handle multiple response structures
      let eventData: GetEventResponse[] = [];
      let meta = null;

      // Try different response structures
      if (response?.data) {
        // Structure 1: response.data.data (array) with response.data.meta
        if (Array.isArray(response.data.data)) {
          eventData = response.data.data;
          meta = response.data.meta;
        }
        // Structure 2: response.data.data.data (nested)
        else if (
          response.data.data?.data &&
          Array.isArray(response.data.data.data)
        ) {
          eventData = response.data.data.data;
          meta = response.data.data.meta || response.data.meta;
        }
        // Structure 3: response.data is array directly
        else if (Array.isArray(response.data)) {
          eventData = response.data;
        }
        // Structure 4: response.data.data is object with data array
        else if (
          response.data.data &&
          typeof response.data.data === "object" &&
          Array.isArray(response.data.data.data)
        ) {
          eventData = response.data.data.data;
          meta = response.data.data.meta || response.data.meta;
        }
      }

      if (append) {
        setEvents((prev) => [...prev, ...eventData]);
      } else {
        setEvents(eventData);
        // Cache events if no search query
        if (!search.trim() && page === 1) {
          eventsCacheRef.current = eventData;
          eventsCacheLoadedRef.current = true;
        }
      }

      if (meta) {
        setEventPagination({
          totalPages: meta.totalPages || 1,
          totalItems: meta.total || 0,
          currentPage: meta.currentPage || page,
        });
        setHasMoreEvents(page < (meta.totalPages || 1));
      } else {
        // If no meta, assume has more if we got a full page
        setHasMoreEvents(eventData.length === 10);
        setEventPagination({
          totalPages: page + (eventData.length === 10 ? 1 : 0),
          totalItems: eventData.length,
          currentPage: page,
        });
      }

      // Auto-select first event if not selected and this is initial load
      if (
        !search.trim() &&
        page === 1 &&
        !selectedEventId &&
        eventData.length > 0
      ) {
        const firstEvent = eventData[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setEvents([]);
      setHasMoreEvents(false);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Load more events when scrolling to bottom
  const handleEventScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isNearBottom && hasMoreEvents && !isLoadingEvents && eventPagination) {
      const nextPage = eventCurrentPage + 1;
      if (nextPage <= eventPagination.totalPages) {
        setEventCurrentPage(nextPage);
        fetchEvents(nextPage, eventSearchQuery, true);
      }
    }
  };

  // Debounce search
  useEffect(() => {
    if (!isEventDropdownOpen) return;

    const timer = setTimeout(() => {
      setEventCurrentPage(1);
      setEvents([]);
      fetchEvents(1, eventSearchQuery, false, false);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSearchQuery, isEventDropdownOpen]);

  // Initial load on mount - auto-select first event
  useEffect(() => {
    if (eventsCacheLoadedRef.current && eventsCacheRef.current.length > 0) {
      // Use cache if available
      setEvents(eventsCacheRef.current);
      if (!selectedEventId && eventsCacheRef.current.length > 0) {
        const firstEvent = eventsCacheRef.current[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
    } else {
      // Load events on mount
      fetchEvents(1, "", false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load events when dropdown opens (use cache if available)
  useEffect(() => {
    if (isEventDropdownOpen) {
      if (!eventSearchQuery.trim() && eventsCacheLoadedRef.current) {
        // Use cache if no search
        fetchEvents(1, "", false, true);
      } else if (events.length === 0) {
        // Load if no cache or has search
        fetchEvents(1, eventSearchQuery, false, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventDropdownOpen]);

  // Update selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) {
        setSelectedEvent(found);
      }
    }
  }, [selectedEventId, events]);

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

  const fetchAttendees = async (eventId: string, page: number) => {
    try {
      const response = await userService.getAttendUser(eventId, { page: page });
      if (response) {
        console.log("response stats", response.data);
        setAttendee(response.data);
        setAttendees(response.data.data);
        setPagination(response.data.meta);
      } else {
        console.log("No attendees data or Api");
      }
    } catch (error) {
      console.log("Error fetching attendees data:", error);
    }
  };

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    setCurrentPage(1);
  }, [selectedEventId]);

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    fetchAttendees(selectedEventId, currentPage);
  }, [selectedEventId, currentPage]);

  console.log(selectedEventId);

  useEffect(() => {
    let filtered = attendees;

    if (searchQuery) {
      filtered = filtered.filter(
        (attendee) =>
          attendee.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          attendee.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (attendee.phoneNumber &&
            attendee.phoneNumber
              .toLowerCase()
              .includes(searchQuery.toLowerCase())) ||
          (attendee.studentCode &&
            attendee.studentCode
              .toLowerCase()
              .includes(searchQuery.toLowerCase()))
      );
    }

    if (statusFilter !== "ALL") {
      filtered = filtered.filter(
        (attendee) => attendee.status === statusFilter
      );
    }

    setFilteredAttendees(filtered);
  }, [searchQuery, statusFilter, attendees]);

  const stats = {
    total: attendee?.summary?.totalRegistered || 0,
    checkedIn: attendee?.summary?.checkedIn || 0,
    notCheckedIn:
      (attendee?.summary?.totalRegistered || 0) -
      (attendee?.summary?.checkedIn || 0) -
      (attendee?.summary?.cancelled || 0),
    cancelled: attendee?.summary?.cancelled || 0,
    attendanceRate: attendee?.summary?.attendanceRate || 0,
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<
      string,
      { label: string; className: string; icon: any }
    > = {
      VALID: {
        label: "Hợp lệ",
        className: "bg-blue-100 text-blue-700",
        icon: Clock,
      },
      USED: {
        label: "Đã sử dụng",
        className: "bg-green-100 text-green-700",
        icon: CheckCircle,
      },
      CANCELLED: {
        label: "Đã hủy",
        className: "bg-red-100 text-red-700",
        icon: XCircle,
      },
      EXPIRED: {
        label: "Đã hết hạn",
        className: "bg-gray-100 text-gray-700",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.VALID;
    const Icon = config.icon;
    return (
      <span
        className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
      >
        <Icon size={14} />
        {config.label}
      </span>
    );
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
    const dataToExport =
      selectedAttendees.size > 0
        ? attendees.filter((a) => selectedAttendees.has(a.ticketId))
        : filteredAttendees;

    const getStatusLabel = (status: string) => {
      const labels: Record<string, string> = {
        VALID: "Hợp lệ",
        USED: "Đã sử dụng",
        CANCELLED: "Đã hủy",
        EXPIRED: "Đã hết hạn",
      };
      return labels[status] || status;
    };

    const csvContent = [
      [
        "Mã SV",
        "Họ tên",
        "Email",
        "SĐT",
        "Trạng thái",
        "Thời gian đăng ký",
        "Thời gian check-in",
        "Ghế ngồi",
      ],
      ...dataToExport.map((a) => [
        a.studentCode || "",
        a.fullName,
        a.email,
        a.phoneNumber || "",
        getStatusLabel(a.status),
        a.bookingDate ? new Date(a.bookingDate).toLocaleString("vi-VN") : "",
        a.checkinTime ? new Date(a.checkinTime).toLocaleString("vi-VN") : "",
        a.seat?.label || "",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob(["\ufeff" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendees_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  const sendEmailToSelected = () => {
    const selectedEmails = attendees
      .filter((a) => selectedAttendees.has(a.ticketId))
      .map((a) => a.email);

    if (selectedEmails.length === 0) {
      alert("Vui lòng chọn ít nhất một người tham dự");
      return;
    }

    console.log("Sending email to:", selectedEmails);
    alert(`Đã gửi email đến ${selectedEmails.length} người tham dự`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý Người tham dự
          </h1>
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
        <div className="relative" ref={eventDropdownRef}>
          <div
            onClick={() => {
              setIsEventDropdownOpen(!isEventDropdownOpen);
              // Reset search when opening dropdown
              if (!isEventDropdownOpen) {
                setEventSearchQuery("");
                setEventCurrentPage(1);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent cursor-pointer flex items-center justify-between bg-white"
          >
            <span className={selectedEvent ? "text-gray-900" : "text-gray-500"}>
              {selectedEvent
                ? `${selectedEvent.title} - ${
                    selectedEvent.startTime
                      ? new Date(selectedEvent.startTime).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""
                  }`
                : "Chọn sự kiện..."}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isEventDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isEventDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
              {/* Search input */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Event list with scroll */}
              <div
                onScroll={handleEventScroll}
                className="overflow-y-auto max-h-64"
              >
                {isLoadingEvents && events.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F27125] mx-auto mb-2"></div>
                    Đang tải...
                  </div>
                ) : events.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy sự kiện nào
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setSelectedEvent(event);
                        setIsEventDropdownOpen(false);
                        // Reset search and pagination when selecting
                        setEventSearchQuery("");
                        setEventCurrentPage(1);
                        // Don't clear events, keep them for next time dropdown opens
                      }}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedEventId === event.id
                          ? "bg-orange-50 border-l-4 border-[#F27125]"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.startTime).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  ))
                )}

                {/* Loading more indicator */}
                {isLoadingEvents && events.length > 0 && (
                  <div className="p-2 text-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F27125] mx-auto mb-1"></div>
                    Đang tải thêm...
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMoreEvents && events.length > 0 && (
                  <div className="p-2 text-center text-gray-400 text-xs">
                    Đã hiển thị tất cả sự kiện
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
              <div className="text-2xl font-bold text-gray-900 mt-1">
                {stats.total}
              </div>
            </div>
            <div className="bg-green-100 rounded-xl shadow-sm border border-gray-200 p-4 ">
              <div className="text-sm text-gray-600 ">Đã check-in</div>
              <div className="text-2xl font-bold text-green-600 mt-1">
                {stats.checkedIn}
              </div>
            </div>
            <div className="bg-yellow-100 rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Chưa check-in</div>
              <div className="text-2xl font-bold text-yellow-600 mt-1">
                {stats.notCheckedIn}
              </div>
            </div>
            <div className="bg-red-100 rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Đã hủy</div>
              <div className="text-2xl font-bold text-red-600 mt-1">
                {stats.cancelled}
              </div>
            </div>
            <div className="bg-blue-100 rounded-xl shadow-sm border border-gray-200 p-4">
              <div className="text-sm text-gray-600">Tỷ lệ tham dự</div>
              <div className="text-2xl font-bold text-blue-600 mt-1">
                {Math.round(stats.attendanceRate)}%
              </div>
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
                      e.target.value as
                        | "ALL"
                        | "VALID"
                        | "USED"
                        | "CANCELLED"
                        | "EXPIRED"
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="ALL">Tất cả trạng thái</option>
                  <option value="VALID">Hợp lệ</option>
                  <option value="USED">Đã sử dụng</option>
                  <option value="CANCELLED">Đã hủy</option>
                  <option value="EXPIRED">Đã hết hạn</option>
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
                      Thời gian đăng ký
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      Thời gian check-in
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAttendees.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-6 py-12 text-center">
                        <User
                          className="mx-auto text-gray-400 mb-3"
                          size={48}
                        />
                        <p className="text-gray-600">
                          Không tìm thấy người tham dự
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredAttendees.map((attendee) => (
                      <tr key={attendee.ticketId} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedAttendees.has(attendee.ticketId)}
                            onChange={() =>
                              handleSelectAttendee(attendee.ticketId)
                            }
                            className="w-4 h-4 text-[#F27125] border-gray-300 rounded focus:ring-[#F27125]"
                          />
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {attendee.studentCode || "-"}
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
                              {attendee.phoneNumber || "-"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {attendee.seat?.label || "-"}{" "}
                          {attendee.seat?.row ? `(${attendee.seat.row})` : ""}
                        </td>
                        <td className="px-6 py-4 text-center">
                          {getStatusBadge(attendee.status)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {attendee.bookingDate
                            ? new Date(attendee.bookingDate).toLocaleString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {attendee.checkinTime
                            ? new Date(attendee.checkinTime).toLocaleString(
                                "vi-VN",
                                {
                                  day: "2-digit",
                                  month: "2-digit",
                                  year: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                }
                              )
                            : "-"}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages >= 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                <div className="text-sm text-gray-600">
                  Trang {pagination.currentPage} / {pagination.totalPages}{" "}
                  (Tổng: {pagination.totalItems} người tham dự)
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Trước
                  </button>
                  <div className="flex items-center gap-1">
                    {Array.from(
                      { length: pagination.totalPages },
                      (_, i) => i + 1
                    )
                      .filter((page) => {
                        if (pagination.totalPages <= 7) return true;
                        if (page === 1 || page === pagination.totalPages)
                          return true;
                        if (page >= currentPage - 1 && page <= currentPage + 1)
                          return true;
                        return false;
                      })
                      .map((page, idx, arr) => (
                        <div key={page} className="flex items-center">
                          {idx > 0 && arr[idx - 1] !== page - 1 && (
                            <span className="px-2 text-gray-400">...</span>
                          )}
                          <button
                            onClick={() => setCurrentPage(page)}
                            className={`w-10 h-10 rounded-lg transition-colors ${
                              currentPage === page
                                ? "bg-[#F27125] text-white"
                                : "border border-gray-300 hover:bg-gray-50"
                            }`}
                          >
                            {page}
                          </button>
                        </div>
                      ))}
                  </div>
                  <button
                    onClick={() =>
                      setCurrentPage((prev) =>
                        Math.min(pagination.totalPages, prev + 1)
                      )
                    }
                    disabled={currentPage === pagination.totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Sau
                  </button>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default AttendeesManagementPage;
