import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Send,
  Eye,
  Copy,
  Calendar,
  Users,
  MapPin,
  Clock,
} from 'lucide-react';
import type { Event, EventStatus } from '../../../types/Event';
import EventFormModal from '../../../components/organizer/event/EventFormModal';
import { organizerService } from '../../../services';
import { toast } from 'react-toastify';

const EventManagementPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch events on mount
  useEffect(() => {
    fetchEventsByOrganizer();
  }, []);

  const fetchEventsByOrganizer = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Fetching events...');
      console.log('Token:', localStorage.getItem('token'));
      console.log('User:', localStorage.getItem('user'));
      
      const response = await organizerService.getOrganizerEvents();
      
      console.log('Full Response:', response);
      console.log('Response status:', response.status);
      console.log('Response data:', response.data);
      console.log('Response data.data:', response.data?.data);
      
      if (response && response.data && response.data.data) {
        const apiData = response.data.data;
        console.log('Events data:', apiData);
        
        // Check if apiData is array or object
        let eventsArray: any[] = [];
        
        if (Array.isArray(apiData.data)) {
          eventsArray = apiData.data;
        } else if (Array.isArray(apiData)) {
          eventsArray = apiData;
        } else {
          console.error('Unexpected data structure:', apiData);
          toast.error('Cấu trúc dữ liệu không đúng');
          setEvents([]);
          setFilteredEvents([]);
          return;
        }

        if (eventsArray.length === 0) {
          console.log('No events found');
          setEvents([]);
          setFilteredEvents([]);
          return;
        }

        // Map response data to Event type
        const mappedEvents: Event[] = eventsArray.map((event: any) => {
          console.log('Mapping event:', event);
          console.log('Event status from API:', event.status); // THÊM dòng này
          return {
            id: parseInt(event.id) || event.id,
            title: event.title || 'Untitled Event',
            description: event.description || '',
            eventType: event.eventType || 'WORKSHOP',
            status: (event.status || 'DRAFT') as EventStatus,
            startDate: event.startTime || event.startDate,
            endDate: event.endTime || event.endDate,
            registrationDeadline: event.endTimeRegistration || event.registrationDeadline,
            maxParticipants: event.maxCapacity || 0,
            currentParticipants: event.registeredCount || 0,
            venueId: event.venueId,
            venueName: event.venue?.name || 'Chưa có',
            campusId: event.venue?.campusId,
            campusName: event.venue?.campus?.name || '',
            organizerId: event.organizerId,
            organizerName: event.organizer?.name || '',
            requiresApproval: true,
            isPublished: event.status === 'PUBLISHED',
          };
        });

        console.log('Mapped events:', mappedEvents);
        setEvents(mappedEvents);
        setFilteredEvents(mappedEvents);
      } else {
        console.error('Invalid response structure:', response);
        toast.error('Không thể tải dữ liệu sự kiện');
        setEvents([]);
        setFilteredEvents([]);
      }
    } catch (error: any) {
      console.log('❌ Error occurred');
      console.log('Error:', error);
      console.log('Error response:', error.response);
      console.log('Error status:', error.response?.status);
      console.log('Error data:', error.response?.data);
      console.log('Error message:', error.message);
      
      // Chi tiết error message
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
        // Redirect to login
        window.location.href = '/login';
      } else if (error.response?.status === 403) {
        toast.error('Bạn không có quyền truy cập.');
      } else if (error.response?.status === 404) {
        toast.error('Không tìm thấy API endpoint.');
      } else {
        toast.error(error.response?.data?.message || 'Đã xảy ra lỗi khi tải sự kiện.');
      }
      
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((event) => event.status === statusFilter);
    }

    setFilteredEvents(filtered);
  }, [searchQuery, statusFilter, events]);

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig: Record<
      string, // ĐỔI từ EventStatus sang string
      { label: string; className: string }
    > = {
      DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
      PENDING: {
        label: 'Chờ duyệt',
        className: 'bg-yellow-100 text-yellow-700',
      },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      CANCELLED: { label: 'Đã hủy', className: 'bg-gray-100 text-gray-700' },
      COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-blue-100 text-blue-700',
      },
      // THÊM CÁC STATUS KHÁC TỪ BACKEND
      PUBLISHED: {
        label: 'Đã xuất bản',
        className: 'bg-blue-100 text-blue-700',
      },
      CANCELED: { // backend có thể dùng CANCELED thay vì CANCELLED
        label: 'Đã hủy',
        className: 'bg-gray-100 text-gray-700',
      },
    };

    // ✅ FALLBACK nếu status không tồn tại
    const config = statusConfig[status] || {
      label: status || 'Không xác định',
      className: 'bg-gray-100 text-gray-700',
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}
      >
        {config.label}
      </span>
    );
  };

  const handleCreateEvent = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleSubmitForApproval = (eventId: number) => {
    // API call to submit event for approval
    console.log('Submit for approval:', eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'PENDING' as EventStatus } : e))
    );
  };

  const handlePublishEvent = (eventId: number) => {
    // API call to publish event
    console.log('Publish event:', eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isPublished: true } : e))
    );
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
    }
  };

  const handleDuplicateEvent = (event: Event) => {
    const newEvent = {
      ...event,
      id: Math.max(...events.map((e) => e.id)) + 1,
      title: `${event.title} (Copy)`,
      status: 'DRAFT' as EventStatus,
      currentParticipants: 0,
      isPublished: false,
    };
    setEvents((prev) => [...prev, newEvent]);
  };

  const stats = {
    total: events.length,
    draft: events.filter((e) => e.status === 'DRAFT').length,
    pending: events.filter((e) => e.status === 'PENDING').length,
    approved: events.filter((e) => e.status === 'APPROVED').length,
    published: events.filter((e) => e.isPublished).length,
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27125] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sự kiện</h1>
          <p className="text-gray-600 mt-1">
            Tạo, chỉnh sửa và quản lý vòng đời sự kiện
          </p>
        </div>
        <button
          onClick={handleCreateEvent}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors"
        >
          <Plus size={20} />
          Tạo sự kiện mới
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng sự kiện</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Nháp</div>
          <div className="text-2xl font-bold text-gray-600 mt-1">{stats.draft}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Chờ duyệt</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{stats.pending}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đã duyệt</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.approved}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đã xuất bản</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.published}</div>
        </div>
      </div>

      {/* Filters */}
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
                placeholder="Tìm kiếm sự kiện..."
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
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'ALL')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="DRAFT">Nháp</option>
              <option value="PENDING">Chờ duyệt</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Từ chối</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sự kiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thời gian
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Địa điểm
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Người tham gia
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Xuất bản
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <Calendar className="mx-auto text-gray-400 mb-3" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Không tìm thấy sự kiện
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {searchQuery || statusFilter !== 'ALL'
                        ? 'Thử điều chỉnh bộ lọc của bạn'
                        : 'Bắt đầu bằng cách tạo sự kiện đầu tiên'}
                    </p>
                    {!searchQuery && statusFilter === 'ALL' && (
                      <button
                        onClick={handleCreateEvent}
                        className="inline-flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors"
                      >
                        <Plus size={20} />
                        Tạo sự kiện mới
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-red-500 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="text-white" size={24} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-gray-900 line-clamp-1">
                            {event.title}
                          </h3>
                          <p className="text-xs text-gray-600 line-clamp-1 mt-0.5">
                            {event.description}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <Calendar size={14} className="text-gray-400" />
                          {new Date(event.startDate).toLocaleDateString('vi-VN')}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-600">
                          <Clock size={12} className="text-gray-400" />
                          {new Date(event.startDate).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {event.venueName ? (
                        <div className="flex items-center gap-2 text-sm text-gray-900">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="line-clamp-1">{event.venueName}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Chưa có</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {event.currentParticipants}/{event.maxParticipants}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className="bg-[#F27125] h-1.5 rounded-full"
                          style={{
                            width: `${
                              (event.currentParticipants / event.maxParticipants) * 100
                            }%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {event.isPublished ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                          <Eye size={12} />
                          Đã xuất bản
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">Chưa</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                          title="Chỉnh sửa"
                        >
                          <Edit size={16} />
                        </button>
                        {event.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmitForApproval(event.id)}
                            className="text-green-600 hover:text-green-800 text-sm font-medium"
                            title="Gửi phê duyệt"
                          >
                            <Send size={16} />
                          </button>
                        )}
                        {event.status === 'APPROVED' && !event.isPublished && (
                          <button
                            onClick={() => handlePublishEvent(event.id)}
                            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
                            title="Xuất bản"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicateEvent(event)}
                          className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                          title="Nhân bản"
                        >
                          <Copy size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-800 text-sm font-medium"
                          title="Xóa"
                        >
                          <Trash2 size={16} />
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

      {/* Event Form Modal */}
      {isModalOpen && (
        <EventFormModal
          event={selectedEvent}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
          }}
          onSuccess={(savedEvent: Event) => {
            if (selectedEvent) {
              setEvents((prev) =>
                prev.map((e) => (e.id === savedEvent.id ? savedEvent : e))
              );
            } else {
              setEvents((prev) => [...prev, savedEvent]);
            }
            setIsModalOpen(false);
            setSelectedEvent(null);
            fetchEventsByOrganizer(); // Refresh data
          }}
        />
      )}
    </div>
  );
};

export default EventManagementPage;
