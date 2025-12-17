import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Calendar,
  Users,
  MapPin,
} from 'lucide-react';
import type { Event, EventStatus } from '../../../types/Event';
import EventFormModal from '../../../components/organizer/event/EventFormModal';
import EventFormModalOnline from '../../../components/organizer/event/EventFormModalOnline'; // ✅ IMPORT MODAL ONLINE
import DeleteRequestModal from '../../../components/organizer/event/DeleteRequestModal';
import { organizerService, eventService } from '../../../services'; // ✅ THÊM eventService
import { toast } from 'react-toastify';
import ActionDropdown from '../../../components/ActionDropdown';
import { Edit, Trash2, Eye } from 'lucide-react'; // ✅ Thêm Eye icon

const EventManagementPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // ✅ THÊM STATE PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Số item mỗi trang
  
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    eventId: string | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });

  // ✅ THÊM STATE CHO MODAL LOẠI SỰ KIỆN
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [eventTypeToCreate, setEventTypeToCreate] = useState<"offline" | "online" | null>(null);

  useEffect(() => {
    fetchEventsByOrganizer();
  }, []);

  const normalizeStatus = (status: string): EventStatus => {
    const normalizedStatus = status?.toUpperCase().trim();
    
    const statusMap: Record<string, EventStatus> = {
      'PENDING': 'PENDING',
      'APPROVED': 'APPROVED',
      'PUBLISHED': 'APPROVED', 
      'CANCELED': 'CANCELED',
      'CANCELLED': 'CANCELED',
      'REJECTED': 'CANCELED',
      'COMPLETED': 'COMPLETED',
      'FINISHED': 'COMPLETED',
      'DONE': 'COMPLETED',
    };
    
    const mappedStatus = statusMap[normalizedStatus];
    
    console.log(`Mapping status: "${status}" -> "${normalizedStatus}" -> "${mappedStatus}"`);
    
    return mappedStatus || 'PENDING';
  };

  const fetchEventsByOrganizer = async () => {
    setIsLoading(true);
    try {
      console.log('Fetching all organizer events with pagination...');

      let allEvents: any[] = [];
      let currentPage = 1;
      let totalPages = 1;
      let totalItems = 0;

      // FETCH TẤT CẢ PAGES
      do {
        console.log(`\n Fetching page ${currentPage}/${totalPages}...`);
        
        const response: any = await organizerService.getOrganizerEvents({
          page: currentPage,
          limit: 10,
        });

        console.log(`Page ${currentPage} response:`, response.data);
        
        // ✅ THÊM LOG ĐỂ DEBUG
        console.log('Full response object:', response);
        console.log('response.data type:', typeof response.data);
        console.log('response.data keys:', Object.keys(response.data || {}));
        
        if (response.data?.data) {
          console.log('response.data.data type:', typeof response.data.data);
          console.log('response.data.data is array:', Array.isArray(response.data.data));
          
          if (Array.isArray(response.data.data) && response.data.data[0]) {
            console.log('First event sample:', response.data.data[0]);
            console.log('First event ID:', response.data.data[0].id);
            console.log('First event ID type:', typeof response.data.data[0].id);
          }
        }

        // EXTRACT PAGINATION META
        if (response.data?.meta) {
          totalPages = response.data.meta.totalPages || 1;
          totalItems = response.data.meta.total || 0;
          console.log(`Meta: page ${currentPage}/${totalPages}, total: ${totalItems}`);
        }

        // EXTRACT EVENTS
        let pageEvents: any[] = [];
        
        if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
          pageEvents = response.data.data.data;
          console.log('Found events in response.data.data.data');
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          pageEvents = response.data.data;
          console.log('Found events in response.data.data');
        } else if (Array.isArray(response.data)) {
          pageEvents = response.data;
          console.log('Found events in response.data');
        }

        console.log(`Page ${currentPage}: Found ${pageEvents.length} events`);
        allEvents = [...allEvents, ...pageEvents];
        
        currentPage++;
        
      } while (currentPage <= totalPages);

      console.log('\n TOTAL EVENTS FETCHED:', allEvents.length);
      console.log('EXPECTED TOTAL:', totalItems);

      if (allEvents.length === 0) {
        console.warn('No events found');
        setEvents([]);
        setFilteredEvents([]);
        return;
      }

      // MAP DỮ LIỆU
      const mappedEvents: Event[] = allEvents.map((apiEvent: any, index: number) => {
        console.log(`\n=== Mapping event ${index + 1} ===`);
        console.log('Raw apiEvent:', apiEvent);
        console.log('apiEvent.id:', apiEvent.id, 'type:', typeof apiEvent.id);
        
        // ✅ QUAN TRỌNG: CONVERT ID SANG STRING
        let eventId: string = '';
        
        if (apiEvent.id !== null && apiEvent.id !== undefined) {
          eventId = String(apiEvent.id).trim();
          console.log('✅ Converted Event ID:', eventId);
        }
        
        if (!eventId || eventId === 'undefined' || eventId === 'null') {
          console.error('Invalid event ID after conversion:', {
            rawId: apiEvent.id,
            convertedId: eventId,
            title: apiEvent.title,
          });
          return null;
        }
        
        const mappedStatus = normalizeStatus(apiEvent.status || 'PENDING');
        
        return {
          id: eventId,
          title: apiEvent.title || '',
          description: apiEvent.description || '',
          eventType: apiEvent.category || apiEvent.eventType || 'OTHER',
          status: mappedStatus,
          startDate: apiEvent.startTime || apiEvent.startDate || '',
          endDate: apiEvent.endTime || apiEvent.endDate || '',
          registrationDeadline: apiEvent.startTimeRegister || apiEvent.startTimeRegistration || apiEvent.registrationDeadline || '',
          maxParticipants: apiEvent.maxCapacity || apiEvent.maxParticipants || 0,
          currentParticipants: apiEvent.registeredCount || apiEvent.currentParticipants || 0,
          venueId: apiEvent.venueId || apiEvent.venue?.id || 0,
          venueName: apiEvent.venue?.name || apiEvent.venueName || 'Chưa xác định',
          campusId: apiEvent.venue?.campusId || apiEvent.campusId || 0,
          campusName: apiEvent.venue?.campus?.name || apiEvent.campusName || '',
          organizerId: apiEvent.organizerId || apiEvent.organizer?.id || 0,
          organizerName: apiEvent.organizer?.name || apiEvent.organizerName || '',
          requiresApproval: apiEvent.requiresApproval ?? true,
          isPublished: apiEvent.isPublished ?? (apiEvent.status === 'PUBLISHED'),
        };
      }).filter((event): event is Event => event !== null);

      console.log('\n✅ All mapped event IDs:', mappedEvents.map(e => `${e.id} (${e.title})`));
      
      setEvents(mappedEvents);
      setFilteredEvents(mappedEvents);
      
    } catch (error: any) {
      console.error('Error fetching events:', error);
      
      let errorMessage = 'Không thể tải danh sách sự kiện';
      
      if (error.response?.status === 404) {
        errorMessage = 'API endpoint không tồn tại. Vui lòng liên hệ admin.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.';
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền truy cập. Vui lòng kiểm tra role.';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('Filtering events...');
    console.log('Search query:', searchQuery);
    console.log('Status filter:', statusFilter);
    console.log('Total events:', events.length);

    let filtered = events;

    if (searchQuery.trim()) {
      filtered = filtered.filter(event =>
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(event => event.status === statusFilter);
      console.log('After status filter:', filtered.length);
    }

    console.log('Final filtered events:', filtered.length);
    setFilteredEvents(filtered);
    
    // ✅ RESET VỀ TRANG 1 KHI FILTER THAY ĐỔI
    setCurrentPage(1);
  }, [searchQuery, statusFilter, events]);

  // ✅ TÍNH TOÁN PAGINATION
  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEvents = filteredEvents.slice(startIndex, endIndex);

  // ✅ HÀM XỬ LÝ PAGINATION
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Đang xử lý' },
      APPROVED: { bg: 'bg-green-100', text: 'text-green-800', label: 'Đã duyệt' },
      CANCELED: { bg: 'bg-red-100', text: 'text-red-800', label: 'Bị từ chối' },
      COMPLETED: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Hoàn thành' },
    };

    const config = statusConfig[status] || statusConfig.PENDING;
    
    return (
      <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  const handleCreateEvent = () => {
    setShowTypeModal(true);
  };

  const handleSelectType = (type: "offline" | "online") => {
    setEventTypeToCreate(type);
    setShowTypeModal(false);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    console.log('📝 Editing event:', event);
    console.log('Event ID:', event.id);
    console.log('Event ID type:', typeof event.id);
    
    // ✅ VALIDATE STRING ID
    if (!event || !event.id || typeof event.id !== 'string' || event.id.trim() === '') {
      console.error('Invalid event object or missing ID');
      toast.error('Không thể chỉnh sửa sự kiện. Dữ liệu không hợp lệ.');
      return;
    }
    
    console.log('✅ Event validation passed');
    
    // ✅ Xác định loại sự kiện (online/offline) dựa vào venueId
    const eventType = event.venueId ? "offline" : "online";
    console.log('Event type detected:', eventType);
    
    setSelectedEvent(event);
    setEventTypeToCreate(eventType);
    setIsModalOpen(true);
  };

  const handleDeleteEvent = (event: Event) => {
    console.log('Requesting delete for event:', event);

    if (!event || !event.id || typeof event.id !== 'string') {
      console.error('Invalid event ID');
      toast.error('Không thể gửi yêu cầu xóa. Dữ liệu không hợp lệ.');
      return;
    }

    setDeleteModalState({
      isOpen: true,
      eventId: event.id, 
      eventTitle: event.title,
    });
  };

  const handleSubmitDeleteRequest = async (reason: string) => {
    if (!deleteModalState.eventId) {
      toast.error('Không tìm thấy ID sự kiện');
      return;
    }

    try {
      console.log('📤 Submitting cancel request:', {
        eventId: deleteModalState.eventId,
        reason,
      });

      // ✅ GỌI API requestCancelEvent - CHỈ TẠO REQUEST, KHÔNG ĐỔI STATUS
      const response = await eventService.requestCancelEvent({
        eventId: deleteModalState.eventId,
        data: {
          reason: reason.trim(),
        }
      });

      console.log('✅ Cancel request created:', response.data);

      toast.success('Đã gửi yêu cầu hủy sự kiện. Vui lòng chờ Admin phê duyệt.', {
        autoClose: 5000,
      });

      // ❌ KHÔNG CẬP NHẬT STATUS VỀ PENDING NỮA
      // setEvents((prev) =>
      //   prev.map((e) =>
      //     e.id === deleteModalState.eventId
      //       ? { ...e, status: 'PENDING' as EventStatus }
      //       : e
      //   )
      // );

      // Đóng modal
      setDeleteModalState({
        isOpen: false,
        eventId: null,
        eventTitle: '',
      });

      // Refresh lại danh sách (status vẫn giữ nguyên)
      await fetchEventsByOrganizer();
      
    } catch (error: any) {
      console.error('❌ Error submitting cancel request:', error);
      console.error('Error response:', error.response);
      
      let errorMessage = 'Không thể gửi yêu cầu hủy sự kiện';
      
      if (error.response?.status === 400) {
        const messages = error.response.data?.message;
        if (Array.isArray(messages)) {
          errorMessage = messages.join(', ');
        } else {
          errorMessage = messages || 'Yêu cầu không hợp lệ (sự kiện đã bị hủy/hoàn thành, hoặc đang có yêu cầu chờ duyệt)';
        }
      } else if (error.response?.status === 403) {
        errorMessage = 'Bạn không có quyền hủy sự kiện này. Chỉ organizer owner mới có thể yêu cầu hủy.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Không tìm thấy sự kiện';
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast.error(errorMessage, {
        autoClose: 5000,
      });
    }
  };

  const stats = [
    { label: 'Tổng sự kiện', value: events.length, color: 'text-blue-600' },
    { label: 'Đang xử lý', value: events.filter(e => e.status === 'PENDING').length, color: 'text-yellow-600' },
    { label: 'Đã duyệt', value: events.filter(e => e.status === 'APPROVED').length, color: 'text-green-600' },
    { label: 'Bị từ chối', value: events.filter(e => e.status === 'CANCELED').length, color: 'text-red-600' },
    { label: 'Hoàn thành', value: events.filter(e => e.status === 'COMPLETED').length, color: 'text-blue-600' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-linear-to-r from-orange-500 to-orange-600 rounded-2xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Quản lý Sự kiện</h1>
        <p className="text-orange-100">Tạo, chỉnh sửa và quản lý vòng đời sự kiện</p>
      </div>

        {/* Stats - COMMENTED OUT */}
        {/* <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <p className="text-sm text-gray-600 mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div> */}

      {/* Filters */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Tìm kiếm sự kiện..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'ALL')}
            className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
          >
            <option value="ALL">Tất cả trạng thái</option>
            <option value="PENDING">Đang xử lý</option>
            <option value="APPROVED">Đã duyệt</option>
            <option value="CANCELED">Bị từ chối</option>
            <option value="COMPLETED">Hoàn thành</option>
          </select>
          {/* Thay nút Tạo sự kiện mới */}
          <button
            onClick={handleCreateEvent}
            className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
          >
            <Plus size={20} />
            Tạo sự kiện mới
          </button>
        </div>
      </div>

      {/* Modal chọn loại sự kiện */}
      {showTypeModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 shadow-lg flex flex-col gap-4 min-w-[320px]">
            <h3 className="text-lg font-bold mb-2 text-gray-800">Bạn muốn tạo sự kiện nào?</h3>
            <button
              className="w-full px-4 py-3 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600"
              onClick={() => handleSelectType("offline")}
            >
              Sự kiện Offline
            </button>
            <button
              className="w-full px-4 py-3 bg-blue-500 text-white rounded-lg font-semibold hover:bg-blue-600"
              onClick={() => handleSelectType("online")}
            >
              Sự kiện Online
            </button>
            <button
              className="w-full px-4 py-2 mt-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setShowTypeModal(false)}
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sự kiện</h3>
            <p className="text-gray-600 mb-6">Bắt đầu bằng cách tạo sự kiện đầu tiên</p>
            <button
              onClick={handleCreateEvent}
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all font-semibold"
            >
              <Plus size={20} />
              Tạo sự kiện mới
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Sự kiện
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-36">
                      Thời gian
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-52">
                      Địa điểm
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40">
                      Người tham gia
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                      {/* Hành động */}
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {currentEvents.map((event, index) => (
                    <tr 
                      key={`event-${event.id}-${index}`}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      {/* Sự kiện */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="font-semibold text-gray-900 text-sm">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-500 line-clamp-2">
                            {event.description}
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(event.status)}
                      </td>

                      {/* Thời gian */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                          <Calendar size={16} className="text-orange-500 flex-shrink-0" />
                          <span className="whitespace-nowrap">
                            {new Date(event.startDate).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </span>
                        </div>
                      </td>

                      {/* Địa điểm */}
                      <td className="px-6 py-4">
                        <div className="flex items-start gap-2">
                          <MapPin size={16} className="text-gray-400 flex-shrink-0 mt-0.5" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-medium text-gray-900 truncate">
                              {event.venueName || 'Chưa xác định'}
                            </span>
                            {event.campusName && (
                              <span className="text-xs text-gray-500 truncate">
                                {event.campusName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Người tham gia */}
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Users size={16} className="text-gray-400 flex-shrink-0" />
                          <span className="text-sm font-medium text-gray-900">
                            {event.currentParticipants}/{event.maxParticipants}
                          </span>
                        </div>
                      </td>

                      {/* ✅ Hành động - SỬ DỤNG ActionDropdown */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center">
                          <ActionDropdown
                            actions={[
                              {
                                label: 'Xem chi tiết',
                                icon: Eye,
                                onClick: () => {
                                  console.group('🔍 CLICK XEM CHI TIẾT');
                                  console.log('1. Full event object:', event);
                                  console.log('2. Event ID:', event.id);
                                  console.log('3. Event ID type:', typeof event.id);
                                  console.log('4. Event Title:', event.title);
                                  console.log('5. Current URL:', window.location.href);
                                  
                                  if (!event.id) {
                                    console.error('❌ Event ID is missing!');
                                    toast.error('Không thể mở chi tiết sự kiện: Thiếu ID');
                                    console.groupEnd();
                                    return;
                                  }
                                  
                                  if (typeof event.id !== 'string' || event.id.trim() === '') {
                                    console.error('❌ Invalid Event ID:', event.id);
                                    toast.error('Không thể mở chi tiết sự kiện: ID không hợp lệ');
                                    console.groupEnd();
                                    return;
                                  }
                                  
                                  const targetUrl = `/organizer/events/${event.id}`;
                                  console.log('6. ✅ Target URL:', targetUrl);
                                  console.log('7. ✅ Navigating...');
                                  console.groupEnd();
                                  
                                  // ✅ SỬA: Dùng window.location.href (hoặc navigate nếu có useNavigate)
                                  window.location.href = targetUrl;
                                },
                              },
                              {
                                label: 'Chỉnh sửa',
                                icon: Edit,
                                onClick: () => handleEditEvent(event),
                              },
                              {
                                label: 'Xóa',
                                icon: Trash2,
                                onClick: () => handleDeleteEvent(event),
                                danger: true,
                              },
                            ]}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ✅ PAGINATION */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    {/* Hiển thị <span className="font-semibold">{startIndex + 1}</span> đến{' '}
                    <span className="font-semibold">{Math.min(endIndex, filteredEvents.length)}</span> trong tổng số{' '}
                    <span className="font-semibold">{filteredEvents.length}</span> sự kiện */}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300'
                      }`}
                    >
                      Trước
                    </button>

                    <div className="flex items-center gap-1">
                      {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                          {page === '...' ? (
                            <span className="px-3 py-2 text-gray-500">...</span>
                          ) : (
                            <button
                              onClick={() => handlePageChange(page as number)}
                              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                currentPage === page
                                  ? 'bg-orange-500 text-white'
                                  : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300'
                              }`}
                            >
                              {page}
                            </button>
                          )}
                        </React.Fragment>
                      ))}
                    </div>

                    <button
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 border border-gray-300'
                      }`}
                    >
                      Sau
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Event Form Modal */}
      {isModalOpen && eventTypeToCreate === "offline" && (
        <EventFormModal
          event={selectedEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setEventTypeToCreate(null);
          }}
          onSuccess={async (savedEvent) => {
            try {
              if (selectedEvent) {
                setEvents((prev) =>
                  prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
                );
                toast.success('Cập nhật sự kiện thành công!');
              } else {
                toast.success('Tạo sự kiện thành công!');
              }
              setIsModalOpen(false);
              setSelectedEvent(null);
              await fetchEventsByOrganizer();
            } catch (error) {
              console.error('Error in onSuccess:', error);
            }
          }}
        />
      )}
      {isModalOpen && eventTypeToCreate === "online" && (
        <EventFormModalOnline
          event={selectedEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setEventTypeToCreate(null);
          }}
          onSuccess={async (savedEvent) => {
            try {
              if (selectedEvent) {
                setEvents((prev) =>
                  prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
                );
                // toast.success('Cập nhật sự kiện thành công!');
              } else {
                // toast.success('Tạo sự kiện thành công!');
              }
              setIsModalOpen(false);
              setSelectedEvent(null);
              await fetchEventsByOrganizer();
            } catch (error) {
              console.error('Error in onSuccess:', error);
            }
          }}
        />
      )}

      {/* Delete Request Modal */}
      {deleteModalState.isOpen && (
        <DeleteRequestModal
          eventTitle={deleteModalState.eventTitle}
          onClose={() => setDeleteModalState({ isOpen: false, eventId: null, eventTitle: '' })}
          onSubmit={handleSubmitDeleteRequest}
        />
      )}
    </div>
  );
};

export default EventManagementPage;

