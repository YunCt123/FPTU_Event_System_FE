import React from "react";
import StatsCard from "../../../components/admin/dashboard/StatsCard";
import BarChartBox from "../../../components/admin/dashboard/BarChartBox";
import LineChartBox from "../../../components/admin/dashboard/LineChartBox";
import PieChartBox from "../../../components/admin/dashboard/PieChartBox";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users } from "lucide-react";

const DashboardPage = () => {
  // Mock data
  const stats = [
    { 
      label: "Tổng số sự kiện", 
      value: 240,
      icon: Calendar,
      color: "blue" as const,
      trend: { value: 12, isPositive: true }
    },
    { 
      label: "Đang xử lý", 
      value: 25,
      icon: Clock,
      color: "yellow" as const,
      trend: { value: 5, isPositive: false }
    },
    { 
      label: "Đã duyệt", 
      value: 180,
      icon: CheckCircle,
      color: "green" as const,
      trend: { value: 18, isPositive: true }
    },
    { 
      label: "Đã từ chối", 
      value: 35,
      icon: XCircle,
      color: "red" as const,
      trend: { value: 3, isPositive: false }
    },
  ];

  const monthlyData = [
    { name: "T1", value: 15 },
    { name: "T2", value: 18 },
    { name: "T3", value: 22 },
    { name: "T4", value: 20 },
    { name: "T5", value: 28 },
    { name: "T6", value: 17 },
    { name: "T7", value: 25 },
    { name: "T8", value: 19 },
    { name: "T9", value: 23 },
    { name: "T10", value: 21 },
    { name: "T11", value: 26 },
    { name: "T12", value: 16 },
  ];

  const participantsData = [
    { name: "T7", value: 450 },
    { name: "T8", value: 520 },
    { name: "T9", value: 680 },
    { name: "T10", value: 590 },
    { name: "T11", value: 750 },
    { name: "T12", value: 820 },
  ];

  const statusData = [
    { name: "Đã duyệt", value: 180 },
    { name: "Đang xử lý", value: 25 },
    { name: "Đã từ chối", value: 35 },
  ];

  const recentEvents = [
    { id: 1, name: "Tech Conference 2025", status: "Đã duyệt", participants: 350, date: "12/12/2024" },
    { id: 2, name: "AI Workshop", status: "Đang xử lý", participants: 120, date: "15/12/2024" },
    { id: 3, name: "Career Fair", status: "Đã duyệt", participants: 500, date: "18/12/2024" },
    { id: 4, name: "Music Festival", status: "Đang xử lý", participants: 800, date: "20/12/2024" },
  ];

  const getStatusBadge = (status: string) => {
    const config: Record<string, string> = {
      "Đã duyệt": "bg-green-100 text-green-700",
      "Đang xử lý": "bg-yellow-100 text-yellow-700",
      "Đã từ chối": "bg-red-100 text-red-700",
    };
    return config[status] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header with Gradient */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-orange-400 rounded-xl shadow-lg">
            <TrendingUp className="text-white" size={28} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Thống Kê Sự Kiện</h1>
            <p className="text-gray-600 mt-1">
              Tổng quan hệ thống quản lý sự kiện FPT
            </p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <StatsCard
            key={index}
            label={stat.label}
            value={stat.value}
            icon={stat.icon}
            color={stat.color}
            trend={stat.trend}
          />
        ))}
      </div>

      {/* Charts Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChartBox
          title="Số lượng sự kiện theo tháng"
          subtitle="Thống kê 12 tháng năm 2024"
          unit="sự kiện"
          data={monthlyData}
        />

        <PieChartBox
          title="Phân bố trạng thái sự kiện"
          subtitle="Tổng quan theo trạng thái hiện tại"
          data={statusData}
        />
      </div>

      {/* Full Width Line Chart
      <div className="mb-8">
        <LineChartBox
          title="Lượng người tham gia theo tháng"
          subtitle="Xu hướng tham gia 6 tháng gần nhất (T7 - T12/2024)"
          data={participantsData}
        />
      </div> */}

      {/* Recent Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h3>
              {/* <p className="text-sm text-gray-500 mt-1">Sự kiện được tạo mới nhất</p> */}
            </div>
            <button className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              Xem tất cả
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Tên sự kiện
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Người tham gia
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ngày tổ chức
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar size={18} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{event.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(event.status)}`}>
                      {event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{event.participants} người</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">{event.date}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Stats Footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Tổng người tham gia</h4>
            <Users size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">3,210</p>
          <p className="text-xs opacity-75 mt-2">↑ 23% so với tháng trước</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Tỷ lệ hoàn thành</h4>
            <CheckCircle size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">94.5%</p>
          <p className="text-xs opacity-75 mt-2">↑ 5% so với tháng trước</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Đánh giá trung bình</h4>
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">4.8/5</p>
          <p className="text-xs opacity-75 mt-2">↑ 0.3 so với tháng trước</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
