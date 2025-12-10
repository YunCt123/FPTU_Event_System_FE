import React, { useEffect, useState } from "react";
import StatsCard from "../../../components/admin/dashboard/StatsCard";
import BarChartBox from "../../../components/admin/dashboard/BarChartBox";
import PieChartBox from "../../../components/admin/dashboard/PieChartBox";
import { Calendar, Clock, CheckCircle, XCircle, TrendingUp, Users } from "lucide-react";
import eventService from "../../../services/eventService";
import type { meta } from "../../../types/Event";

const DashboardPage = () => {
  const [responseData, setResponseData] = useState<any>();
  const [statusData, setStatusData] = useState<{ name: string; value: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ name: string; value: number }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [yearInput, setYearInput] = useState<string>(new Date().getFullYear().toString());

  // Generate list of years (từ 2020 đến năm hiện tại + 2)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 2020 + 3 }, (_, i) => 2020 + i);

  useEffect(() => {
    fetchData();
    
    // Auto refresh mỗi 30s
    const interval = setInterval(fetchData, 30000);
    
    return () => clearInterval(interval);
  }, [selectedYear]); // Thêm selectedYear vào dependency

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await eventService.getAllEvents({});
      
      if (response && response.data) {
        setResponseData(response.data);
        const events = response.data.data || [];
        
        // Tính statusData
        const published = events.filter((e: any) => e.status === "PUBLISHED").length;
        const pending = events.filter((e: any) => e.status === "PENDING").length;
        const canceled = events.filter((e: any) => e.status === "CANCELED").length;
        
        setStatusData([
          { name: "Đã duyệt", value: published },
          { name: "Đang xử lý", value: pending },
          { name: "Đã từ chối", value: canceled },
        ]);

        // Tính monthly data theo startTime (không phải createdAt)
        const monthCounts: Record<number, number> = {};
        
        for (let i = 1; i <= 12; i++) {
          monthCounts[i] = 0;
        }
        
        events.forEach((event: any) => {
          try {
            const eventDate = new Date(event.startTime);
            const year = eventDate.getFullYear();
            const month = eventDate.getMonth() + 1;
            
            console.log(`Event: ${event.title}, StartTime: ${event.startTime}, Year: ${year}, Month: ${month}`);
            
            if (year === selectedYear) {
              monthCounts[month]++;
            }
          } catch (err) {
            console.error("Error parsing event startTime:", event, err);
          }
        });
        
        const calculatedMonthlyData = Object.keys(monthCounts)
          .sort((a, b) => parseInt(a) - parseInt(b))
          .map(month => ({
            name: `T${month}`,
            value: monthCounts[parseInt(month)]
          }));

        setMonthlyData(calculatedMonthlyData);
      }
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error);
      setError("Không thể tải dữ liệu. Vui lòng thử lại.");
      
      // Fallback data
      setMonthlyData(Array.from({ length: 12 }, (_, i) => ({ 
        name: `T${i + 1}`, 
        value: 0 
      })));
      setStatusData([
        { name: "Đã duyệt", value: 0 },
        { name: "Đang xử lý", value: 0 },
        { name: "Đã từ chối", value: 0 },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={20} />
            <span>{error}</span>
          </div>
          <button 
            onClick={fetchData}
            className="text-sm font-medium hover:underline"
          >
            Thử lại
          </button>
        </div>
      )}

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
        {isLoading ? (
          <>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-[400px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-500">Đang tải dữ liệu...</p>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* BarChart với Year Selector */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Số lượng sự kiện theo tháng</h3>
                    <p className="text-sm text-gray-500 mt-1">Thống kê 12 tháng trong năm</p>
                  </div>
                  
                  {/* Year Selector với Previous/Next buttons */}
                  <div className="flex items-center gap-2">
                    <label htmlFor="year-input" className="text-sm font-medium text-gray-700">
                      Năm:
                    </label>
                    <input
                      id="year-input"
                      type="text"
                      inputMode="numeric"
                      value={yearInput}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Chỉ cho phép số
                        if (value === '' || /^\d{0,4}$/.test(value)) {
                          setYearInput(value);
                        }
                      }}
                      onBlur={(e) => {
                        const year = parseInt(e.target.value);
                        if (!isNaN(year) && year >= 2000 && year <= 2100) {
                          setSelectedYear(year);
                          setYearInput(year.toString());
                        } else {
                          // Reset về giá trị hiện tại
                          setYearInput(selectedYear.toString());
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const year = parseInt(yearInput);
                          if (!isNaN(year) && year >= 2000 && year <= 2100) {
                            setSelectedYear(year);
                          } else {
                            setYearInput(selectedYear.toString());
                          }
                          e.currentTarget.blur();
                        }
                        // Cho phép Escape để cancel
                        if (e.key === 'Escape') {
                          setYearInput(selectedYear.toString());
                          e.currentTarget.blur();
                        }
                      }}
                      className="w-24 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-center"
                      placeholder="2025"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <BarChartBox
                  title=""
                  subtitle=""
                  // unit="sự kiện"
                  data={monthlyData}
                />
              </div>
            </div>

            {/* PieChart */}
            <PieChartBox
              title="Phân bố trạng thái sự kiện"
              subtitle="Tổng quan theo trạng thái hiện tại"
              data={statusData}
            />
          </>
        )}
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
                  Thời gian tổ chức
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
              const eventDate = new Date(e.startTime);
              const now = new Date();
              return eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
            }).length || 0}
          </p>
          <p className="text-xs opacity-75 mt-2">Diễn ra trong tháng</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
