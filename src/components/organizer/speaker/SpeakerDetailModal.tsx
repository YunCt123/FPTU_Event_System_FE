import { X, Calendar, Building2, User, FileText, Briefcase } from "lucide-react";
import { useEffect, useState } from "react";
import { speakerService } from "../../../services";
import type { SpeakerResponse } from "../../../types/Speaker";
import { toast } from "react-toastify";

interface SpeakerDetailModalProps {
  speakerId: number;
  onClose: () => void;
}

const SpeakerDetailModal = ({ speakerId, onClose }: SpeakerDetailModalProps) => {
  const [speaker, setSpeaker] = useState<SpeakerResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSpeakerDetail = async () => {
    setIsLoading(true);
    try {
      const response = await speakerService.getSpeakerById(speakerId);
      if (response.status === 200) {
        console.log("object", response);
        setSpeaker(response.data);
      }
    } catch (error) {
      toast.error("Không thể tải thông tin speaker");
      console.error("Error fetching speaker details:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakerDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerId]);

  

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  

  return (
    <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#F27125] to-[#d65d1a] text-white px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Chi tiết Speaker</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27125]"></div>
            </div>
          ) : speaker ? (
            <div className="space-y-6">
              {/* Speaker Profile */}
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {speaker.avatar ? (
                      <img
                        src={speaker.avatar}
                        alt={speaker.name}
                        className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-full bg-gray-300 flex items-center justify-center">
                        <User size={48} className="text-gray-500" />
                      </div>
                    )}
                  </div>

                  {/* Basic Info */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {speaker.name}
                      </h3>
                      <span
                        className={`inline-block mt-2 px-3 py-1 text-sm font-semibold rounded-full ${
                          speaker.type === "internal"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {speaker.type === "internal" ? "Nội bộ" : "Bên ngoài"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Building2 size={18} className="text-[#F27125]" />
                        <span className="text-sm">
                          <span className="font-medium">Công ty:</span>{" "}
                          {speaker.company || "Không có"}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={18} className="text-[#F27125]" />
                        <span className="text-sm">
                          <span className="font-medium">Ngày tạo:</span>{" "}
                          {formatDate(speaker.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <div className="flex items-start gap-2">
                    <FileText size={18} className="text-[#F27125] mt-1 flex-shrink-0" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">Tiểu sử</h4>
                      <p className="text-gray-700 leading-relaxed">{speaker.bio}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Events List */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={20} className="text-[#F27125]" />
                  <h4 className="text-lg font-semibold text-gray-900">
                    Các sự kiện tham gia
                  </h4>
                  {speaker.eventSpeakers && speaker.eventSpeakers.length > 0 && (
                    <span className="bg-[#F27125] text-white text-xs font-semibold px-2 py-1 rounded-full">
                      {speaker.eventSpeakers.length}
                    </span>
                  )}
                </div>

                {speaker.eventSpeakers  ? (
                  <div className="space-y-3">
                    {speaker.eventSpeakers.map((eventSpeaker) => (
                      <div
                        key={eventSpeaker.id}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                          <div className="flex-1">
                            <h5 className="font-semibold text-gray-900 mb-1">
                              {eventSpeaker.event.title}
                            </h5>
                            <p className="text-sm text-gray-600 mb-2">
                              <span className="font-medium">Chủ đề:</span>{" "}
                              {eventSpeaker.topic}
                            </p>
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Bắt đầu: {formatDateTime(eventSpeaker.event.startTime)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar size={14} />
                                Kết thúc: {formatDateTime(eventSpeaker.event.endTime)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <Briefcase size={48} className="mx-auto text-gray-400 mb-3" />
                    <p className="text-gray-600">
                      Speaker chưa được phân công vào sự kiện nào
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600">Không tìm thấy thông tin speaker</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-6 py-4 bg-gray-50">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpeakerDetailModal;
