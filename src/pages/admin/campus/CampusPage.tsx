import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, CheckCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Campus, Status, CreateCampusRequest, UpdateCampusRequest } from '../../../types/Campus';
import CampusFormModal from '../../../components/admin/campus/CampusFormModal';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { campusService } from '../../../services';


const CampusPage = () => {
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCampus, setSelectedCampus] = useState<Campus | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    campusId: number | null;
  }>({ isOpen: false, campusId: null });
  
  const [activateModal, setActivateModal] = useState<{
    isOpen: boolean;
    campusId: number | null;
  }>({ isOpen: false, campusId: null });

  // Fetch campuses from API on component mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  const fetchCampuses = async () => {
    try {
      setIsLoading(true);
      const response = await campusService.getAllCampuses();
      setCampuses(response.data);
    } catch (error: any) {
      console.error('Error fetching campuses:', error);
      toast.error(error?.response?.data?.message || 'Không thể tải danh sách campus');
      setCampuses([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleActivate = (id: number) => {
    setActivateModal({ isOpen: true, campusId: id });
  };

  const confirmActivate = async () => {
    const campusId = activateModal.campusId;
    if (!campusId) return;

    try {
      await campusService.activateCampus(campusId);
      toast.success('Kích hoạt campus thành công!');
      
      // Refresh the campus list from API after activate
      await fetchCampuses();
    } catch (error: any) {
      console.error('Error activating campus:', error);
      toast.error(error?.response?.data?.message || 'Không thể kích hoạt campus');
    } finally {
      setActivateModal({ isOpen: false, campusId: null });
    }
  };

  const cancelActivate = () => {
    setActivateModal({ isOpen: false, campusId: null });
  };

  const confirmDelete = async () => {
    const campusId = confirmModal.campusId;
    if (!campusId) return;

    try {
      await campusService.deleteCampus(campusId);
      toast.success('Xóa campus thành công!');
      
      // Refresh the campus list from API after delete
      await fetchCampuses();
    } catch (error: any) {
      console.error('Error deleting campus:', error);
      toast.error(error?.response?.data?.message || 'Không thể xóa campus');
    } finally {
      setConfirmModal({ isOpen: false, campusId: null });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, campusId: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedCampus(null);
  };

  const handleModalSuccess = async (newCampus: Campus) => {
    try {
      if (selectedCampus) {
        // Update existing campus
        const updateData: UpdateCampusRequest = {
          code: newCampus.code,
          name: newCampus.name,
          address: newCampus.address,
          capacity: newCampus.capacity || null,
          image: newCampus.image || undefined,
        };
        
        await campusService.updateCampus(newCampus.id, updateData);
        toast.success('Cập nhật campus thành công!');
      } else {
        // Add new campus
        const createData: CreateCampusRequest = {
          code: newCampus.code,
          name: newCampus.name,
          address: newCampus.address,
          capacity: newCampus.capacity || null,
          image: newCampus.image || undefined,
        };
        
        await campusService.createCampus(createData);
        toast.success('Thêm campus thành công!');
      }
      
      // Refresh the campus list from API after create/update
      await fetchCampuses();
      handleModalClose();
    } catch (error: any) {
      console.error('Error saving campus:', error);
      toast.error(error?.response?.data?.message || 'Không thể lưu campus');
    }
  };

  const getStatusBadge = (status: Status) => {
    const statusConfig = {
      Active: { label: 'Hoạt động', class: 'bg-green-100 text-green-800' },
      Inactive: { label: 'Ngừng hoạt động', class: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status] || statusConfig.Inactive;
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
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65a00] transition-colors"
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
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F27125]"></div>
                      <span className="text-gray-500">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : campuses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có campus nào. Nhấn "Thêm Campus" để bắt đầu.
                  </td>
                </tr>
              ) : (
                campuses.map((campus) => (
                  <tr key={campus.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-bold text-blue-600">
                        {campus.code}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {campus.image ? (
                        <img
                          src={campus.image}
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
                      {campus.capacity && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {campus.capacity}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs line-clamp-2">
                        {campus.address}
                      </div>
                    </td>
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
                        {campus.status === 'Inactive' ? (
                          <button
                            onClick={() => handleActivate(campus.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Kích hoạt lại"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(campus.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Xóa"
                          >
                            <Trash2 size={18} />
                          </button>
                        )}
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

      {/* Delete Confirm Modal */}
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

      {/* Activate Confirm Modal */}
      <ConfirmModal
        isOpen={activateModal.isOpen}
        title="Xác nhận kích hoạt"
        message="Bạn có chắc chắn muốn kích hoạt lại campus này? Campus sẽ chuyển sang trạng thái hoạt động."
        confirmText="Kích hoạt"
        cancelText="Hủy"
        type="success"
        onConfirm={confirmActivate}
        onCancel={cancelActivate}
      />
    </div>
  );
};

export default CampusPage;
