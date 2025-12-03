import { useState } from 'react';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Venue, VenueStatus } from '../../../types/Venue';
import VenueFormModal from '../../../components/admin/venue/VenueFormModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Mock data để test UI/UX
const MOCK_VENUES: Venue[] = [
  {
    id: 1,
    name: 'Hội trường A',
    description: 'Hội trường lớn phục vụ cho các sự kiện quy mô lớn với đầy đủ tiện nghi hiện đại',
    capacity: 200,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1519167758481-83f29da8c2b0?w=400',
    isActive: true,
    seatMap: {
      rows: 10,
      cols: 20,
      seats: Array.from({ length: 10 }, (_, r) =>
        Array.from({ length: 20 }, (_, c) => ({
          row: r,
          col: c,
          type: 'empty' as const,
          label: `${String.fromCharCode(65 + r)}${c + 1}`
        }))
      ),
      rowLabels: Array.from({ length: 10 }, (_, i) => String.fromCharCode(65 + i))
    }
  },
  {
    id: 2,
    name: 'Hội trường B',
    description: 'Hội trường vừa phù hợp cho hội thảo và workshop',
    capacity: 80,
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=400',
    isActive: true,
    seatMap: {
      rows: 8,
      cols: 10,
      seats: Array.from({ length: 8 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => ({
          row: r,
          col: c,
          type: 'empty' as const,
          label: `${String.fromCharCode(65 + r)}${c + 1}`
        }))
      ),
      rowLabels: Array.from({ length: 8 }, (_, i) => String.fromCharCode(65 + i))
    }
  },
  {
    id: 3,
    name: 'Hội trường C',
    description: 'Đang trong quá trình bảo trì và nâng cấp hệ thống âm thanh',
    capacity: 50,
    status: 'MAINTENANCE',
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400',
    isActive: true,
    seatMap: {
      rows: 5,
      cols: 10,
      seats: Array.from({ length: 5 }, (_, r) =>
        Array.from({ length: 10 }, (_, c) => ({
          row: r,
          col: c,
          type: 'empty' as const,
          label: `${String.fromCharCode(65 + r)}${c + 1}`
        }))
      ),
      rowLabels: Array.from({ length: 5 }, (_, i) => String.fromCharCode(65 + i))
    }
  },
  {
    id: 4,
    name: 'Phòng họp D',
    description: 'Phòng họp nhỏ cho các cuộc họp nội bộ',
    capacity: 50,
    status: 'ACTIVE',
    isActive: true,
  },
];

const AdminVenuePage = () => {
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    venueId: number | null;
  }>({ isOpen: false, venueId: null });

  const handleCreate = () => {
    setSelectedVenue(null);
    setIsModalOpen(true);
  };

  const handleEdit = (venue: Venue) => {
    setSelectedVenue(venue);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, venueId: id });
  };

  const confirmDelete = () => {
    const venueId = confirmModal.venueId;
    if (!venueId) return;

    // Soft delete - chuyển status sang INACTIVE
    setVenues(venues.map(v => 
      v.id === venueId 
        ? { ...v, status: 'INACTIVE' as VenueStatus, isActive: false }
        : v
    ));

    toast.success('Xóa địa điểm thành công!');
    setConfirmModal({ isOpen: false, venueId: null });
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, venueId: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVenue(null);
  };

  const handleModalSuccess = (newVenue: Venue) => {
    if (selectedVenue) {
      // Update existing venue
      setVenues(venues.map(v => v.id === newVenue.id ? newVenue : v));
      toast.success('Cập nhật địa điểm thành công!');
    } else {
      // Add new venue
      setVenues([...venues, { ...newVenue, id: venues.length + 1 }]);
      toast.success('Thêm địa điểm thành công!');
    }
    handleModalClose();
  };

  const getStatusBadge = (status: VenueStatus) => {
    const statusConfig = {
      ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      MAINTENANCE: { label: 'Đang sửa chữa', class: 'bg-yellow-100 text-yellow-800' },
      INACTIVE: { label: 'Ngừng hoạt động', class: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">;
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý địa điểm</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách hội trường và địa điểm tổ chức sự kiện</p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm địa điểm
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên địa điểm</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sức chứa</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    Chưa có địa điểm nào. Nhấn "Thêm địa điểm" để bắt đầu.
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr key={venue.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-900">{venue.id}</td>
                    <td className="px-6 py-4">
                      {venue.imageUrl ? (
                        <img
                          src={venue.imageUrl}
                          alt={venue.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{venue.name}</div>
                      {venue.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {venue.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {venue.capacity.toLocaleString()} người
                     
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(venue.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(venue)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(venue.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Xóa"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Count */}
      {venues.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{venues.length}</span> địa điểm
        </div>
      )}

      {/* Upsert Modal */}
      {isModalOpen && (
        <VenueFormModal
          venue={selectedVenue}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa địa điểm này? Địa điểm sẽ chuyển sang trạng thái ngừng hoạt động."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default AdminVenuePage;
