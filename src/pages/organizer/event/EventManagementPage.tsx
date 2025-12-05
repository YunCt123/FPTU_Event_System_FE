import { useState, useEffect } from 'react';
import {
  Plus,
  Filter,
  Search,
  MoreVertical,
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

const EventManagementPage = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<EventStatus | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockEvents: Event[] = [
      {
        id: 1,
        title: 'Workshop: AI & Machine Learning',
        description: 'Hội thảo về AI và Machine Learning cho sinh viên',
        eventType: 'WORKSHOP',
        status: 'APPROVED',
        startDate: '2024-12-10T09:00:00',
        endDate: '2024-12-10T17:00:00',
        registrationDeadline: '2024-12-08T23:59:59',
        maxParticipants: 100,
        currentParticipants: 85,
        venueId: 1,
        venueName: 'Hội trường A',
        campusId: 1,
        campusName: 'FPT Hà Nội',
        organizerId: 1,
        organizerName: 'CLB AI FPT',
        requiresApproval: true,
        isPublished: true,
      },
      {
        id: 2,
        title: 'Tech Conference 2024',
        description: 'Hội nghị công nghệ thường niên',
        eventType: 'CONFERENCE',
        status: 'PENDING',
        startDate: '2024-12-15T08:00:00',
        endDate: '2024-12-16T18:00:00',
        registrationDeadline: '2024-12-12T23:59:59',
        maxParticipants: 200,
        currentParticipants: 0,
        campusId: 1,
        campusName: 'FPT Hà Nội',
        organizerId: 1,
        requiresApproval: true,
        isPublished: false,
      },
      {
        id: 3,
        title: 'Football Tournament 2024',
        description: 'Giải bóng đá sinh viên',
        eventType: 'SPORTS',
        status: 'DRAFT',
        startDate: '2024-12-20T14:00:00',
        endDate: '2024-12-20T18:00:00',
        registrationDeadline: '2024-12-18T23:59:59',
        maxParticipants: 150,
        currentParticipants: 0,
        campusId: 1,
        organizerId: 1,
        requiresApproval: true,
        isPublished: false,
      },
    ];
    setEvents(mockEvents);
    setFilteredEvents(mockEvents);
  }, []);

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
      EventStatus,
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
    };

    const config = statusConfig[status];
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
    setActionMenuOpen(null);
  };

  const handleSubmitForApproval = (eventId: number) => {
    // API call to submit event for approval
    console.log('Submit for approval:', eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, status: 'PENDING' as EventStatus } : e))
    );
    setActionMenuOpen(null);
  };

  const handlePublishEvent = (eventId: number) => {
    // API call to publish event
    console.log('Publish event:', eventId);
    setEvents((prev) =>
      prev.map((e) => (e.id === eventId ? { ...e, isPublished: true } : e))
    );
    setActionMenuOpen(null);
  };

  const handleDeleteEvent = (eventId: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sự kiện này?')) {
      setEvents((prev) => prev.filter((e) => e.id !== eventId));
      setActionMenuOpen(null);
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
    setActionMenuOpen(null);
  };

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

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
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
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Event Image */}
              <div className="h-40 bg-linear from-orange-400 to-red-500 flex items-center justify-center">
                {event.imageUrl ? (
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Calendar className="text-white" size={48} />
                )}
              </div>

              {/* Event Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setActionMenuOpen(
                          actionMenuOpen === event.id ? null : event.id
                        )
                      }
                      className="p-1 hover:bg-gray-100 rounded-lg"
                    >
                      <MoreVertical size={20} className="text-gray-600" />
                    </button>
                    {actionMenuOpen === event.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Edit size={16} />
                          Chỉnh sửa
                        </button>
                        {event.status === 'DRAFT' && (
                          <button
                            onClick={() => handleSubmitForApproval(event.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Send size={16} />
                            Gửi phê duyệt
                          </button>
                        )}
                        {event.status === 'APPROVED' && !event.isPublished && (
                          <button
                            onClick={() => handlePublishEvent(event.id)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Eye size={16} />
                            Xuất bản
                          </button>
                        )}
                        <button
                          onClick={() => handleDuplicateEvent(event)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          <Copy size={16} />
                          Nhân bản
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <Trash2 size={16} />
                          Xóa
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mb-4">{getStatusBadge(event.status)}</div>

                <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                  {event.description}
                </p>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-400" />
                    <span>
                      {new Date(event.startDate).toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-400" />
                    <span>
                      {new Date(event.startDate).toLocaleTimeString('vi-VN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  {event.venueName && (
                    <div className="flex items-center gap-2">
                      <MapPin size={16} className="text-gray-400" />
                      <span>{event.venueName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Users size={16} className="text-gray-400" />
                    <span>
                      {event.currentParticipants}/{event.maxParticipants} người
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5 ml-2">
                      <div
                        className="bg-[#F27125] h-1.5 rounded-full"
                        style={{
                          width: `${
                            (event.currentParticipants / event.maxParticipants) *
                            100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <button
                    onClick={() =>
                      (window.location.href = `/organizer/events/${event.id}`)
                    }
                    className="w-full bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

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
          }}
        />
      )}
    </div>
  );
};

export default EventManagementPage;
