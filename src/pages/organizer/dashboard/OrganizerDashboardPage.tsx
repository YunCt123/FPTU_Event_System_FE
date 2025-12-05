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
  FileText,
} from 'lucide-react';
import type { Event } from '../../../types/Event';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  pendingEvents: number;
  completedEvents: number;
  totalAttendees: number;
  averageAttendance: number;
}

interface RegistrationChartData {
  date: string;
  registrations: number;
  attendance: number;
}

const OrganizerDashboardPage = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    pendingEvents: 0,
    completedEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0,
  });

  const [recentEvents, setRecentEvents] = useState<Event[]>([]);
  const [chartData, setChartData] = useState<RegistrationChartData[]>([]);

  useEffect(() => {
    // Mock data - Replace with actual API call
    setStats({
      totalEvents: 24,
      activeEvents: 8,
      pendingEvents: 3,
      completedEvents: 13,
      totalAttendees: 1250,
      averageAttendance: 85.5,
    });

    setRecentEvents([
      {
        id: 1,
        title: 'Workshop: AI & Machine Learning',
        description: 'Hội thảo về AI',
        eventType: 'WORKSHOP',
        status: 'APPROVED',
        startDate: '2024-12-10',
        endDate: '2024-12-10',
        registrationDeadline: '2024-12-08',
        maxParticipants: 100,
        currentParticipants: 85,
        organizerId: 1,
        requiresApproval: true,
        isPublished: true,
      },
      {
        id: 2,
        title: 'Tech Conference 2024',
        description: 'Hội nghị công nghệ',
        eventType: 'CONFERENCE',
        status: 'PENDING',
        startDate: '2024-12-15',
        endDate: '2024-12-16',
        registrationDeadline: '2024-12-12',
        maxParticipants: 200,
        currentParticipants: 0,
        organizerId: 1,
        requiresApproval: true,
        isPublished: false,
      },
    ]);

    setChartData([
      { date: '01/12', registrations: 45, attendance: 42 },
      { date: '02/12', registrations: 52, attendance: 48 },
      { date: '03/12', registrations: 38, attendance: 35 },
      { date: '04/12', registrations: 65, attendance: 60 },
      { date: '05/12', registrations: 70, attendance: 68 },
    ]);
  }, []);

  const statCards = [
    {
      title: 'Tổng số sự kiện',
      value: stats.totalEvents,
      icon: Calendar,
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      bgLight: 'bg-blue-50',
    },
    {
      title: 'Sự kiện đang hoạt động',
      value: stats.activeEvents,
      icon: CheckCircle,
      color: 'bg-green-500',
      textColor: 'text-green-500',
      bgLight: 'bg-green-50',
    },
    {
      title: 'Chờ phê duyệt',
      value: stats.pendingEvents,
      icon: Clock,
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      bgLight: 'bg-yellow-50',
    },
    {
      title: 'Đã hoàn thành',
      value: stats.completedEvents,
      icon: TrendingUp,
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      bgLight: 'bg-purple-50',
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      DRAFT: { label: 'Nháp', className: 'bg-gray-100 text-gray-700' },
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-700' },
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-700' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-700' },
      COMPLETED: { label: 'Hoàn thành', className: 'bg-blue-100 text-blue-700' },
    };

    const config = statusConfig[status] || { label: status, className: 'bg-gray-100 text-gray-700' };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Tổng quan về các sự kiện của bạn</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                </div>
                <div className={`${card.bgLight} p-3 rounded-lg`}>
                  <Icon className={card.textColor} size={24} />
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Đăng ký & Tham dự</h2>
            <BarChart3 className="text-gray-400" size={20} />
          </div>
          <div className="space-y-4">
            {chartData.map((data, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{data.date}</span>
                  <div className="flex gap-4">
                    <span className="text-blue-600 font-medium">{data.registrations} đăng ký</span>
                    <span className="text-green-600 font-medium">{data.attendance} tham dự</span>
                  </div>
                </div>
                <div className="flex gap-1 h-2 rounded-full overflow-hidden bg-gray-100">
                  <div
                    className="bg-blue-500"
                    style={{ width: `${(data.registrations / 100) * 100}%` }}
                  />
                  <div
                    className="bg-green-500"
                    style={{ width: `${(data.attendance / 100) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Tỷ lệ tham dự trung bình</span>
              <span className="text-lg font-bold text-green-600">{stats.averageAttendance}%</span>
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
                <span className="text-sm font-medium text-gray-700">Đang hoạt động</span>
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
          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Tổng số người tham dự</span>
              <span className="text-lg font-bold text-gray-900">
                {stats.totalAttendees.toLocaleString()}
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
                  Đăng ký
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
                      <div className="text-sm text-gray-500">{event.eventType}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(event.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(event.startDate).toLocaleDateString('vi-VN')}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">
                        {event.currentParticipants}/{event.maxParticipants}
                      </span>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => (window.location.href = '/organizer/events/create')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-orange-50 p-3 rounded-lg group-hover:bg-orange-100 transition-colors">
              <Calendar className="text-[#F27125]" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Tạo sự kiện mới</h3>
              <p className="text-sm text-gray-600 mt-1">Tạo và quản lý sự kiện</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = '/organizer/attendees')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-lg group-hover:bg-blue-100 transition-colors">
              <Users className="text-blue-500" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Quản lý người tham dự</h3>
              <p className="text-sm text-gray-600 mt-1">Xem và xuất danh sách</p>
            </div>
          </div>
        </button>

        <button
          onClick={() => (window.location.href = '/organizer/reports')}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="bg-purple-50 p-3 rounded-lg group-hover:bg-purple-100 transition-colors">
              <FileText className="text-purple-500" size={24} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Báo cáo sự kiện</h3>
              <p className="text-sm text-gray-600 mt-1">Xem báo cáo tổng hợp</p>
            </div>
          </div>
        </button>
      </div>

      {/* Alerts */}
      {stats.pendingEvents > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="text-yellow-600 mt-0.5" size={20} />
            <div>
              <h4 className="font-semibold text-yellow-900">Có {stats.pendingEvents} sự kiện chờ phê duyệt</h4>
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
