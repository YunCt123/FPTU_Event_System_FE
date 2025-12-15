

import { X } from "lucide-react";
import { useState, useEffect } from "react";
import { speakerService } from "../../../services";
import type {SpeakerResponse} from "../../../types/Speaker";
import { toast } from "react-toastify";

interface AssignSpeakerModalProps {
  selectedEventId: string;
  onClose: () => void;
  onSuccess?: () => void;
}

const AssignSpeakerModal = ({ selectedEventId, onClose, onSuccess }: AssignSpeakerModalProps) => {
  const [speakers, setSpeakers] = useState<SpeakerResponse[]>([]);
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<number | null>(null);
  const [topic, setTopic] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<"internal" | "external" | "">("");

  const fetchSpeakers = async (page: number, append: boolean = false) => {
    setIsLoading(true);
    setError("");
    try {
      const params: any = {
        page,
        limit: 10,
      };
      
      if (searchQuery) {
        params.search = searchQuery;
      }
      
      if (selectedType) {
        params.type = selectedType;
      }

      const response = await speakerService.getAllSpeaker(params);
      
      if (response.status === 200) {
        const newSpeakers = response.data.data;
        const meta = response.data.meta;
        
        if (append) {
          setSpeakers(prev => [...prev, ...newSpeakers]);
        } else {
          setSpeakers(newSpeakers);
        }
        
        setTotalPages(meta.totalPages);
        setCurrentPage(page);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Có lỗi khi tải danh sách speaker");
      console.error("Error fetching speakers:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSpeakers(1, false);
  }, [searchQuery, selectedType]);

  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchSpeakers(currentPage + 1, true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!selectedSpeakerId) {
      setError("Vui lòng chọn speaker");
      return;
    }

    if (!topic.trim()) {
      setError("Vui lòng nhập chủ đề");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await speakerService.assignSpeaker(selectedEventId, {
        speakerId: selectedSpeakerId,
        topic: topic.trim(),
      });

      if (response.status === 200 || response.status === 201) {
        toast.success("Phân công speaker thành công!");
        onSuccess?.();
        onClose();
      } else {
        const errorMsg = "Có lỗi xảy ra khi phân công speaker";
        setError(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || "Có lỗi xảy ra khi phân công speaker";
      setError(errorMsg);
      toast.error(errorMsg);
      console.error("Error assigning speaker:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 rounded-t-2xl bg-linear-to-r from-[#F27125] to-[#d65d1a]">
          <h2 className="text-2xl font-bold text-white">Phân Công Speaker</h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Search */}
            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm Speaker
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm theo tên, công ty..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
              />
            </div> */}

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Loại Speaker
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as "internal" | "external" | "")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
              >
                <option value="">Tất cả</option>
                <option value="internal">Nội bộ</option>
                <option value="external">Bên ngoài</option>
              </select>
            </div>

            {/* Speaker Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn Speaker <span className="text-red-500">*</span>
              </label>
              <select
                value={selectedSpeakerId || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === "load_more") {
                    handleLoadMore();
                    e.target.value = ""; // Reset select after loading more
                  } else {
                    setSelectedSpeakerId(Number(value) || null);
                  }
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                required
                disabled={isLoading}
              >
                <option value="">-- Chọn speaker --</option>
                {speakers.map((speaker) => (
                  <option key={speaker.id} value={speaker.id}>
                    {speaker.name} - {speaker.company} ({speaker.type})
                  </option>
                ))}
                {currentPage < totalPages && (
                  <option value="load_more" className="font-semibold text-blue-600">
                    Tải thêm speaker (Trang {currentPage + 1}/{totalPages})
                  </option>
                )}
              </select>
              {isLoading && (
                <p className="text-sm text-blue-600 mt-1">Đang tải danh sách speaker...</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Đang hiển thị {speakers.length} speaker{currentPage < totalPages && ` - Còn ${totalPages - currentPage} trang nữa`}
              </p>
            </div>

            {/* Selected Speaker Info */}
            {selectedSpeakerId && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                {speakers.find(s => s.id === selectedSpeakerId) && (
                  <div className="flex items-center gap-3">
                    {speakers.find(s => s.id === selectedSpeakerId)?.avatar && (
                      <img
                        src={speakers.find(s => s.id === selectedSpeakerId)?.avatar}
                        alt={speakers.find(s => s.id === selectedSpeakerId)?.name}
                        className="h-16 w-16 rounded-full object-cover border-2 border-white"
                      />
                    )}
                    <div>
                      <p className="font-semibold text-gray-900">
                        {speakers.find(s => s.id === selectedSpeakerId)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        {speakers.find(s => s.id === selectedSpeakerId)?.company}
                      </p>
                      <p className="text-xs text-gray-500">
                        {speakers.find(s => s.id === selectedSpeakerId)?.bio}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chủ đề <span className="text-red-500">*</span>
              </label>
              <textarea
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="Nhập chủ đề mà speaker sẽ trình bày..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent resize-none"
                required
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 p-6 border-t border-gray-200 rounded-b-2xl bg-gray-50">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isLoading}
              className="px-6 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "Đang phân công..." : "Phân Công"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignSpeakerModal;