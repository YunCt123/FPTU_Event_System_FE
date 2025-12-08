import React from "react";
import StatsCard from "../components/admin/dashboard/StatsCard";
import BarChartBox from "../components/admin/dashboard/BarChartBox";
import LineChartBox from "../components/admin/dashboard/LineChartBox";
import PieChartBox from "../components/admin/dashboard/PieChartBox";
import { Calendar, Users, CheckCircle, XCircle } from "lucide-react";

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
      icon: Users,
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
    { name: "T1", value: 450 },
    { name: "T2", value: 520 },
    { name: "T3", value: 680 },
    { name: "T4", value: 590 },
    { name: "T5", value: 750 },
    { name: "T6", value: 480 },
  ];

  const statusData = [
    { name: "Đã duyệt", value: 180 },
    { name: "Đang xử lý", value: 25 },
    { name: "Đã từ chối", value: 35 },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Tổng quan hệ thống quản lý sự kiện
        </p>
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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <BarChartBox
          title="Số lượng sự kiện theo tháng"
          subtitle="Thống kê 12 tháng gần nhất"
          unit="sự kiện"
          data={monthlyData}
        />

        <PieChartBox
          title="Phân bố trạng thái sự kiện"
          subtitle="Tổng quan theo trạng thái"
          data={statusData}
        />
      </div>

      {/* Full Width Chart */}
      <div className="mb-8">
        <LineChartBox
          title="Lượng người tham gia theo tháng"
          subtitle="Xu hướng tham gia 6 tháng gần nhất"
          data={participantsData}
        />
      </div>
    </div>
  );
};

export default DashboardPage;