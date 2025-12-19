import { useState, useEffect } from "react";
import { Plus, Edit, CheckCircle, Ban } from "lucide-react";
import { toast } from "react-toastify";
import type {
  Venue,
  VenueStatus,
  CreateVenueRequest,
  UpdateVenueRequest,
} from "../../../types/Venue";
import type { Campus } from "../../../types/Campus";
import VenueFormModal from "../../../components/admin/venue/VenueFormModal";
import ConfirmModal from "../../../components/common/ConfirmModal";
import { venueService, campusService } from "../../../services";

const AdminVenuePage = () => {
  const [venues, setVenues] = useState<Venue[]>([]);
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedCampusId, setSelectedCampusId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    venueId: number | null;
  }>({ isOpen: false, venueId: null });

  const [activateModal, setActivateModal] = useState<{
    isOpen: boolean;
    venueId: number | null;
  }>({ isOpen: false, venueId: null });

  // Fetch campuses on component mount
  useEffect(() => {
    fetchCampuses();
  }, []);

  // Fetch venues when campus is selected
  useEffect(() => {
    if (selectedCampusId) {
      fetchVenues();
    }
  }, [selectedCampusId]);

  const fetchCampuses = async () => {
    try {
      const response = await campusService.getAllCampuses();
      setCampuses(response.data);

      // Auto-select first campus if available
      if (response.data.length > 0) {
        setSelectedCampusId(response.data[0].id);
      }
    } catch (error: any) {
      console.error("Error fetching campuses:", error);
      toast.error("Không thể tải danh sách campus");
    }
  };

  const fetchVenues = async () => {
    if (!selectedCampusId) return;

    try {
      setIsLoading(true);
      const response = await venueService.getAllVenues();
      const payload: any = response.data;

      // Handle both array and ApiResponse wrapper
      const venueData = Array.isArray(payload)
        ? payload
        : payload?.data || [];

      // Filter venues by selected campus
      const filteredVenues = venueData.filter(
        (venue: Venue) => venue.campusId === selectedCampusId
      );

      setVenues(filteredVenues);
    } catch (error: any) {
      console.error("Error fetching venues:", error);
      toast.error(
        error?.response?.data?.message || "Không thể tải danh sách venue"
      );
      setVenues([]);
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleActivate = (id: number) => {
    setActivateModal({ isOpen: true, venueId: id });
  };

  const confirmActivate = async () => {
    const venueId = activateModal.venueId;
    if (!venueId) return;

    try {
      await venueService.activateVenue(venueId);
      toast.success("Kích hoạt venue thành công!");

      // Refresh the venue list from API after activate
      await fetchVenues();
    } catch (error: any) {
      console.error("Error activating venue:", error);
      toast.error(
        error?.response?.data?.message || "Không thể kích hoạt venue"
      );
    } finally {
      setActivateModal({ isOpen: false, venueId: null });
    }
  };

  const cancelActivate = () => {
    setActivateModal({ isOpen: false, venueId: null });
  };

  const confirmDelete = async () => {
    const venueId = confirmModal.venueId;
    if (!venueId) return;

    try {
      await venueService.deleteVenue(venueId);

      toast.success("Xóa venue thành công!");

      // Refresh the venue list from API after delete
      await fetchVenues();
    } catch (error: any) {
      console.error("Error deleting venue:", error);
      toast.error(error?.response?.data?.message || "Không thể xóa venue");
    } finally {
      setConfirmModal({ isOpen: false, venueId: null });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, venueId: null });
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedVenue(null);
  };

  const handleModalSuccess = async (newVenue: Venue) => {
    try {
      if (selectedVenue) {
        // Update existing venue
        const updateData: UpdateVenueRequest = {
          name: newVenue.name,
          location: newVenue.location,
          mapImageUrl: newVenue.mapImageUrl || undefined,
        };

        await venueService.updateVenue(newVenue.id, updateData);
        toast.success("Cập nhật venue thành công!");
      } else {
        // Add new venue - must have campusId
        if (!selectedCampusId) {
          toast.error("Vui lòng chọn campus trước khi thêm venue");
          return;
        }

        const createData: CreateVenueRequest = {
          name: newVenue.name,
          location: newVenue.location,
          row: newVenue.row,
          column: newVenue.column,
          hasSeats: newVenue.hasSeats,
          mapImageUrl: newVenue.mapImageUrl || undefined,
          campusId: selectedCampusId,
          capacity:
            newVenue.capacity ||
            (newVenue.hasSeats ? newVenue.row * newVenue.column : 0),
        };

        await venueService.createVenue(createData);
        toast.success("Thêm venue thành công!");
      }

      // Refresh the venue list from API after create/update
      await fetchVenues();

      handleModalClose();
    } catch (error: any) {
      console.error("Error saving venue:", error);
      toast.error(error?.response?.data?.message || "Không thể lưu venue");
    }
  };

  const getStatusBadge = (status: VenueStatus) => {
    const statusConfig = {
      ACTIVE: { label: "Hoạt động", class: "bg-green-100 text-green-800" },
      MAINTENANCE: {
        label: "Đang sửa chữa",
        class: "bg-yellow-100 text-yellow-800",
      },
      INACTIVE: { label: "Ngừng hoạt động", class: "bg-red-100 text-red-800" },
    };

    const config = statusConfig[status] || statusConfig.ACTIVE;

    return (
      <span
        className={`px-3 py-1 rounded-full text-sm font-medium ${config.class}`}
      >
        {config.label}
      </span>
    );
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Venue</h1>
          <p className="text-gray-600 mt-1">
            Quản lý danh sách hội trường và địa điểm tổ chức sự kiện
          </p>
        </div>
        <button
          onClick={handleCreate}
          disabled={!selectedCampusId}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65a00] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus size={20} />
          Thêm Venue
        </button>
      </div>

      {/* Campus Selector */}
      <div className="mb-6 bg-white rounded-lg shadow-md p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn Campus <span className="text-red-500">*</span>
        </label>
        <select
          value={selectedCampusId || ""}
          onChange={(e) => setSelectedCampusId(Number(e.target.value))}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
        >
          <option value="">-- Chọn campus --</option>
          {campuses.map((campus) => (
            <option key={campus.id} value={campus.id}>
              {campus.code} - {campus.name}
            </option>
          ))}
        </select>
        {selectedCampusId && (
          <p className="mt-2 text-sm text-gray-600">
            Đang hiển thị venues của campus này
          </p>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Hình ảnh
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tên Venue
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Vị trí
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Sơ đồ ghế
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Sức chứa
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
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#F27125]"></div>
                      <span className="text-gray-500">Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : !selectedCampusId ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Vui lòng chọn campus để xem danh sách venues
                  </td>
                </tr>
              ) : venues.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Campus này chưa có venue nào. Nhấn "Thêm Venue" để bắt đầu.
                  </td>
                </tr>
              ) : (
                venues.map((venue) => (
                  <tr
                    key={venue.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {venue.id}
                    </td>
                    <td className="px-6 py-4">
                      {venue.mapImageUrl ? (
                        <img
                          src={venue.mapImageUrl}
                          alt={venue.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">
                            No image
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {venue.name}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {venue.location}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {venue.hasSeats
                        ? `${venue.row} x ${venue.column}`
                        : "Không có ghế"}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-[#F27125]">
                        {venue.capacity ||
                          (venue.hasSeats ? venue.row * venue.column : 0)}
                        <span className="text-gray-500 font-normal">người</span>
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(venue.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(venue)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        {venue.status === "INACTIVE" ? (
                          <button
                            onClick={() => handleActivate(venue.id)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Kích hoạt lại"
                          >
                            <CheckCircle size={18} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDelete(venue.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Vô hiệu hóa"
                          >
                            <Ban size={18} />
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
      {venues.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{venues.length}</span> venue
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

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận vô hiệu hóa"
        message="Bạn có chắc chắn muốn vô hiệu hóa venue này? Venue sẽ chuyển sang trạng thái ngừng hoạt động."
        confirmText="Vô hiệu hóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />

      {/* Activate Confirm Modal */}
      <ConfirmModal
        isOpen={activateModal.isOpen}
        title="Xác nhận kích hoạt"
        message="Bạn có chắc chắn muốn kích hoạt lại venue này? Venue sẽ chuyển sang trạng thái hoạt động."
        confirmText="Kích hoạt"
        cancelText="Hủy"
        type="success"
        onConfirm={confirmActivate}
        onCancel={cancelActivate}
      />
    </div>
  );
};

export default AdminVenuePage;
