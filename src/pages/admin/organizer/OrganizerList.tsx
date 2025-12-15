import { useState } from "react";
import OrganizerListGrid from "../../../components/admin/organizer/OrganizerListGrid";
import OrganizerRequestsTab from "../../../components/admin/organizer/OrganizerRequestsTab";
import { Users, FileText } from "lucide-react";

type TabType = "organizers" | "requests";

const OrganizerList = () => {
  const [activeTab, setActiveTab] = useState<TabType>("organizers");

  const tabs = [
    {
      id: "organizers" as TabType,
      label: "Danh sách Organizer",
      icon: <Users size={18} />,
    },
    {
      id: "requests" as TabType,
      label: "Yêu cầu trở thành Organizer",
      icon: <FileText size={18} />,
    },
  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý Organizer</h1>
        <p className="text-gray-600 mt-1">
          Quản lý danh sách các nhà tổ chức sự kiện và duyệt yêu cầu
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-8" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? "border-[#F27125] text-[#F27125]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === "organizers" && <OrganizerListGrid />}
        {activeTab === "requests" && <OrganizerRequestsTab />}
      </div>
    </div>
  );
};

export default OrganizerList;