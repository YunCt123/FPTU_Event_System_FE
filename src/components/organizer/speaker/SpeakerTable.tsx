import { Trash2, Eye } from "lucide-react";
import type { eventSpeaker } from "../../../types/Event";
import { useState } from "react";
import ActionDropdown from "../../ActionDropdown";
import { speakerService } from "../../../services";
import { toast } from "react-toastify";
import { ConfirmModal } from "../..";
import SpeakerDetailModal from "./SpeakerDetailModal";

interface SpeakerTableProps {
  speakers: eventSpeaker[];
  onDelete?: () => void;
  eventId: string;
}

const SpeakerTable = ({ speakers, onDelete, eventId }: SpeakerTableProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [speakerId, setSpeakerId] = useState<number | null>(null);
    const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      speakerId: number | null;
    }>({ isOpen: false, speakerId: null });

    const handleDeleteClick = ( speakerId: number) => {
        setConfirmModal({ isOpen: true,  speakerId });
    };
   
    const handleComfirmDelete = async() => {
        if (!confirmModal.speakerId) return;
        setIsLoading(true);
        try{
            const response = await speakerService.deleteSpeaker(eventId, confirmModal.speakerId);
            if(response.status === 200){
                toast.success("Xóa speaker thành công");
                onDelete?.();
            }
        }catch(error){
            toast.error("Xóa speaker thất bại: " + error);
        }finally{
            setIsLoading(false);
            setConfirmModal({ isOpen: false, speakerId: null });
                }
            }

    const cancelDelete = () => {
        setConfirmModal({ isOpen: false, speakerId: null });
    };

    const handleViewDetail = (speakerId: number) => {
        setIsDetailModalOpen(true);
        setSpeakerId(speakerId);
    };


  if (speakers.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
        <p className="text-gray-600">Không có speaker nào cho sự kiện này</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
        <table className="w-full" style={{ overflow: 'visible' }}>
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tên Speaker
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Chủ đề
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Loại
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Công ty
              </th>
              {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bio
              </th> */}
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
               
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {speakers.map((eventSpeaker) => {
              const speaker = eventSpeaker.speaker;
              if (!speaker) return null;
              
              return (
                <tr key={eventSpeaker.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {speaker.avatar && (
                        <img
                          src={speaker.avatar}
                          alt={speaker.name}
                          className="h-10 w-10 rounded-full object-cover mr-3"
                        />
                      )}
                      <div className="text-sm font-medium text-gray-900">
                        {speaker.name}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{eventSpeaker.topic}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      {speaker.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{speaker.company}</div>
                  </td>
                  {/* <td className="px-6 py-4">
                    <div className="text-sm text-gray-500 max-w-xs truncate">
                      {speaker.bio}
                    </div>
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium relative overflow-visible">
                    <div className="flex justify-end gap-2">
                      <ActionDropdown
                        actions={[
                            {
                                label: "Chi tiết",
                                icon: Eye,
                                onClick: () => handleViewDetail(eventSpeaker.speaker.id),
                            },

                            {
                                label: "Xóa",
                                icon: Trash2,
                                onClick: () => handleDeleteClick(eventSpeaker.speaker.id),
                                danger: true,
                            }
                        ]}
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {speakers.length >= 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Tổng số: <span className="font-semibold">{speakers.length}</span> Speaker
          </p>
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận xóa Speaker khỏi sự kiện này"
        message="Bạn có chắc chắn muốn xóa speaker này khỏi sự kiện? Hành động này không thể hoàn tác."
        confirmText={isLoading ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        onConfirm={handleComfirmDelete}
        onCancel={cancelDelete}
      />

      {isDetailModalOpen && speakerId !== null && (
        <SpeakerDetailModal
          speakerId={speakerId}
          onClose={() => {
            setIsDetailModalOpen(false);
            setSpeakerId(null);
          }}
        />
      )}
    </div>
  );
};

export default SpeakerTable;