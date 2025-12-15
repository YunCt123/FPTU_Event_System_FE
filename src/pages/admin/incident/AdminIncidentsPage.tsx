import React, { useEffect, useState } from "react";
import { incidentService } from "../../../services";
import type { IssueResponse } from "../../../types/Incident";
import { AlertTriangle, Search, Eye } from "lucide-react";
import IncidentDetailModal from "../../../components/admin/incident/IncidentDetailModal";
import EditIncidentModal from "../../../components/admin/incident/EditIncidentModal";

const AdminIncidentsPage: React.FC = () => {
  const [incidents, setIncidents] = useState<IssueResponse[]>([]);
  const [filteredIncidents, setFilteredIncidents] = useState<IssueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedIncident, setSelectedIncident] = useState<IssueResponse | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    fetchIncidents();
  }, []);

  useEffect(() => {
    filterIncidents();
  }, [incidents, searchTerm, filterSeverity, filterStatus]);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await incidentService.getAllIncidents();
      console.log("API Response:", response);
      const incidentsData = response.data || [];
      console.log("Incidents Data:", incidentsData);
      setIncidents(incidentsData);
      setFilteredIncidents(incidentsData);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterIncidents = () => {
    let filtered = [...incidents];

    if (searchTerm) {
      filtered = filtered.filter(
        (incident) =>
          incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          incident.event.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSeverity !== "ALL") {
      filtered = filtered.filter((incident) => incident.severity === filterSeverity);
    }

    if (filterStatus !== "ALL") {
      filtered = filtered.filter((incident) => incident.status === filterStatus);
    }

    setFilteredIncidents(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "bg-red-100 text-red-700 border-red-300";
      case "MEDIUM":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "LOW":
        return "bg-blue-100 text-blue-700 border-blue-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "bg-green-100 text-green-700";
      case "IN_PROGRESS":
        return "bg-orange-100 text-orange-700";
      case "OPEN":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "HIGH":
        return "Nghiêm trọng";
      case "MEDIUM":
        return "Trung bình";
      case "LOW":
        return "Thấp";
      default:
        return severity;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "RESOLVED":
        return "Đã giải quyết";
      case "IN_PROGRESS":
        return "Đang xử lý";
      case "OPEN":
        return "Mới";
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleViewDetail = (incident: IssueResponse) => {
    setSelectedIncident(incident);
    setIsDetailModalOpen(true);
  };

  const handleUpdateSuccess = () => {
    fetchIncidents();
    setIsEditModalOpen(false);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Quản lý Sự cố
        </h1>
        <p className="text-gray-600">
          Xem và quản lý tất cả các sự cố được báo cáo trong hệ thống
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Tìm kiếm sự cố, sự kiện..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Severity Filter */}
          <div>
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Tất cả mức độ</option>
              <option value="HIGH">Nghiêm trọng</option>
              <option value="MEDIUM">Trung bình</option>
              <option value="LOW">Thấp</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="ALL">Tất cả trạng thái</option>
              <option value="OPEN">Mới</option>
              <option value="IN_PROGRESS">Đang xử lý</option>
              <option value="RESOLVED">Đã giải quyết</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="mt-4 text-sm text-gray-600">
          Tìm thấy <span className="font-semibold">{filteredIncidents.length}</span> sự cố
        </div>
      </div>

      {/* Incidents List */}
      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      ) : filteredIncidents.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {filteredIncidents.map((incident) => (
            <div
              key={incident.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all p-6"
            >
              <div className="flex items-start justify-between">
                {/* Left Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold border ${getSeverityColor(
                        incident.severity
                      )}`}
                    >
                      {getSeverityLabel(incident.severity)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        incident.status
                      )}`}
                    >
                      {getStatusLabel(incident.status)}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    {incident.title}
                  </h3>

                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {incident.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Sự kiện:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {incident.event.title}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Người báo cáo:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {incident.reporter.firstName} {incident.reporter.lastName}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Thời gian:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {formatDate(incident.createdAt)}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Cập nhật:</span>
                      <span className="ml-2 font-medium text-gray-800">
                        {formatDate(incident.updatedAt)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => handleViewDetail(incident)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#F27125] hover:bg-[#D45C1A] text-white rounded-lg transition-colors text-sm"
                  >
                    <Eye size={16} />
                    Xem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <AlertTriangle className="w-20 h-20 mx-auto text-gray-400 mb-4" />
          <h3 className="text-xl font-semibold text-gray-800 mb-2">
            Không tìm thấy sự cố nào
          </h3>
          <p className="text-gray-600 mb-6">
            Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm
          </p>
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterSeverity("ALL");
              setFilterStatus("ALL");
            }}
            className="bg-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Xóa bộ lọc
          </button>
        </div>
      )}

      {/* Modals */}
      {selectedIncident && (
        <>
          <IncidentDetailModal
            incident={selectedIncident}
            isOpen={isDetailModalOpen}
            onClose={() => setIsDetailModalOpen(false)}
          />
          <EditIncidentModal
            incident={selectedIncident}
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleUpdateSuccess}
          />
        </>
      )}
    </div>
  );
};

export default AdminIncidentsPage;
