import { useParams, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { eventService } from '../../../services';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Edit,
  Trash2,
  Grid3x3,
  UserCheck,
  UsersRound,
  FileText
} from 'lucide-react';

const OrganizerEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      console.group('🔍 FETCH EVENT DETAIL');
      console.log('1. URL Param ID:', id);
      
      if (!id) {
        console.error('❌ No event ID in URL');
        toast.error('Không tìm thấy ID sự kiện');
        navigate('/organizer/events');
        return;
      }

      console.log('2. ✅ Fetching event with ID:', id);
      
      try {
        setIsLoading(true);
        
        const response = await eventService.getEventById(id);
        
        console.log('3. ✅ API Response:', response);
        
        const eventData = response.data?.data || response.data;
        
        console.log('4. ✅ Extracted event data:', eventData);
        
        if (!eventData || !eventData.id) {
          console.error('❌ Invalid event data structure');
          toast.error('Dữ liệu sự kiện không hợp lệ');
          return;
        }
        
        setEvent(eventData);
        
      } catch (error: any) {
        console.error('❌ Error fetching event detail:', error);
        
        let errorMessage = 'Không thể tải thông tin sự kiện';
        
        if (error.response?.status === 404) {
          errorMessage = 'Không tìm thấy sự kiện';
        } else if (error.response?.status === 403) {
          errorMessage = 'Bạn không có quyền xem sự kiện này';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        toast.error(errorMessage);
        
        setTimeout(() => {
          navigate('/organizer/events');
        }, 2000);
        
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    };

    fetchEventDetail();
  }, [id, navigate]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Không tìm thấy sự kiện</h3>
          <button
            onClick={() => navigate('/organizer/events')}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header với Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/organizer/events')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-sm text-gray-600">Chi tiết và quản lý sự kiện</p>
        </div>
      </div>

      {/* Banner Section */}
      <div 
        className="relative h-64 rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: event.bannerUrl 
            ? `url(${event.bannerUrl})` 
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={24} />
            <h1 className="text-3xl font-bold">{event.title}</h1>
          </div>
          <p className="text-white/90 text-lg max-w-3xl">{event.description}</p>
        </div>       
      </div>

      {/* Thông tin chi tiết Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Thông tin chi tiết</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột trái */}
          <div className="space-y-6">
            {/* Ngày bắt đầu */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ngày bắt đầu</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar size={20} className="text-orange-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(event.startTime || event.startDate).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Địa điểm */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Địa điểm</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <MapPin size={20} className="text-blue-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {event.venue?.name || event.venueName || 'Chưa xác định'}
                </p>
              </div>
            </div>

            {/* Số lượng tham gia */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Số lượng tham gia</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users size={20} className="text-green-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {event.registeredCount || 0}/{event.maxCapacity || event.maxParticipants || 0} người
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            {/* Ngày kết thúc */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ngày kết thúc</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(event.endTime || event.endDate).toLocaleString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>

            {/* Campus */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Campus</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <MapPin size={20} className="text-indigo-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {event.venue?.campus?.name || event.campusName || 'FU - Hồ Chí Minh'}
                </p>
              </div>
            </div>

            {/* Trạng thái */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
                  event.status === 'PUBLISHED' || event.status === 'APPROVED'
                    ? 'bg-green-100 text-green-800'
                    : event.status === 'PENDING'
                    ? 'bg-yellow-100 text-yellow-800'
                    : event.status === 'CANCELED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {event.status === 'PUBLISHED' ? 'Đã duyệt' : 
                   event.status === 'APPROVED' ? 'Đã duyệt' :
                   event.status === 'PENDING' ? 'Đang xử lý' :
                   event.status === 'CANCELED' ? 'Bị từ chối ' :
                   event.status}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ Action Cards Grid - ĐÚNG ROUTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sơ đồ ghế - ĐÃ ĐÚNG */}
        <button
          onClick={() => {
            const venueId = event.venue?.id || event.venueId;
            if (!venueId) {
              toast.error('Chưa có thông tin địa điểm');
              return;
            }
            console.log('Navigate to seating:', { eventId: event.id, venueId });
            navigate(`/organizer/events/${event.id}/seats/${venueId}`);
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
              <Grid3x3 size={24} className="text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Sơ đồ ghế</h3>
              <p className="text-sm text-gray-500">Phân bổ & đặt trước</p>
            </div>
          </div>
        </button>

        {/* ✅ Người tham dự - SỬA: /organizer/attendees */}
        <button
          onClick={() => {
            console.log('Navigate to attendees with eventId:', event.id);
            navigate('/organizer/attendees', { 
              state: { 
                eventId: event.id, 
                eventTitle: event.title,
                fromEventDetail: true 
              } 
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UsersRound size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Người tham dự</h3>
              <p className="text-sm text-gray-500">{event.registeredCount || 0} người</p>
            </div>
          </div>
        </button>

        {/* ✅ Staff - SỬA: /organizer/staff */}
        <button
          onClick={() => {
            console.log('Navigate to staff with eventId:', event.id);
            navigate('/organizer/staff', { 
              state: { 
                eventId: event.id, 
                eventTitle: event.title,
                fromEventDetail: true 
              } 
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <UserCheck size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Staff</h3>
              <p className="text-sm text-gray-500">Quản lý nhân sự</p>
            </div>
          </div>
        </button>

        {/* ✅ Báo cáo - SỬA: /organizer/reports */}
        <button
          onClick={() => {
            console.log('Navigate to reports with eventId:', event.id);
            navigate('/organizer/reports', { 
              state: { 
                eventId: event.id, 
                eventTitle: event.title,
                fromEventDetail: true 
              } 
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FileText size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Báo cáo</h3>
              <p className="text-sm text-gray-500">Tải báo cáo</p>
            </div>
          </div>
        </button>
      </div>

      {/* Nút Chỉnh sửa ở dưới
      <div className="flex justify-start">
        <button
          onClick={() => navigate(`/organizer/events/edit/${event.id}`)}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          <Edit size={20} />
          Chỉnh sửa
        </button>
      </div> */}
    </div>
  );
};

export default OrganizerEventPage;
