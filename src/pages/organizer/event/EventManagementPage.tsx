import React, { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  Edit,
  Trash2,
  Send,
  Eye,
  Calendar,
  Users,
  MapPin,
} from 'lucide-react';
import type { Event, EventStatus } from '../../../types/Event';
import EventFormModal from '../../../components/organizer/event/EventFormModal';
import DeleteRequestModal from '../../../components/organizer/event/DeleteRequestModal';
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
  const [deleteModalState, setDeleteModalState] = useState<{
    isOpen: boolean;
    eventId: number | null;
    eventTitle: string;
  }>({
    isOpen: false,
    eventId: null,
    eventTitle: '',
  });

  // Fetch events on mount
  useEffect(() => {
    fetchEventsByOrganizer();
  }, []);

  // Thêm hàm normalize status
  const normalizeStatus = (status: string): EventStatus => {
    const statusMap: Record<string, EventStatus> = {
      'PENDING': 'PENDING',
      'APPROVED': 'APPROVED',
      'REJECTED': 'CANCELED',
      'CANCELED': 'CANCELED',
      'COMPLETED': 'COMPLETED',
      // Map các status khác từ backend
      'PUBLISHED': 'APPROVED', // Published coi như Approved
      'CANCELLED': 'CANCELED', // Cancelled coi như Canceled
    };
    
    return statusMap[status.toUpperCase()] || 'PENDING'; // Default to PENDING instead of DRAFT
  };

  const fetchEventsByOrganizer = async () => {
    setIsLoading(true);
    try {
      console.log('📡 Fetching events...');
      
      const response = await organizerService.getOrganizerEvents();
      
      if (response && response.data && response.data.data) {
        const apiData = response.data.data;
        console.log('Events data:', apiData);
        
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
          const originalStatus = event.status || 'DRAFT';
          const normalizedStatus = normalizeStatus(originalStatus);
          
          console.log(`Event: ${event.title}, Original Status: ${originalStatus}, Normalized: ${normalizedStatus}`);
          
          return {
            id: parseInt(event.id) || event.id,
            title: event.title || 'Untitled Event',
            description: event.description || '',
            eventType: event.eventType || 'WORKSHOP',
            status: normalizedStatus, // SỬ DỤNG NORMALIZED STATUS
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
        console.log('Status distribution:', {
          PENDING: mappedEvents.filter(e => e.status === 'PENDING').length,
          APPROVED: mappedEvents.filter(e => e.status === 'APPROVED').length,
          CANCELED: mappedEvents.filter(e => e.status === 'CANCELED').length,
          COMPLETED: mappedEvents.filter(e => e.status === 'COMPLETED').length,
        });
        
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
      
      if (error.response?.status === 401) {
        toast.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
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
    console.log('🔍 Filtering events...');
    console.log('Search query:', searchQuery);
    console.log('Status filter:', statusFilter);
    console.log('Total events:', events.length);
    
    let filtered = events;

    if (searchQuery) {
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
      console.log('After search filter:', filtered.length);
    }

    if (statusFilter !== 'ALL') {
      console.log('Filtering by status:', statusFilter);
      filtered = filtered.filter((event) => {
        console.log(`Event "${event.title}" status: ${event.status}, matches: ${event.status === statusFilter}`);
        return event.status === statusFilter;
      });
      console.log('After status filter:', filtered.length);
    }

    console.log('Final filtered events:', filtered.length);
    setFilteredEvents(filtered);
  }, [searchQuery, statusFilter, events]);

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig: Record<
      string,
      { label: string; className: string }
    > = {
      PENDING: {
        label: 'Đang xử lý',
        className: 'bg-yellow-100 text-yellow-700',
      },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      CANCELED: { label: 'Bị từ chối', className: 'bg-red-100 text-red-700' },
      COMPLETED: {
        label: 'Hoàn thành',
        className: 'bg-blue-100 text-blue-700',
      },
    };

    const config = statusConfig[status] || {
      label: status || 'Không xác định',
      className: 'bg-gray-100 text-gray-700',
    };

    return (
      <span
        className={`inline-flex items-center justify-center px-3 py-1.5 text-xs font-semibold rounded-full min-w-[100px] ${config.className}`}
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
    console.log('=== EDIT EVENT ===');
    console.log('Event data:', event);
    console.log('Event type:', typeof event);
    console.log('Event keys:', Object.keys(event));
    
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

  const handleDeleteEvent = (eventId: number, eventTitle: string) => {
    setDeleteModalState({
      isOpen: true,
      eventId,
      eventTitle,
    });
  };

  const handleSubmitDeleteRequest = async (eventId: number, reason: string) => {
    try {
      console.log('Submitting delete request:', { eventId, reason });
      
      // TODO: Call API để gửi yêu cầu xóa
      // await organizerService.requestDeleteEvent(eventId, reason);
      
      toast.success('Đã gửi yêu cầu xóa sự kiện. Admin sẽ xem xét và phê duyệt.');
      
      // Close modal
      setDeleteModalState({
        isOpen: false,
        eventId: null,
        eventTitle: '',
      });
      
      // Optionally refresh data
      // fetchEventsByOrganizer();
    } catch (error: any) {
      console.error('Error submitting delete request:', error);
      toast.error('Đã xảy ra lỗi khi gửi yêu cầu xóa.');
    }
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
          <div className="text-2xl font-bold text-gray-900 mt-1">{events.length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đang xử lý</div>
          <div className="text-2xl font-bold text-yellow-600 mt-1">{events.filter((e) => e.status === 'PENDING').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Đã duyệt</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{events.filter((e) => e.status === 'APPROVED').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Bị từ chối</div>
          <div className="text-2xl font-bold text-red-600 mt-1">{events.filter((e) => e.status === 'CANCELED').length}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Hoàn thành</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{events.filter((e) => e.status === 'COMPLETED').length}</div>
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

          {/* Status Filter - Cập nhật dropdown */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as EventStatus | 'ALL')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
            >
              <option value="ALL">Tất cả trạng thái</option>
              {/* <option value="DRAFT">Nháp</option> */}
              <option value="PENDING">Đang xử lý</option>
              <option value="APPROVED">Đã duyệt</option>
              <option value="REJECTED">Bị từ chối</option>
              <option value="COMPLETED">Hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b-2 border-gray-300">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Sự kiện
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide min-w-[140px]">
                  Địa điểm
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">
                  Người tham gia
                </th>
                <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">
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
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                          <Calendar className="text-white" size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-bold text-gray-900 leading-tight mb-1">
                            {event.title}
                          </h3>
                          {/* <p className="text-xs text-gray-600 line-clamp-1">
                            {event.description}
                          </p> */}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle text-center">
                      {getStatusBadge(event.status)}
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col items-center gap-1.5">
                        <div className="flex items-center gap-2">
                          <Calendar size={14} className="text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">{new Date(event.startDate).toLocaleDateString('vi-VN')}</span>
                        </div>
                        {/* <div className="flex items-center gap-2">
                          <Clock size={13} className="text-orange-500 flex-shrink-0" />
                          <span className="text-xs font-medium text-gray-600">{new Date(event.startDate).toLocaleTimeString('vi-VN', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}</span>
                        </div> */}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex justify-center min-w-[140px]">
                        {event.venueName ? (
                          <div className="flex items-start gap-2">
                            <div className="space-y-0.5">
                              <div className="text-sm font-bold text-gray-900 whitespace-nowrap">
                                {event.venueName}
                              </div>
                              {event.campusName && (
                                <div className="text-xs text-gray-600 font-medium whitespace-nowrap">
                                 {event.campusName}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-gray-400">
                            <MapPin size={14} className="flex-shrink-0" />
                            <span className="text-sm italic whitespace-nowrap">Chưa có địa điểm</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 align-middle">
                      <div className="flex flex-col items-center gap-1.5 max-w-[150px] mx-auto">
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-orange-500 flex-shrink-0" />
                          <span className="text-sm font-bold text-gray-900">
                            {event.currentParticipants}
                          </span>
                          <span className="text-xs text-gray-600 font-medium">
                            / {event.maxParticipants}
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (event.currentParticipants / event.maxParticipants) * 100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                        <div className="text-xs text-gray-600 font-medium">
                          {event.maxParticipants - event.currentParticipants > 0 
                            ? `Còn ${event.maxParticipants - event.currentParticipants} chỗ`
                            : 'Đã đầy'}
                        </div>
                      </div>
                    </td>
                    {/* <td className="px-6 py-4">
                      <div className="flex items-center justify-center">
                        {event.isPublished ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full bg-gradient-to-r from-blue-100 to-blue-50 text-blue-700 border border-blue-200">
                            <Eye size={14} />
                            Đã xuất bản
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-gray-50 text-gray-500 border border-gray-200">
                            <Eye size={14} className="opacity-50" />
                            Chưa xuất bản
                          </span>
                        )}
                      </div>
                    </td> */}
                    <td className="px-6 py-4 align-middle">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} 
                        />
                        </button>
                        {/* {event.status === 'PENDING' && (
                          <button
                            onClick={() => handleSubmitForApproval(event.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Gửi phê duyệt"
                          >
                            <Send size={18} />
                          </button>
                        )} */}
                        {event.status === 'APPROVED' && !event.isPublished && (
                          <button
                            onClick={() => handlePublishEvent(event.id)}
                            className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                            title="Xuất bản"
                          >
                            <Eye size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteEvent(event.id, event.title)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
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
        <ErrorBoundary>
          <EventFormModal
            event={selectedEvent}
            onClose={() => {
              setIsModalOpen(false);
              setSelectedEvent(null);
            }}
            onSuccess={async (savedEvent: Event) => {
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
                
                // Refresh danh sách events sau khi tạo/cập nhật thành công
                await fetchEventsByOrganizer();
              } catch (error) {
                console.error('Error in onSuccess:', error);
              }
            }}
          />
        </ErrorBoundary>
      )}

      {/* Delete Request Modal */}
      {deleteModalState.isOpen && deleteModalState.eventId && (
        <DeleteRequestModal
          eventTitle={deleteModalState.eventTitle}
          eventId={deleteModalState.eventId}
          onClose={() => setDeleteModalState({
            isOpen: false,
            eventId: null,
            eventTitle: '',
          })}
          onSubmit={handleSubmitDeleteRequest}
        />
      )}

      {/* Debug Filter Button - XÓA HOẶC COMMENT SAU KHI DONE */}
      {/* <button 
        onClick={() => {
          console.log('=== DEBUG FILTER ===');
          console.log('All events:', events);
          console.log('Filtered events:', filteredEvents);
          console.log('Status filter:', statusFilter);
          console.log('Events by status:');
          ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'].forEach(status => {
            const count = events.filter(e => e.status === status).length;
            console.log(`  ${status}: ${count} events`);
          });
        }}
        className="px-4 py-2 bg-gray-200 rounded"
      >
        Debug Filter
      </button> */}
    </div>
  );
};

export default EventManagementPage;

// Tạo Error Boundary component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('EventFormModal Error:', error, errorInfo);
    toast.error('Có lỗi xảy ra khi mở form chỉnh sửa');
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md">
            <h2 className="text-xl font-bold text-red-600 mb-2">Lỗi</h2>
            <p className="text-gray-700 mb-4">
              Không thể mở form chỉnh sửa. Vui lòng thử lại.
            </p>
            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
              {JSON.stringify(this.state.error, null, 2)}
            </pre>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
