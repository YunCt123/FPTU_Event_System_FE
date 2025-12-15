import { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertCircle,
  BarChart3,
  PieChart,
} from 'lucide-react';
import organizerService from '../../../services/organizerService';
import userService from '../../../services/userService';
import { toast } from 'react-toastify';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  pendingEvents: number;
  completedEvents: number;
  totalRegistrations: number;
  totalAttendance: number;
  averageAttendance: number;
}

interface EventChartData {
  eventId: string;
  eventName: string;
  registrations: number;
  attendance: number;
  startTime: string;
}

const OrganizerDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalRegistrations: 0,
    totalAttendance: 0,
    averageAttendance: 0,
  });

  const [recentEvents, setRecentEvents] = useState<any[]>([]);
  const [chartData, setChartData] = useState<EventChartData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<string>(String(new Date().getFullYear()));
  
  // State tạm để lưu năm đang nhập (không trigger useEffect)
  const [tempYear, setTempYear] = useState<string>(String(new Date().getFullYear()));

  // Chỉ fetch khi component mount hoặc khi selectedMonth/selectedYear thay đổi SAU KHI BLUR
  useEffect(() => {
    fetchDashboardData();
  }, [selectedMonth, selectedYear]); // selectedYear chỉ thay đổi khi blur

  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const eventsResponse = await organizerService.getOrganizerEvents({
        page: 1,
        limit: 100,
      });

      console.log('Events response:', eventsResponse);

      if (eventsResponse && eventsResponse.data) {
        const eventsData = eventsResponse.data.data || [];
        const meta = eventsResponse.data.meta;

        const totalEvents = meta?.total || eventsData.length;
        const approvedEvents = eventsData.filter(
          (e: any) => e.status === 'PUBLISHED' || e.status === 'APPROVED'
        );
        const pendingEvents = eventsData.filter((e: any) => e.status === 'PENDING');
        const completedEvents = eventsData.filter((e: any) => e.status === 'COMPLETED');

        const totalAttendance = eventsData.reduce(
          (sum: number, event: any) => sum + (event.checkinCount || 0),
          0
        );

        let totalRegistrations = 0;

        for (const event of eventsData) {
          try {
            const attendeesResponse = await userService.getAttendUser(
              String(event.id),
              {
                page: 1,
                limit: 1,
              }
            );

            if (attendeesResponse && attendeesResponse.data) {
              const attendeesTotal = attendeesResponse.data.meta?.total || 0;
              totalRegistrations += attendeesTotal;
            }
          } catch (error) {
            totalRegistrations += event.registeredCount || 0;
          }
        }

        const averageAttendance =
          totalRegistrations > 0
            ? Math.round((totalAttendance / totalRegistrations) * 100)
            : 0;

        setStats({
          totalEvents,
          activeEvents: approvedEvents.length,
          pendingEvents: pendingEvents.length,
          completedEvents: completedEvents.length,
          totalRegistrations,
          totalAttendance,
          averageAttendance,
        });

        const sortedEvents = [...eventsData]
          .sort(
            (a: any, b: any) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
          .slice(0, 5);

        setRecentEvents(sortedEvents);

        // Lọc events theo tháng và năm được chọn
        const filteredEvents = eventsData.filter((e: any) => {
          const eventDate = new Date(e.startTime);
          return (
            eventDate.getMonth() + 1 === selectedMonth &&
            eventDate.getFullYear() === Number(selectedYear)
          );
        });

        const chartDataPromises = filteredEvents.map(async (event: any) => {
          let registrations = event.registeredCount || 0;
          
          try {
            const attendeesResponse = await userService.getAttendUser(
              String(event.id),
              { page: 1, limit: 1 }
            );
            if (attendeesResponse && attendeesResponse.data) {
              registrations = attendeesResponse.data.meta?.total || registrations;
            }
          } catch (error) {
            console.warn(`Cannot fetch attendees for event ${event.id}`);
          }

          return {
            eventId: event.id,
            eventName: event.title,
            registrations,
            attendance: event.checkinCount || 0,
            startTime: event.startTime,
          };
        });

        const resolvedChartData = await Promise.all(chartDataPromises);
        
        resolvedChartData.sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        setChartData(resolvedChartData);
      }
    } catch (error: any) {
      console.error('❌ Error fetching dashboard data:', error);
      toast.error('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const months = [
    { value: 1, label: 'Tháng 1' },
    { value: 2, label: 'Tháng 2' },
    { value: 3, label: 'Tháng 3' },
    { value: 4, label: 'Tháng 4' },
    { value: 5, label: 'Tháng 5' },
    { value: 6, label: 'Tháng 6' },
    { value: 7, label: 'Tháng 7' },
    { value: 8, label: 'Tháng 8' },
    { value: 9, label: 'Tháng 9' },
    { value: 10, label: 'Tháng 10' },
    { value: 11, label: 'Tháng 11' },
    { value: 12, label: 'Tháng 12' },
  ];

  const statCards = [
    {
      title: 'Tổng số sự kiện',
      value: stats.totalEvents,
      icon: Calendar,
      bgGradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      bgLight: 'bg-blue-50',
      borderColor: 'border-blue-200',
      iconBg: 'bg-blue-100',
    },
    {
      title: 'Được duyệt',
      value: stats.activeEvents,
      icon: CheckCircle,
      bgGradient: 'bg-gradient-to-br from-green-500 to-green-600',
      textColor: 'text-green-600',
      bgLight: 'bg-green-50',
      borderColor: 'border-green-200',
      iconBg: 'bg-green-100',
    },
    {
      title: 'Chờ phê duyệt',
      value: stats.pendingEvents,
      icon: Clock,
      bgGradient: 'bg-gradient-to-br from-yellow-500 to-yellow-600',
      textColor: 'text-yellow-600',
      bgLight: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
    },
    {
      title: 'Đã hoàn thành',
      value: stats.completedEvents,
      icon: TrendingUp,
      bgGradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      bgLight: 'bg-purple-50',
      borderColor: 'border-purple-200',
      iconBg: 'bg-purple-100',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      PUBLISHED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      CANCELED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-700' },
    };

    const config = statusConfig[status] || {
      label: status,
      className: 'bg-gray-100 text-gray-700',
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan về các sự kiện của bạn</p>
        </div>
        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Làm mới
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div
              key={index}
              className={`${card.bgGradient} rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 hover:scale-105 border border-white/20`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-white/90 mb-2">{card.title}</p>
                  <p className="text-5xl font-bold text-white">{card.value}</p>
                </div>
                <div className={`${card.iconBg} p-4 rounded-xl shadow-md`}>
                  <Icon className={card.textColor} size={32} strokeWidth={2.5} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Registration & Attendance Chart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Đăng ký & Tham dự theo sự kiện</h2>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          
          {/* Filter Tháng/Năm */}
          <div className="flex gap-3 mb-6">
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(Number(e.target.value))}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {months.map((month) => (
                <option key={month.value} value={month.value}>
                  {month.label}
                </option>
              ))}
            </select>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={tempYear}
              onChange={(e) => {
                const value = e.target.value;
                // Chỉ cho phép nhập số hoặc để trống, cập nhật tempYear (KHÔNG trigger useEffect)
                if (value === '' || /^\d{0,4}$/.test(value)) {
                  setTempYear(value);
                }
              }}
              onKeyDown={(e) => {
                // Khi ấn Enter, trigger validation và update selectedYear
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = (e.target as HTMLInputElement).value;
      
                  if (value === '' || value.length < 4) {
                    // Nếu trống hoặc chưa đủ 4 số, set về năm hiện tại
                    const currentYear = String(new Date().getFullYear());
                    setTempYear(currentYear);
                    setSelectedYear(currentYear); // Trigger useEffect
                    toast.info('Năm không hợp lệ, đã set về năm hiện tại');
                  } else {
                    const year = Number(value);
                    if (year < 1900) {
                      setTempYear('1900');
                      setSelectedYear('1900'); // Trigger useEffect
                      toast.info('Năm tối thiểu là 1900');
                    } else if (year > 2100) {
                      setTempYear('2100');
                      setSelectedYear('2100'); // Trigger useEffect
                      toast.info('Năm tối đa là 2100');
                    } else {
                      setSelectedYear(value); // Trigger useEffect với năm hợp lệ
                      toast.success(`Đã lọc theo tháng ${selectedMonth}/${value}`);
                    }
                  }
      
                  // Blur input sau khi Enter
                  (e.target as HTMLInputElement).blur();
                }
              }}
              onBlur={(e) => {
                // Nếu blur mà chưa nhập đủ, reset về selectedYear hiện tại
                const value = e.target.value;
                if (value === '' || value.length < 4) {
                  setTempYear(selectedYear); // Reset về giá trị đang active
                }
              }}
              placeholder="Năm (Enter để áp dụng)"
              maxLength={4}
              className="w-40 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chartData.length > 0 ? (
              chartData.map((data, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-900 font-medium truncate max-w-[200px]" title={data.eventName}>
                      {data.eventName}
                    </span>
                    <div className="flex gap-4">
                      <span className="text-blue-600 font-medium">
                        {data.registrations} đăng ký
                      </span>
                      <span className="text-green-600 font-medium">
                        {data.attendance} tham dự
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                    <div
                      className="bg-blue-500 transition-all duration-300"
                      style={{
                        width: `${
                          data.registrations > 0
                            ? (data.registrations / Math.max(...chartData.map((d) => d.registrations), 1)) * 100
                            : 0
                        }%`,
                      }}
                    />
                    <div
                      className="bg-green-500 transition-all duration-300"
                      style={{
                        width: `${
                          data.attendance > 0
                            ? (data.attendance / Math.max(...chartData.map((d) => d.registrations), 1)) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                Không có sự kiện nào trong tháng {selectedMonth}/{selectedYear}
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tỷ lệ tham dự trung bình</span>
              <span className="text-lg font-bold text-green-600">
                {stats.averageAttendance}%
              </span>
            </div>
          </div>
        </div>

        {/* Event Status Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Phân bổ trạng thái</h2>
            <PieChart className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Được duyệt</span>
              </div>
              <span className="text-lg font-bold text-green-600">{stats.activeEvents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Chờ phê duyệt</span>
              </div>
              <span className="text-lg font-bold text-yellow-600">{stats.pendingEvents}</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Đã hoàn thành</span>
              </div>
              <span className="text-lg font-bold text-purple-600">{stats.completedEvents}</span>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng người đăng ký</span>
              <span className="text-lg font-bold text-blue-600">
                {stats.totalRegistrations.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng người tham dự</span>
              <span className="text-lg font-bold text-green-600">
                {stats.totalAttendance.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Events */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h2>
            <button
              onClick={() => (window.location.href = '/organizer/events')}
              className="text-sm text-[#F27125] hover:text-[#d65d1a] font-medium"
            >
              Xem tất cả →
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sự kiện
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày bắt đầu
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Đăng ký / Tham dự
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{event.title}</div>
                      <div className="text-sm text-gray-500">{event.category || 'N/A'}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.startTime).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Users size={14} className="text-blue-400" />
                        <span className="text-xs text-gray-900">
                          Đăng ký: {event.registeredCount || 0}/{event.maxCapacity}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle size={14} className="text-green-400" />
                        <span className="text-xs text-gray-900">
                          Tham dự: {event.checkinCount || 0}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => (window.location.href = `/organizer/events/${event.id}`)}
                      className="text-sm text-[#F27125] hover:text-[#d65d1a] font-medium"
                    >
                      Chi tiết
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts */}
      {stats.pendingEvents > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-900">
                Có {stats.pendingEvents} sự kiện chờ phê duyệt
              </h4>
              <p className="text-sm text-yellow-700 mt-1">
                Các sự kiện của bạn đang chờ admin phê duyệt. Vui lòng kiểm tra thường xuyên.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboardPage;
