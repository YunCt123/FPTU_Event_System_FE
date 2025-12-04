import React, { useState, useEffect } from "react";
import OrganizerModal from "./OrganizerModal";
import AddOrganizerModal from "./AddOrganizerModal";
import { Search, Plus, Trash2, Eye, Edit } from "lucide-react";
import ConfirmModal from "../../common/ConfirmModal";
import organizerService from "../../../services/organizerService";
import { toast } from "react-toastify";
import type { OrganizerResponse } from "../../../types/Organizer";

const OrganizerListGrid = () => {
  const [selectedOrganizer, setSelectedOrganizer] = useState<OrganizerResponse | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    organizerId: number | null;
  }>({ isOpen: false, organizerId: null });

  const [organizers, setOrganizers] = useState<OrganizerResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchOrganizers();
  }, []);

  const fetchOrganizers = async () => {
    setIsLoading(true);
    try {
      const response = await organizerService.getAllOrganizers();
      if (response) {
        setOrganizers(response.data);
        console.log("Organizers loaded:", response.data);
      }
    } catch (error: any) {
      console.error("Error fetching organizers:", error);
      toast.error(error.response?.data?.message || "Không thể tải danh sách nhà tổ chức");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDetails = (org: OrganizerResponse) => {
    setSelectedOrganizer(org);
    setIsEditOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrganizer(null);
    setIsEditOpen(false);
  };

  const handleUpdateSuccess = () => {
    fetchOrganizers(); // Refresh list after updating
  };

  const handleAddNew = () => {
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
  };

  const handleAddSuccess = (newOrganizer: OrganizerResponse) => {
    fetchOrganizers(); // Refresh list after adding
    // toast.success("Thêm nhà tổ chức thành công!");
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, organizerId: id });
  };

  const confirmDelete = async () => {
    const organizerId = confirmModal.organizerId;
    if (!organizerId) return;

    try {
      const response = await organizerService.deleteOrganizer(organizerId);
      
      if (response.status === 200 || response.data.success) {
        toast.success("Xóa nhà tổ chức thành công!");
        fetchOrganizers(); // Refresh list after deleting
        setConfirmModal({ isOpen: false, organizerId: null });
      }
    } catch (error: any) {
      console.error('Error deleting organizer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          'Không thể xóa nhà tổ chức!';
      toast.error(errorMessage);
      setConfirmModal({ isOpen: false, organizerId: null });
    }
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, organizerId: null });
  };

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.campus?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Search and Add Button */}
      <div className="flex justify-between items-center gap-4">
        <div className="flex items-center bg-gray-100 rounded-lg px-4 py-2.5 focus-within:ring-2 focus-within:ring-[#F27125] transition-all flex-1 max-w-md">
          <Search size={20} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, cơ sở hoặc email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-700"
          />
        </div>
        <button 
          onClick={handleAddNew}
          className="flex items-center gap-2 bg-[#F27125] text-white px-6 py-2.5 rounded-lg hover:bg-[#d95c0b] transition-colors font-medium shadow-md"
        >
          <Plus size={20} />
          <span>Thêm mới</span>
        </button>
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
                  Logo
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Tên nhà tổ chức
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Cơ sở
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email liên hệ
                </th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#F27125] border-t-transparent rounded-full animate-spin"></div>
                      <span>Đang tải...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredOrganizers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    {organizers.length === 0 ? "Chưa có nhà tổ chức nào" : "Không tìm thấy nhà tổ chức nào"}
                  </td>
                </tr>
              ) : (
                filteredOrganizers.map((org) => (
                  <tr
                    key={org.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {org.id}
                    </td>
                    <td className="px-6 py-4">
                      <img
                        src={org.logoUrl}
                        alt={org.name}
                        className="w-16 h-16 object-cover rounded-lg"
                        onError={(e) => {
                          e.currentTarget.src = `${org.logoUrl}`;
                        }}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">
                        {org.name}
                      </div>
                      {org.description && (
                        <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                          {org.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-600">{org.campus?.name || "N/A"}</div>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={`mailto:${org.contactEmail}`}
                        className="text-sm text-[#F27125] hover:text-[#d95c0b] hover:underline"
                      >
                        {org.contactEmail}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetails(org)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Chỉnh sửa"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(org.id)}
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
      {filteredOrganizers.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số:{" "}
          <span className="font-semibold">{filteredOrganizers.length}</span> nhà
          tổ chức
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <OrganizerModal
          organizer={selectedOrganizer}
          isOpen={isEditOpen}
          onClose={handleCloseDetails}
          onSuccess={handleUpdateSuccess}
        />
      )}

      {/* Add Modal */}
      <AddOrganizerModal
        isOpen={isAddOpen}
        onClose={handleCloseAdd}
        onSuccess={handleAddSuccess}
      />

      
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="Xác nhận xóa"
        message="Bạn có chắc chắn muốn xóa nhà tổ chức này?"
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
};


export default OrganizerListGrid;
