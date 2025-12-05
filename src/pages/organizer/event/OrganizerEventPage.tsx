import { useState } from 'react';
import { Plus, Edit, Trash2, Eye, Send, Ban } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Event, EventStatus } from '../../../types/Event';
import EventFormModal from '../../../components/organizer/event/EventFormModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Mock data để test UI/UX
const MOCK_EVENTS: Event[] = [
  {
    id: 1,
    title: 'Hội thảo Công nghệ AI & Machine Learning 2024',
    description: 'Sự kiện giới thiệu các công nghệ AI mới nhất và ứng dụng thực tế trong doanh nghiệp',
    eventType: 'CONFERENCE',
    status: 'APPROVED',
    startDate: '2024-12-15T09:00:00',
    endDate: '2024-12-15T17:00:00',
    registrationDeadline: '2024-12-10T23:59:59',
    maxParticipants: 200,
    currentParticipants: 156,
    venueId: 1,
    venueName: 'Hội trường A',
    campusId: 1,
    campusName: 'Campus HCM',
    organizerId: 1,
    organizerName: 'FPT Event Club',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    requiresApproval: true,
    isPublished: true,
  },
  {
    id: 2,
    title: 'Workshop: Lập trình Mobile với React Native',
    description: 'Workshop thực hành xây dựng ứng dụng mobile đa nền tảng',
    eventType: 'WORKSHOP',
    status: 'PENDING',
    startDate: '2024-12-20T14:00:00',
    endDate: '2024-12-20T17:00:00',
    registrationDeadline: '2024-12-18T23:59:59',
    maxParticipants: 50,
    currentParticipants: 23,
    venueId: 2,
    venueName: 'Phòng Lab B',
    organizerId: 1,
    organizerName: 'FPT Event Club',
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400',
    requiresApproval: true,
    isPublished: false,
  },
  {
    id: 3,
    title: 'Cuộc thi Hackathon: Code for Future',
    description: 'Cuộc thi lập trình 24h với chủ đề phát triển giải pháp cho tương lai',
    eventType: 'COMPETITION',
    status: 'DRAFT',
    startDate: '2025-01-10T08:00:00',
    endDate: '2025-01-11T08:00:00',
    registrationDeadline: '2025-01-05T23:59:59',
    maxParticipants: 100,
    currentParticipants: 0,
    organizerId: 1,
    organizerName: 'FPT Event Club',
    imageUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=400',
    requiresApproval: true,
    isPublished: false,
  },
  {
    id: 4,
    title: 'Ngày hội Văn hóa FPT',
    description: 'Sự kiện văn hóa với nhiều hoạt động giải trí và biểu diễn nghệ thuật',
    eventType: 'CULTURAL',
    status: 'COMPLETED',
    startDate: '2024-11-20T08:00:00',
    endDate: '2024-11-20T20:00:00',
    registrationDeadline: '2024-11-15T23:59:59',
    maxParticipants: 500,
    currentParticipants: 487,
    venueId: 3,
    venueName: 'Sân vận động',
    organizerId: 1,
    organizerName: 'FPT Event Club',
    imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=400',
    requiresApproval: true,
    isPublished: true,
  },
];

