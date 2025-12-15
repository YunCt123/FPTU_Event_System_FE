import React from "react";
import type { IssueResponse } from "../../../types/Incident";
import { X, Calendar, User, Image as ImageIcon } from "lucide-react";

interface IncidentDetailModalProps {
  incident: IssueResponse;
  isOpen: boolean;
  onClose: () => void;
}

const IncidentDetailModal: React.FC<IncidentDetailModalProps> = ({
  incident,
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

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

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-800">Chi tiết Sự cố</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Status & Severity */}
          <div className="flex gap-3">
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold border ${getSeverityColor(
                incident.severity
              )}`}
            >
              {getSeverityLabel(incident.severity)}
            </span>
            <span
              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(
                incident.status
              )}`}
            >
              {getStatusLabel(incident.status)}
            </span>
          </div>

          {/* Title */}
          <div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              {incident.title}
            </h3>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết
            </label>
            <div className="bg-gray-50 rounded-lg p-4 text-gray-700 whitespace-pre-wrap">
              {incident.description}
            </div>
          </div>

          {/* Image */}
          {incident.imageUrl && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <ImageIcon size={16} />
                Hình ảnh
              </label>
              <img
                src={incident.imageUrl}
                alt="Incident"
                className="w-full rounded-lg shadow-md"
              />
            </div>
          )}

          {/* Event Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <Calendar size={18} className="text-blue-600" />
              Thông tin Sự kiện
            </h4>
            <div className="space-y-2 text-sm">
              <div>
                <span className="text-gray-600">Tên sự kiện:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {incident.event.title}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Thời gian:</span>
                <span className="ml-2 font-medium text-gray-800">
                  {formatDate(incident.event.startTime)} -{" "}
                  {formatDate(incident.event.endTime)}
                </span>
              </div>
            </div>
          </div>

          {/* Reporter Info */}
          <div className="bg-orange-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
              <User size={18} className="text-orange-600" />
              Người báo cáo
            </h4>
            <div className="flex items-center gap-3">
              {incident.reporter.avatar ? (
                <img
                  src={incident.reporter.avatar}
                  alt={incident.reporter.userName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-orange-200 flex items-center justify-center">
                  <User size={24} className="text-orange-600" />
                </div>
              )}
              <div>
                <p className="font-medium text-gray-800">
                  {incident.reporter.firstName} {incident.reporter.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  @{incident.reporter.userName}
                </p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Thời gian báo cáo
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm font-medium text-gray-800">
                {formatDate(incident.createdAt)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cập nhật lần cuối
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm font-medium text-gray-800">
                {formatDate(incident.updatedAt)}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncidentDetailModal;
