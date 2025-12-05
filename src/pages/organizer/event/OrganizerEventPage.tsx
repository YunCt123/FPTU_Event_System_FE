import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Clock,
  Edit,
  Trash2,
  Send,
  Eye,
  Download,
  UserPlus,
  Grid,
} from 'lucide-react';
import type { Event } from '../../../types/Event';


const OrganizerEventPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockEvent: Event = {
      id: parseInt(id || '1'),
      title: 'Workshop: AI & Machine Learning',
      description: 'Hội thảo chuyên sâu về AI và Machine Learning cho sinh viên FPT',
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
    };

    setTimeout(() => {
      setEvent(mockEvent);
      setLoading(false);
    }, 500);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27125]"></div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Không tìm thấy sự kiện</h2>
        <button
          onClick={() => navigate('/organizer/events')}
          className="mt-4 text-[#F27125] hover:underline"
        >
          Quay lại danh sách
        </button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-700' },
    };

    const config = statusConfig[status];
    return (
      <span className={`px-3 py-1 text-sm font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/organizer/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-gray-600 mt-1">Chi tiết và quản lý sự kiện</p>
        </div>
      </div>

      {/* Event Details Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-48 bg-linear-to-br from-orange-400 to-red-500 flex items-center justify-center">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
          ) : (
            <Calendar className="text-white" size={64} />
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{event.title}</h2>
              {getStatusBadge(event.status)}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                title="Chỉnh sửa"
              >
                <Edit size={20} className="text-gray-600" />
              </button>
              <button
                onClick={() => console.log('Delete event')}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                title="Xóa"
              >
                <Trash2 size={20} className="text-red-600" />
              </button>
            </div>
          </div>

          <p className="text-gray-600 mb-6">{event.description}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Ngày bắt đầu</div>
                  <div className="font-medium text-gray-900">
                    {new Date(event.startDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Ngày kết thúc</div>
                  <div className="font-medium text-gray-900">
                    {new Date(event.endDate).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Hạn đăng ký</div>
                  <div className="font-medium text-gray-900">
                    {new Date(event.registrationDeadline).toLocaleString('vi-VN')}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Địa điểm</div>
                  <div className="font-medium text-gray-900">
                    {event.venueName || 'Chưa xác định'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Campus</div>
                  <div className="font-medium text-gray-900">
                    {event.campusName || 'Chưa xác định'}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users size={20} className="text-gray-400" />
                <div>
                  <div className="text-sm text-gray-600">Số lượng</div>
                  <div className="font-medium text-gray-900">
                    {event.currentParticipants}/{event.maxParticipants} người
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => navigate(`/organizer/events/${event.id}/seats/${event.venueId}`)}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
              <Grid className="text-purple-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Sơ đồ ghế</h3>
              <p className="text-sm text-gray-600 mt-1">Phân bổ & đặt trước</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/organizer/attendees')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Người tham dự</h3>
              <p className="text-sm text-gray-600 mt-1">{event.currentParticipants} người</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/organizer/staff')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-lg group-hover:bg-green-100 transition-colors">
              <UserPlus className="text-green-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Staff</h3>
              <p className="text-sm text-gray-600 mt-1">Quản lý nhân sự</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => navigate('/organizer/reports')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Download className="text-orange-600" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Báo cáo</h3>
              <p className="text-sm text-gray-600 mt-1">Tải báo cáo</p>
            </div>
          </div>
        </button>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        {event.status === 'DRAFT' && (
          <button
            onClick={() => console.log('Submit for approval')}
            className="flex items-center gap-2 bg-[#F27125] text-white px-6 py-3 rounded-lg hover:bg-[#d65d1a] transition-colors"
          >
            <Send size={20} />
            Gửi phê duyệt
          </button>
        )}
        {event.status === 'APPROVED' && !event.isPublished && (
          <button
            onClick={() => console.log('Publish event')}
            className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            <Eye size={20} />
            Xuất bản
          </button>
        )}
        <button
          onClick={() => navigate(`/organizer/events/${event.id}/edit`)}
          className="flex items-center gap-2 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Edit size={20} />
          Chỉnh sửa
        </button>
      </div>
    </div>
  );
};

export default OrganizerEventPage;
