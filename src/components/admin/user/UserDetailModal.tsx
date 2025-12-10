import React from 'react';
import { X, Mail, Phone, MapPin, Calendar, User as UserIcon, Building2, CreditCard, Image } from 'lucide-react';
import type { User } from '../../../types/User';

interface UserDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ isOpen, onClose, user }) => {
  if (!isOpen || !user) return null;

  const getCampusName = (campusId: number) => {
    const campuses: { [key: number]: string } = {
      1: 'FU - Hòa Lạc',
      2: 'FU - Hồ Chí Minh',
      3: 'FU - Đà Nẵng',
      4: 'FU - Cần Thơ',
      5: 'FU - Quy Nhơn'
    };
    return campuses[campusId] || 'N/A';
  };

  const getRoleLabel = (role: string) => {
    const roles: { [key: string]: string } = {
      event_organizer: 'Event Organizer',
      staff: 'Staff',
      student: 'Student',
      admin: 'Admin'
    };
    return roles[role] || role;
  };

  const getStatusBadge = (status?: string) => {
    const statusMap: { [key: string]: { label: string; className: string } } = {
      APPROVED: { label: 'Đã duyệt', className: 'bg-green-100 text-green-800' },
      PENDING: { label: 'Chờ duyệt', className: 'bg-yellow-100 text-yellow-800' },
      REJECTED: { label: 'Từ chối', className: 'bg-red-100 text-red-800' }
    };
    return statusMap[status || ''] || { label: 'N/A', className: 'bg-gray-100 text-gray-800' };
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-center items-center p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-2/3 max-w-[95vw] shadow-2xl transform transition-all duration-300 flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
        style={{ height: 'calc(100vh - 4rem)', maxHeight: '90vh' }}
      >
        {/* Header - Fixed with Gradient */}
        <div className="relative bg-gradient-to-r from-[#F27125] to-[#d95c0b] px-5 py-3 shrink-0 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.userName}
                  className="w-12 h-12 rounded-full object-cover border-3 border-white shadow-lg"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#F27125] font-bold text-lg shadow-lg">
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </div>
              )}
              <div className="text-white">
                <h2 className="text-lg font-bold drop-shadow-sm">
                  {user.firstName} {user.lastName}
                </h2>
                <p className="text-white/90 text-xs">@{user.userName} • ID: {user.id}</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-white/80 hover:text-white transition-all p-1.5 hover:bg-white/20 rounded-lg backdrop-blur-sm"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content - 2 Columns, No Scroll */}
        <div className="flex-1 p-4 overflow-hidden bg-gray-50">
          <div className="grid grid-cols-2 gap-3 h-full">
            {/* Left Column */}
            <div className="flex flex-col gap-2 h-full overflow-hidden">
              {/* Student Card - Takes up 2/3 of the space */}
              {user.studentCardImage ? (
                <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex-[2] min-h-0 flex flex-col">
                  <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                    <div className="p-0.5 bg-indigo-50 rounded">
                      <CreditCard size={12} className="text-indigo-600" />
                    </div>
                    <span>Thẻ sinh viên</span>
                  </h3>
                  <div className="flex-1 min-h-0 flex items-center justify-center bg-gray-50 rounded-lg p-2 overflow-hidden">
                    <img 
                      src={user.studentCardImage} 
                      alt="Student Card"
                      className="max-w-full max-h-full rounded object-contain shadow-lg border border-white"
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg p-2 shadow-sm border border-dashed border-gray-300 flex-[2] min-h-0 flex items-center justify-center">
                  <div className="text-center text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-1.5 bg-gray-100 rounded-full flex items-center justify-center">
                      <CreditCard size={24} />
                    </div>
                    <p className="text-xs font-medium">Chưa có thẻ SV</p>
                  </div>
                </div>
              )}

              {/* Basic Info - Takes up 1/3 of the space */}
              <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex-1 min-h-0 overflow-auto">
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <div className="p-0.5 bg-orange-50 rounded">
                    <UserIcon size={12} className="text-[#F27125]" />
                  </div>
                  <span>Thông tin cơ bản</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                    <label className="font-medium text-gray-500 uppercase text-[10px]">Username</label>
                    <p className="text-gray-900 font-semibold text-xs">{user.userName}</p>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                    <label className="font-medium text-gray-500 uppercase text-[10px]">Họ tên</label>
                    <p className="text-gray-900 font-semibold text-xs">{user.firstName} {user.lastName}</p>
                  </div>
                  <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                    <label className="font-medium text-gray-500 uppercase text-[10px]">Giới tính</label>
                    <p className="text-gray-900 font-semibold text-xs">
                      {user.gender === true ? 'Nam' : user.gender === false ? 'Nữ' : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-2 h-full overflow-hidden">
              {/* Contact Info */}
              <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <div className="p-0.5 bg-blue-50 rounded">
                    <Mail size={12} className="text-blue-600" />
                  </div>
                  <span>Liên hệ</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="p-1.5 bg-gradient-to-r from-orange-50 to-white rounded border border-orange-100">
                    <label className="font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                      <Mail size={10} className="text-orange-500" />
                      <span className="uppercase text-[10px]">Email</span>
                    </label>
                    <a 
                      href={`mailto:${user.email}`}
                      className="text-[#F27125] hover:text-[#d95c0b] font-semibold block truncate text-xs"
                      title={user.email}
                    >
                      {user.email}
                    </a>
                  </div>
                  {user.phoneNumber && (
                    <div className="p-1.5 bg-gradient-to-r from-green-50 to-white rounded border border-green-100">
                      <label className="font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                        <Phone size={10} className="text-green-500" />
                        <span className="uppercase text-[10px]">SĐT</span>
                      </label>
                      <p className="text-gray-900 font-semibold text-xs">{user.phoneNumber}</p>
                    </div>
                  )}
                  {user.address && (
                    <div className="p-1.5 bg-gradient-to-r from-purple-50 to-white rounded border border-purple-100">
                      <label className="font-medium text-gray-500 flex items-center gap-1 mb-0.5">
                        <MapPin size={10} className="text-purple-500" />
                        <span className="uppercase text-[10px]">Địa chỉ</span>
                      </label>
                      <p className="text-gray-900 font-medium line-clamp-2 text-xs" title={user.address}>{user.address}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Academic Info */}
              <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <div className="p-0.5 bg-purple-50 rounded">
                    <Building2 size={12} className="text-purple-600" />
                  </div>
                  <span>Học tập</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                    <label className="font-medium text-gray-500 uppercase text-[10px]">Campus</label>
                    <p className="text-gray-900 font-semibold text-xs">🏫 {getCampusName(user.campus?.id || user.campusId)}</p>
                  </div>
                  {user.studentCode && (
                    <div className="flex justify-between items-center p-1 bg-gray-50 rounded">
                      <label className="font-medium text-gray-500 flex items-center gap-0.5 uppercase text-[10px]">
                        <CreditCard size={10} />
                        Mã SV
                      </label>
                      <p className="text-gray-900 font-mono font-bold text-xs">{user.studentCode}</p>
                    </div>
                  )}
                  <div className="p-1.5 bg-gradient-to-r from-purple-50 to-pink-50 rounded border border-purple-200">
                    <label className="font-medium text-gray-500 uppercase text-[10px] mb-0.5 block">Vai trò</label>
                    <p className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-gradient-to-r from-purple-600 to-pink-600 text-white">
                      {getRoleLabel(user.roleName)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Status Info */}
              <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
                <h3 className="text-xs font-semibold text-gray-900 mb-1.5 flex items-center gap-1.5 pb-1.5 border-b border-gray-200">
                  <div className="p-0.5 bg-green-50 rounded">
                    <Calendar size={12} className="text-green-600" />
                  </div>
                  <span>Trạng thái</span>
                </h3>
                <div className="space-y-1.5 text-xs">
                  {user.status && (
                    <div className="p-1.5 bg-gradient-to-br from-yellow-50 to-orange-50 rounded border border-yellow-200">
                      <label className="font-medium text-gray-500 uppercase text-[10px] mb-1 block">Duyệt</label>
                      <p className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${getStatusBadge(user.status).className}`}>
                        {getStatusBadge(user.status).label}
                      </p>
                    </div>
                  )}
                  <div className="p-1.5 bg-gradient-to-br from-green-50 to-emerald-50 rounded border border-green-200">
                    <label className="font-medium text-gray-500 uppercase text-[10px] mb-1 block">Hoạt động</label>
                    <p className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      user.isActive ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                    }`}>
                      {user.isActive ? '✓ Hoạt động' : '✕ Vô hiệu'}
                    </p>
                  </div>
                  {/* <div className="p-1.5 bg-gradient-to-br from-blue-50 to-indigo-50 rounded border border-blue-200">
                    <label className="font-medium text-gray-500 uppercase text-[10px] mb-1 block">📅 Ngày tạo</label>
                    <p className="text-gray-900 font-bold text-xs">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                    <p className="text-gray-600 text-[10px]">
                      🕐 {new Date(user.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div> */} 
                  {user.googleId && (
                    <div className="p-1.5 bg-gradient-to-br from-indigo-50 to-purple-50 rounded border border-indigo-200">
                      <label className="font-medium text-gray-500 uppercase text-[10px] mb-1 block">🔗 Google ID</label>
                      <p className="text-gray-900 font-mono text-[10px] break-all">{user.googleId}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Fixed */}
        <div className="border-t px-4 py-2.5 shrink-0 bg-gradient-to-r from-gray-50 to-white rounded-b-2xl">
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg hover:from-gray-700 hover:to-gray-800 transition-all font-semibold text-xs shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailModal;
