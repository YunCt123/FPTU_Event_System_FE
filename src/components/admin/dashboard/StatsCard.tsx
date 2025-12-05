import React from "react";

interface StatsCardProps {
  label: string;
  value: number | string;
}

const StatsCard: React.FC<StatsCardProps> = ({ label, value }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <p className="text-sm text-gray-600 mb-1">{label}</p>
      <h2 className="text-3xl font-bold text-gray-900">{value}</h2>
    </div>
  );
};

export default StatsCard;
