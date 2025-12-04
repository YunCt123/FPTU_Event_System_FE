import { useState } from "react";
import OrganizerModal from "./OrganizerModal";
import AddOrganizerModal from "./AddOrganizerModal";
import { Search, Plus, Trash2, Edit } from "lucide-react";
import ConfirmModal from "../../common/ConfirmModal";
import type { Organizer } from '../../../types/Organizer';

const OrganizerListGrid = () => {
  const [selectedOrganizer, setSelectedOrganizer] = useState<Organizer | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    organizerId: number | null;
  }>({ isOpen: false, organizerId: null });
  const [organizers, setOrganizers] = useState<Organizer[]>([
    {
      id: 1,
      name: "FPT Event Club",
      description:
        "A student-led group responsible for organizing cultural, entertainment, and academic events at FPT University.",
      contactEmail: "eventclub@fpt.edu.vn",
      logo_url:
        "https://upload.wikimedia.org/wikipedia/commons/4/43/FPT_Education_logo.png",
      campus: "FPT University Hà Nội",
    },
    {
      id: 2,
      name: "FPT Media Team",
      description:
        "Specializes in media production, photography, and event livestream support for university activities.",
      contactEmail: "mediateam@fpt.edu.vn",
      logo_url:
        "https://media.glassdoor.com/sql/472026/fpt-software-squarelogo-1568261569651.png",
      campus: "FPT University Hồ Chí Minh",
    },
    {
      id: 3,
      name: "FPT Volunteer Club",
      description:
        "Organizes charity events, community services, and volunteer activities for students.",
      contactEmail: "volunteer@fpt.edu.vn",
      logo_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/FPT_Polytechnic.png/640px-FPT_Polytechnic.png",
      campus: "FPT University Đà Nẵng",
    },
    {
      id: 4,
      name: "FPT Developer Student Club",
      description:
        "A tech community that hosts workshops, hackathons, and developer training programs.",
      contactEmail: "dsc@fpt.edu.vn",
      logo_url:
        "https://seeklogo.com/images/G/google-developers-logo-55B3A9F9E8-seeklogo.com.png",
      campus: "FPT University Cần Thơ",
    },
  ]);

  const handleOpenDetails = (org: Organizer) => {
    setSelectedOrganizer(org);
    setIsEditOpen(true);
  };

  const handleCloseDetails = () => {
    setSelectedOrganizer(null);
    setIsEditOpen(false);
  };

  const handleAddNew = () => {
    setIsAddOpen(true);
  };

  const handleCloseAdd = () => {
    setIsAddOpen(false);
  };

  const handleAddSuccess = (newOrganizer: Organizer) => {
    setOrganizers([...organizers, newOrganizer]);
  };

  const handleDelete = (id: number) => {
    setConfirmModal({ isOpen: true, organizerId: id });
  };

  const confirmDelete = () => {
    const organizerId = confirmModal.organizerId;
    if (!organizerId) return;

    setOrganizers(organizers.filter((org) => org.id !== organizerId));
    setConfirmModal({ isOpen: false, organizerId: null });
  };

  const cancelDelete = () => {
    setConfirmModal({ isOpen: false, organizerId: null });
  };

  const filteredOrganizers = organizers.filter(
    (org) =>
      org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      org.campus.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
              {filteredOrganizers.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    Không tìm thấy nhà tổ chức nào
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
                        src={org.logo_url}
                        alt={org.name}
                        className="w-16 h-16 object-cover rounded-lg"
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
                      <div className="text-sm text-gray-600">{org.campus}</div>
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
