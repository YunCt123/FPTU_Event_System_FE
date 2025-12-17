import { X, Mail, User, Calendar, RefreshCw, Building2 } from 'lucide-react'
import type { OrganizerResponse } from '../../../types/Organizer'

interface OrganizerDetailModalProps {
  organizer: OrganizerResponse | null;
  isOpen: boolean;
  onClose: () => void;
}

const OrganizerDetailModal: React.FC<OrganizerDetailModalProps> = ({ organizer, onClose }) => {
  if (!organizer) return null;

  const ownerName = organizer.owner 
    ? `${organizer.owner.firstName || ''} ${organizer.owner.lastName || ''}`.trim() 
    : 'Chưa có';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 shrink-0 from-[#F27125] to-[#d95c0b] rounded-t-2xl">
          <h2 className="text-xl font-bold text-white">Chi tiết nhà tổ chức</h2>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-lg"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          <div className="flex gap-6">
            {/* Left - Logo */}
            <div className="shrink-0">
              {organizer.logoUrl ? (
                <div className="relative">
                  <img
                    src={organizer.logoUrl}
                    alt={organizer.name}
                    className="w-48 h-48 object-contain rounded-xl shadow-lg border-2 border-gray-100 bg-white p-3"
                  />
                  <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-[#F27125] px-3 py-1 rounded-full shadow">
                    <p className="text-[10px] font-semibold text-white whitespace-nowrap">Logo chính thức</p>
                  </div>
                </div>
              ) : (
                <div className="w-48 h-48 bg-linear-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center shadow-lg">
                  <div className="text-center">
                    <Building2 size={48} className="text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">Chưa có logo</p>
                  </div>
                </div>
              )}
            </div>

            {/* Right - Info */}
            <div className="flex-1 min-w-0">
              {/* Name & Tags */}
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-gray-900 mb-2 truncate">{organizer.name}</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-[#F27125]/10 text-[#F27125] px-3 py-1 rounded-full text-xs font-semibold">
                    ID: {organizer.id}
                  </span>
                  <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                    {organizer.campus?.name || 'N/A'}
                  </span>
                </div>
              </div>

              {/* Description */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 line-clamp-3">
                  {organizer.description || 'Chưa có mô tả'}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Email */}
                <div className="flex items-center gap-3 bg-orange-50 px-4 py-3 rounded-lg">
                  <div className="w-9 h-9 bg-[#F27125] rounded-lg flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Email liên hệ</p>
                    <a href={`mailto:${organizer.contactEmail}`} className="text-sm font-medium text-gray-900 hover:text-[#F27125] truncate block">
                      {organizer.contactEmail}
                    </a>
                  </div>
                </div>

                {/* Owner */}
                <div className="flex items-center gap-3 bg-blue-50 px-4 py-3 rounded-lg">
                  <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center shrink-0">
                    <User size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Event Organizer</p>
                    <p className="text-sm font-medium text-gray-900 truncate">{ownerName}</p>
                  </div>
                </div>

                {/* Created At */}
                <div className="flex items-center gap-3 bg-green-50 px-4 py-3 rounded-lg">
                  <div className="w-9 h-9 bg-green-600 rounded-lg flex items-center justify-center shrink-0">
                    <Calendar size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Ngày tạo</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organizer.createdAt ? new Date(organizer.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>

                {/* Updated At */}
                <div className="flex items-center gap-3 bg-purple-50 px-4 py-3 rounded-lg">
                  <div className="w-9 h-9 bg-purple-600 rounded-lg flex items-center justify-center shrink-0">
                    <RefreshCw size={18} className="text-white" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Cập nhật cuối</p>
                    <p className="text-sm font-medium text-gray-900">
                      {organizer.updatedAt ? new Date(organizer.updatedAt).toLocaleDateString('vi-VN') : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 shrink-0 from-[#F27125] to-[#d95c0b] text-white rounded-lg hover:shadow-lg transition-all font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrganizerDetailModal
