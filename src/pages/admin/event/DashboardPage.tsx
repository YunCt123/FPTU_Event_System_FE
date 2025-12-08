import { useEffect, useState } from "react";

const DashboardPage = () => {
  const [stats] = useState({
    totalEvents: 240,
    pending: 25,
    approved: 180,
    rejected: 35,
    monthlyData: [
      { month: "Tháng 1", events: 15 },
      { month: "Tháng 2", events: 18 },
      { month: "Tháng 3", events: 22 },
      { month: "Tháng 4", events: 20 },
      { month: "Tháng 5", events: 28 },
      { month: "Tháng 6", events: 17 },
      { month: "Tháng 7", events: 25 },
      { month: "Tháng 8", events: 19 },
      { month: "Tháng 9", events: 23 },
      { month: "Tháng 10", events: 21 },
      { month: "Tháng 11", events: 26 },
      { month: "Tháng 12", events: 16 },
    ],
  });

  const maxEvents = Math.max(...stats.monthlyData.map(item => item.events));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Thống kê số liệu</h1>
        <p className="text-sm text-gray-500 mt-1">
          Số liệu mock và biểu đồ events theo tháng
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Tổng số lượng sự kiện</p>
          <h2 className="text-3xl font-bold text-gray-900">{stats.totalEvents}</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Đang xử lý</p>
          <h2 className="text-3xl font-bold text-gray-900">{stats.pending}</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Đã duyệt</p>
          <h2 className="text-3xl font-bold text-gray-900">{stats.approved}</h2>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <p className="text-sm text-gray-600 mb-1">Đã từ chối</p>
          <h2 className="text-3xl font-bold text-gray-900">{stats.rejected}</h2>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Số lượng sự kiện theo tháng</h3>
          <span className="text-sm text-gray-500">Unit: số events</span>
        </div>

        {/* Chart Container */}
        <div className="relative">
          {/* Simple Bar Chart */}
          <div className="grid grid-cols-12 gap-2 items-end h-64 px-4">
            {stats.monthlyData.map((item) => (
              <div key={item.month} className="flex flex-col items-center gap-3">
                <div 
                  className="w-full bg-blue-500 rounded-t-md transition-all hover:bg-blue-600 relative group"
                  style={{ 
                    height: `${(item.events / maxEvents) * 100}%`,
                    minHeight: item.events > 0 ? '10px' : '0'
                  }}
                >
                  {/* Tooltip on hover */}
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                    {item.events} events
                  </span>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.month.replace("Tháng ", "T")}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Thống kê 12 tháng <span className="text-sm font-normal text-gray-500">(năm 2024)</span>
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Tháng</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Sự kiện</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats.monthlyData.map((item) => (
                <tr key={item.month} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.month}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.events}</td>
                </tr>
              ))}
              {/* Tổng kết */}
              <tr className="bg-gray-50 font-semibold">
                <td className="px-6 py-4 text-sm text-gray-900">Tổng cộng</td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {stats.monthlyData.reduce((sum, item) => sum + item.events, 0)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
