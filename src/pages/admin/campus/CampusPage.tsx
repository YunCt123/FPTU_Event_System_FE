import { useState } from 'react';
import { Plus, Edit, Trash2, MapPin } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Campus, CampusStatus } from '../../../types/Campus';
import CampusFormModal from '../../../components/admin/campus/CampusFormModal';
import ConfirmModal from '../../../components/common/ConfirmModal';

// Mock data để test UI/UX
const MOCK_CAMPUSES: Campus[] = [
  {
    id: 1,
    code: 'HCM',
    name: 'Campus Hồ Chí Minh',
    address: 'Lô E2a-7, Đường D1, Khu Công nghệ cao, P.Long Thạnh Mỹ, TP. Thủ Đức',
    city: 'Hồ Chí Minh',
    description: 'Campus lớn nhất với đầy đủ cơ sở vật chất hiện đại',
    imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=400',
    status: 'ACTIVE',
    isActive: true,
  },
  {
    id: 2,
    code: 'HN',
    name: 'Campus Hà Nội',
    address: 'Khu Công nghệ cao Hòa Lạc, Km29 Đại lộ Thăng Long, Hà Nội',
    city: 'Hà Nội',
    description: 'Campus tại thủ đô với nhiều hội trường và phòng học hiện đại',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400',
    status: 'ACTIVE',
    isActive: true,
  },
  {
    id: 3,
    code: 'DN',
    name: 'Campus Đà Nẵng',
    address: 'Khu đô thị công nghệ FPT Đà Nẵng, Ngũ Hành Sơn',
    city: 'Đà Nẵng',
    description: 'Campus ven biển với không gian xanh mát',
    imageUrl: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400',
    status: 'ACTIVE',
    isActive: true,
  },
  {
    id: 4,
    code: 'CT',
    name: 'Campus Cần Thơ',
    address: '600 Nguyễn Văn Cừ nối dài, P. An Bình, Q. Ninh Kiều, TP. Cần Thơ',
    city: 'Cần Thơ',
    description: 'Campus miền Tây đang trong quá trình mở rộng',
    imageUrl: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=400',
    status: 'INACTIVE',
    isActive: false,
  },
];

const CampusPage = () => {
  const [campuses, setCampuses] = useState<Campus[]>(MOCK_CAMPUSES);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    campusId: number | null;
  }>({ isOpen: false, campusId: null });

  const handleCreate = () => {
    setSelectedCampus(null);
    setIsModalOpen(true);
  };

  const handleEdit = (campus: Campus) => {
    setSelectedCampus(campus);
    setIsModalOpen(true);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, campusId: id });
  };

  const confirmDelete = () => {
    const campusId = confirmModal.campusId;
    if (!campusId) return;

    // Soft delete - chuyển status sang INACTIVE
    setCampuses(
      campuses.map((c) =>
        c.id === campusId
          ? { ...c, status: 'INACTIVE' as CampusStatus, isActive: false }
          : c
      )
    );

    toast.success('Xóa campus thành công!');
    setConfirmModal({ isOpen: false, campusId: null });
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, campusId: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCampus(null);
  };

  const handleModalSuccess = (newCampus: Campus) => {
    if (selectedCampus) {
      // Update existing campus
      setCampuses(campuses.map((c) => (c.id === newCampus.id ? newCampus : c)));
      toast.success('Cập nhật campus thành công!');
    } else {
      // Add new campus
      setCampuses([...campuses, { ...newCampus, id: campuses.length + 1 }]);
      toast.success('Thêm campus thành công!');
    }
    handleModalClose();
  };

  const getStatusBadge = (status: CampusStatus) => {
    const statusConfig = {
      ACTIVE: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      INACTIVE: { label: 'Ngừng hoạt động', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.INACTIVE;

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Campus</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách các cơ sở campus của trường
          </p>
        </div>
        <button
          onClick={handleCreate}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          Thêm Campus
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Mã
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Hình ảnh
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tên Campus
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Địa chỉ
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Thành phố
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {campuses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có campus nào. Nhấn "Thêm Campus" để bắt đầu.
                  </td>
                </tr>
              ) : (
                campuses.map((campus) => (
                  <tr key={campus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded">
                        <MapPin size={14} />
                        {campus.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {campus.imageUrl ? (
                        <img
                          src={campus.imageUrl}
                          alt={campus.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {campus.name}
                      </div>
                      {campus.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {campus.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                        {campus.address}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">{campus.city}</td>
                    <td className="px-6 py-4">{getStatusBadge(campus.status)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(campus)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(campus.id)}
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
      {campuses.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{campuses.length}</span> campus
        </div>
      )}

      {/* Upsert Modal */}
      {isModalOpen && (
        <CampusFormModal
          campus={selectedCampus}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa campus này? Campus sẽ chuyển sang trạng thái ngừng hoạt động."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};

export default CampusPage;
