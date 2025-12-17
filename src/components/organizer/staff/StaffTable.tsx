import { Eye, Shield, Trash2 } from 'lucide-react';
import type { eventStaff } from '../../../types/Event';
import type { User } from '../../../types/User';
import { useState } from 'react';
import { organizerService, userService } from '../../../services';
import UserDetailModal from '../../admin/user/UserDetailModal';
import { ConfirmModal } from '../..';
import { toast } from 'react-toastify';
import ActionDropdown from '../../ActionDropdown';

interface StaffTableProps {
  staffList: eventStaff[];
  onDeleteStaff: (staffId: number) => void;
  eventId: string;
}



const StaffTable = ({ staffList, onDeleteStaff, eventId }: StaffTableProps) => {
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [confirmModal, setConfirmModal] = useState<{
      isOpen: boolean;
      userId: number | null;
    }>({ isOpen: false, userId: null });
    
    
//   const getRoleBadge = (role: StaffRole) => {
//     const roleConfig: Record<StaffRole, { label: string; className: string }> = {
//       CHECK_IN: { label: 'Check-in', className: 'bg-blue-100 text-blue-700' },
//       SUPPORT: { label: 'Hỗ trợ', className: 'bg-green-100 text-green-700' },
//       COORDINATOR: { label: 'Điều phối', className: 'bg-purple-100 text-purple-700' },
//     };

//     const config = roleConfig[role];
//     return (
//       <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.className}`}>
//         {config.label}
//       </span>
//     );
//   };


const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedUser(null);
  };

const handleViewDetail = async(id: number) => {
    
    setIsLoading(true);
    try {
        const response = await userService.getUserById(id);
        if(response.status === 200){
           setSelectedUser(response.data.data);
           console.log(response.data);
           setIsDetailModalOpen(true);
        }
    } catch (error) {
        console.error("Error fetching user details:", error);
    } finally {
        setIsLoading(false);
    }
};

const handleDeleteClick = ( userId: number) => {
    setConfirmModal({ isOpen: true,  userId });
};

const confirmDelete = async () => {
    if (!confirmModal.userId) return;

    setIsLoading(true);
    try {
        const response = await organizerService.deleteEventStaff(eventId, confirmModal.userId);
        
        if (response.status === 200 || response.data.success) {
            toast.success("Xóa staff khỏi sự kiện thành công");
            onDeleteStaff(confirmModal.userId);
            setConfirmModal({ isOpen: false, userId: null });
        }
    } catch (error: any) {
        console.error('Error deleting staff:', error);
        const errorMessage = error.response?.data?.message || 
                            error.response?.data?.data?.message || 
                            'Không thể xóa staff khỏi sự kiện!';
        toast.error(errorMessage);
    } finally {
        setIsLoading(false);
        setConfirmModal({ isOpen: false, userId: null });
    }
};
      


      

const cancelDelete = () => {
    setConfirmModal({ isOpen: false, userId: null });
};


  return (
    <div className="bg-white rounded-lg shadow-md">
        <div className="overflow-x-auto" style={{ overflow: 'visible' }}>
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                ID
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Người dùng
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Campus
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Email
              </th>
              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                Trạng thái
              </th>
              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center">
                  <Shield className="mx-auto text-gray-400 mb-3" size={48} />
                  <p className="text-gray-600">
                    Chưa có staff nào được phân công cho sự kiện này
                  </p>
                </td>
              </tr>
            ) : (
              staffList.map((staff) => (
                <tr key={staff.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {staff.id}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {staff.user.avatar ? (
                        <img 
                          src={staff.user.avatar} 
                          alt={staff.user.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-linear-to-br from-[#F27125] to-[#d95c0b] flex items-center justify-center text-white font-semibold">
                          {staff.user.firstName.charAt(0)}{staff.user.lastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {staff.user.firstName} {staff.user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">@{staff.user.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {staff.user.campus?.name}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                        <a
                        href={`mailto:${staff.user?.email}`}
                        className="text-sm text-[#F27125] hover:text-[#d95c0b] hover:underline"
                      >{staff.user?.email}</a>
                      </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${staff.user?.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {staff.user?.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 relative overflow-visible">
                      
                      <ActionDropdown
                        actions={[
                          {
                            label: 'Xem chi tiết',
                            onClick: () => handleViewDetail(staff.user.id),
                            icon: Eye,
                           
                          },
                          {
                            label: 'Xóa',
                            onClick: () => handleDeleteClick(staff.user.id),
                            icon: Trash2,
                            type: 'danger',
                          }
                        ]}
                      />
                    {/* <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleViewDetail(staff.user.id)}
                          disabled={isLoading}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xem chi tiết"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(staff.user.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div> */}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {!isLoading && staffList.length >= 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Tổng số: <span className="font-semibold">{staffList.length}</span> Staff
          </p>
        </div>
      )}

      <UserDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        user={selectedUser}
      />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận xóa Staff"
        message="Bạn có chắc chắn muốn xóa staff này khỏi sự kiện? Hành động này không thể hoàn tác."
        confirmText={isLoading ? "Đang xóa..." : "Xác nhận"}
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default StaffTable;
