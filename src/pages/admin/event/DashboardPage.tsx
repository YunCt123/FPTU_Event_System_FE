import React, { useEffect, useState } from "react";
import StatsCard from "../../../components/admin/dashboard/StatsCard";
import BarChartBox from "../../../components/admin/dashboard/BarChartBox";
import LineChartBox from "../../../components/admin/dashboard/LineChartBox";
import PieChartBox from "../../../components/admin/dashboard/PieChartBox";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users } from "lucide-react";
import eventService from "../../../services/eventService";
import type { meta } from "../../../types/Event";


const DashboardPage = () => {
  const [responseData, setResponseData] = useState<any>();
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchData();
    
    // Auto refresh mỗi 30s
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch tất cả events
      const response = await eventService.getAllEvents({});
      if (response) {
        setResponseData(response.data);
        
        // Tính toán statusData từ response thực tế
        const events = response.data.data || [];
        const published = events.filter((e: any) => e.status === "PUBLISHED").length;
        const pending = events.filter((e: any) => e.status === "PENDING").length;
        const canceled = events.filter((e: any) => e.status === "CANCELED").length;
        
        setStatusData([
          { name: "Đã duyệt", value: published },
          { name: "Đang xử lý", value: pending },
          { name: "Đã từ chối", value: canceled },
        ]);
      }

      // Fetch monthly statistics
      const currentYear = new Date().getFullYear();
      const monthlyResponse = await eventService.getTotalEventsByMoth({ year: currentYear });
      
      if (monthlyResponse && monthlyResponse.data) {
        // Map API response to chart format
        const monthMap: Record<string, string> = {
          "January": "T1",
          "February": "T2",
          "March": "T3",
          "April": "T4",
          "May": "T5",
          "June": "T6",
          "July": "T7",
          "August": "T8",
          "September": "T9",
          "October": "T10",
          "November": "T11",
          "December": "T12"
        };

        const formattedMonthlyData = monthlyResponse.data.data.map((item: { month: string; totalEvents: number }) => ({
          name: monthMap[item.month] || item.month,
          value: item.totalEvents
        }));

        setMonthlyData(formattedMonthlyData);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
      
      // Fallback to empty data if error
      setMonthlyData([
        { name: "T1", value: 0 },
        { name: "T2", value: 0 },
        { name: "T3", value: 0 },
        { name: "T4", value: 0 },
        { name: "T5", value: 0 },
        { name: "T6", value: 0 },
        { name: "T7", value: 0 },
        { name: "T8", value: 0 },
        { name: "T9", value: 0 },
        { name: "T10", value: 0 },
        { name: "T11", value: 0 },
        { name: "T12", value: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock data cho participants (giữ nguyên hoặc tạo API riêng)
  const participantsData = [
    { name: "T7", value: 450 },
    { name: "T8", value: 520 },
    { name: "T9", value: 680 },
    { name: "T10", value: 590 },
    { name: "T11", value: 750 },
    { name: "T12", value: 820 },
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
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
          
          {/* Refresh Button */}
          <button
            onClick={fetchData}
            disabled={isLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            <svg 
              className={`w-5 h-5 text-gray-600 ${isLoading ? 'animate-spin' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              {isLoading ? 'Đang tải...' : 'Làm mới'}
            </span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatsCard 
          label="Tổng số sự kiện" 
          value={responseData?.meta?.total || 0}
          icon={Calendar}
          color="blue"
          trend={{ value: 12, isPositive: true }}
        />
        
        <StatsCard 
          label="Đang xử lý" 
          value={responseData?.data?.filter((e: any) => e.status === "PENDING").length || 0}
          icon={Clock}
          color="yellow"
          trend={{ value: 5, isPositive: false }}
        />
        
        <StatsCard 
          label="Đã duyệt" 
          value={responseData?.data?.filter((e: any) => e.status === "PUBLISHED").length || 0}
          icon={CheckCircle}
          color="green"
          trend={{ value: 18, isPositive: true }}
        />
        
        <StatsCard 
          label="Đã từ chối" 
          value={responseData?.data?.filter((e: any) => e.status === "CANCELED").length || 0}
          icon={XCircle}
          color="red"
          trend={{ value: 3, isPositive: false }}
        />
      </div>

      {/* Charts Grid - 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChartBox
          title="Số lượng sự kiện theo tháng"
          subtitle={`Thống kê 12 tháng năm ${new Date().getFullYear()}`}
          unit="sự kiện"
          data={monthlyData}
        />

        <PieChartBox
          title="Phân bố trạng thái sự kiện"
          subtitle="Tổng quan theo trạng thái hiện tại"
          data={statusData}
        />
      </div>

      {/* Recent Events Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
        <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sự kiện gần đây</h3>
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
              {(responseData?.data || []).slice(0, 4).map((event: any) => (
                <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Calendar size={18} className="text-blue-600" />
                      </div>
                      <span className="text-sm font-medium text-gray-900">{event.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                      event.status === "PUBLISHED" ? "Đã duyệt" :
                      event.status === "PENDING" ? "Đang xử lý" :
                      event.status === "CANCELED" ? "Đã từ chối" : "Khác"
                    )}`}>
                      {event.status === "PUBLISHED" ? "Đã duyệt" :
                       event.status === "PENDING" ? "Đang xử lý" :
                       event.status === "CANCELED" ? "Đã từ chối" : event.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-sm text-gray-900">{event.registeredCount || 0} người</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(event.startTime).toLocaleDateString('vi-VN')}
                    </span>
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
          <p className="text-3xl font-bold">
            {responseData?.data?.reduce((sum: number, e: any) => sum + (e.registeredCount || 0), 0) || 0}
          </p>
          <p className="text-xs opacity-75 mt-2">Tổng đăng ký tham gia</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Tỷ lệ duyệt</h4>
            <CheckCircle size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            {responseData?.meta?.total > 0 
              ? ((responseData.data.filter((e: any) => e.status === "PUBLISHED").length / responseData.meta.total) * 100).toFixed(1)
              : 0}%
          </p>
          <p className="text-xs opacity-75 mt-2">Sự kiện được duyệt</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-sm font-medium opacity-90">Sự kiện tháng này</h4>
            <TrendingUp size={24} className="opacity-80" />
          </div>
          <p className="text-3xl font-bold">
            {responseData?.data?.filter((e: any) => {
              const eventDate = new Date(e.createdAt);
              const now = new Date();
              return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            }).length || 0}
          </p>
          <p className="text-xs opacity-75 mt-2">Được tạo trong tháng</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