const OrganizerEventPage = () => {
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    eventId: number | null;
    action: 'delete' | 'submit' | 'cancel' | null;
  }>({ isOpen: false, eventId: null, action: null });

  const handleCreate = () => {
    setSelectedEvent(null);
    setIsModalOpen(true);
  };

  const handleEdit = (event: Event) => {
    if (event.status !== 'DRAFT' && event.status !== 'REJECTED') {
      toast.warning('Chỉ có thể chỉnh sửa sự kiện ở trạng thái Nháp hoặc Bị từ chối');
      return;
    }
    setSelectedEvent(event);
    setIsModalOpen(true);
  };

  const handleView = (event: Event) => {
    // TODO: Navigate to event detail page
    toast.info(`Xem chi tiết sự kiện: ${event.title}`);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, eventId: id, action: 'delete' });
  };

  const handleSubmitForApproval = (id: number) => {
    setConfirmModal({ isOpen: true, eventId: id, action: 'submit' });
  };

  const handleCancelEvent = (id: number) => {
    setConfirmModal({ isOpen: true, eventId: id, action: 'cancel' });
  };

  const confirmAction = () => {
    const { eventId, action } = confirmModal;
    if (!eventId || !action) return;

    switch (action) {
      case 'delete':
        setEvents(events.filter((e) => e.id !== eventId));
        toast.success('Xóa sự kiện thành công!');
        break;
      case 'submit':
        setEvents(
          events.map((e) =>
            e.id === eventId
              ? { ...e, status: 'PENDING' as EventStatus }
              : e
          )
        );
        toast.success('Gửi yêu cầu phê duyệt thành công!');
        break;
      case 'cancel':
        setEvents(
          events.map((e) =>
            e.id === eventId
              ? { ...e, status: 'CANCELLED' as EventStatus }
              : e
          )
        );
        toast.success('Hủy sự kiện thành công!');
        break;
    }

    setConfirmModal({ isOpen: false, eventId: null, action: null });
  };

  const cancelAction = () => {
    setConfirmModal({ isOpen: false, eventId: null, action: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleModalSuccess = (newEvent: Event) => {
    if (selectedEvent) {
      setEvents(events.map((e) => (e.id === newEvent.id ? newEvent : e)));
      toast.success('Cập nhật sự kiện thành công!');
    } else {
      setEvents([...events, { ...newEvent, id: events.length + 1 }]);
      toast.success('Tạo sự kiện thành công!');
    }
    handleModalClose();
  };

  const getStatusBadge = (status: EventStatus) => {
    const statusConfig = {
      DRAFT: { label: 'Nháp', class: 'bg-gray-100 text-gray-800' },
      PENDING: { label: 'Chờ duyệt', class: 'bg-yellow-100 text-yellow-800' },
      APPROVED: { label: 'Đã duyệt', class: 'bg-green-100 text-green-800' },
      REJECTED: { label: 'Bị từ chối', class: 'bg-red-100 text-red-800' },
      CANCELLED: { label: 'Đã hủy', class: 'bg-orange-100 text-orange-800' },
      COMPLETED: { label: 'Hoàn thành', class: 'bg-blue-100 text-blue-800' },
    };

    const config = statusConfig[status] || statusConfig.DRAFT;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  const getEventTypeBadge = (type: string) => {
    const typeConfig: Record<string, string> = {
      CONFERENCE: 'Hội nghị',
      WORKSHOP: 'Workshop',
      SEMINAR: 'Hội thảo',
      COMPETITION: 'Cuộc thi',
      CULTURAL: 'Văn hóa',
      SPORTS: 'Thể thao',
      OTHER: 'Khác',
    };

    return typeConfig[type] || type;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getConfirmModalContent = () => {
    const action = confirmModal.action;
    if (action === 'delete') {
      return {
        title: 'Xác nhận xóa',
        message: 'Bạn có chắc chắn muốn xóa sự kiện này? Hành động này không thể hoàn tác.',
        confirmText: 'Xóa',
        type: 'danger' as const,
      };
    } else if (action === 'submit') {
      return {
        title: 'Gửi phê duyệt',
        message: 'Bạn có chắc chắn muốn gửi sự kiện này để admin phê duyệt?',
        confirmText: 'Gửi',
        type: 'warning' as const,
      };
    } else if (action === 'cancel') {
      return {
        title: 'Hủy sự kiện',
        message: 'Bạn có chắc chắn muốn hủy sự kiện này? Người tham gia sẽ được thông báo.',
        confirmText: 'Hủy sự kiện',
        type: 'danger' as const,
      };
    }
    return {
      title: '',
      message: '',
      confirmText: '',
      type: 'warning' as const,
    };
  };

  const modalContent = getConfirmModalContent();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Sự kiện</h1>
          <p className="text-gray-600 mt-1">
            Quản lý các sự kiện của bạn
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Tạo Sự kiện
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Sự kiện
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thời gian
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tham gia
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {events.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có sự kiện nào. Nhấn "Tạo Sự kiện" để bắt đầu.
                  </td>
                </tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{event.id}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {event.imageUrl ? (
                          <img
                            src={event.imageUrl}
                            alt={event.title}
                            className="w-16 h-16 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No image</span>
                          </div>
                        )}
                        <div className="max-w-xs">
                          <div className="text-sm font-medium text-gray-900 line-clamp-2">
                            {event.title}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {event.venueName || 'Chưa có địa điểm'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-900">
                        {getEventTypeBadge(event.eventType)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(event.startDate)}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Hạn: {formatDate(event.registrationDeadline)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {event.currentParticipants}/{event.maxParticipants}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${(event.currentParticipants / event.maxParticipants) * 100}%`,
                          }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleView(event)}
                          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        
                        {(event.status === 'DRAFT' || event.status === 'REJECTED') && (
                          <>
                            <button
                              onClick={() => handleEdit(event)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Chỉnh sửa"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => handleSubmitForApproval(event.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Gửi phê duyệt"
                            >
                              <Send size={18} />
                            </button>
                          </>
                        )}

                        {(event.status === 'APPROVED' || event.status === 'PENDING') && (
                          <button
                            onClick={() => handleCancelEvent(event.id)}
                            className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Hủy sự kiện"
                          >
                            <Ban size={18} />
                          </button>
                        )}

                        {(event.status === 'DRAFT' || event.status === 'REJECTED') && (
                          <button
                            onClick={() => handleDelete(event.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
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
      {events.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{events.length}</span> sự kiện
        </div>
      )}

      {/* Event Form Modal */}
      {isModalOpen && (
        <EventFormModal
          event={selectedEvent}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        cancelText="Hủy"
        type={modalContent.type}
        onConfirm={confirmAction}
        onCancel={cancelAction}
      />
    </div>
  );
};

export default OrganizerEventPage;
