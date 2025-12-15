import { useEffect, useState, useMemo } from "react";
import type { eventStaff, User } from "../../../types/Event";
import { organizerService, userService } from "../../../services";
import { toast } from "react-toastify";
import { X, Search, UserPlus, Users } from "lucide-react";

interface AddStaffModalProps {
  staffList: eventStaff[];
  eventId: string;
  eventCampusId?: number;
  isOpen: boolean;
  onClose: () => void;
  onStaffAdded: () => void;
}


const AddStaffModal = ({ staffList, eventId, eventCampusId, isOpen, onClose, onStaffAdded }: AddStaffModalProps) => {
    const [allStaff, setAllStaff] = useState<User[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);

    const fetchAllStaff = async () => {
        try {
            const response = await userService.getStaffUser();
            if (response.status === 200 && response.data.data) {
                setAllStaff(response.data.data);
            }
        } catch (error) {
            console.log("Error fetching all staff data:", error);
            toast.error("Không thể tải danh sách staff");
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchAllStaff();
            setSearchQuery("");
            setSelectedStaffId(null);
        }
    }, [isOpen]);

    // Lọc staff chưa có trong event và cùng campus
    const availableStaff = useMemo(() => {
        const existingStaffIds = new Set(staffList.map(s => s.user.id));
        return allStaff.filter(staff => {
            // Kiểm tra staff chưa được thêm vào event
            if (existingStaffIds.has(staff.id)) return false;
            
            // Nếu event có campusId, chỉ hiển thị staff cùng campus
            if (eventCampusId && staff.campus?.id !== eventCampusId) return false;
            
            return true;
        });
    }, [allStaff, staffList, eventCampusId]);

    // Tìm kiếm staff
    const filteredStaff = useMemo(() => {
        if (!searchQuery) return availableStaff;
        
        const query = searchQuery.toLowerCase();
        return availableStaff.filter(staff => 
            staff.userName.toLowerCase().includes(query) ||
            staff.email.toLowerCase().includes(query) ||
            `${staff.firstName} ${staff.lastName}`.toLowerCase().includes(query)
        );
    }, [availableStaff, searchQuery]);

    const handleAddStaff = async () => {
        if (!selectedStaffId) {
            toast.warning("Vui lòng chọn staff để thêm");
            return;
        }

        setIsLoading(true);
        try {
            const response = await organizerService.postEventStaff(eventId, { userId: selectedStaffId });
            if (response.status === 201) {
                toast.success("Đã thêm staff thành công");
                onStaffAdded();
                onClose();
            } else {
                toast.error("Thêm staff thất bại");
            }
        } catch (error) {
            console.log("Error adding staff:", error);
            toast.error("Thêm staff có lỗi");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50  flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden" style={{ maxHeight: '90vh' }}>
                {/* Header - Fixed */}
                <div className="flex items-center justify-between p-6 bg-linear-to-r from-[#F27125] to-[#d95c0b] rounded-t-xl">
                    <div className="flex items-center gap-3">
                        <div>
                            <h2 className="text-xl font-bold text-white">Thêm Staff vào Sự kiện</h2>
                            <p className="text-sm text-white/90">
                                {availableStaff.length} staff khả dụng
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Search - Fixed */}
                <div className="p-6 border-b border-gray-200">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                        <input
                            type="text"
                            placeholder="Tìm kiếm theo tên, email, username..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                        />
                    </div>
                </div>

                {/* Staff List - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 280px)' }}>
                    {filteredStaff.length === 0 ? (
                        <div className="text-center py-12">
                            <Users className="mx-auto text-gray-400 mb-3" size={48} />
                            <p className="text-gray-600">
                                {availableStaff.length === 0 
                                    ? "Tất cả staff đã được thêm vào sự kiện này"
                                    : "Không tìm thấy staff phù hợp"}
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {filteredStaff.map((staff) => (
                                <div
                                    key={staff.id}
                                    onClick={() => setSelectedStaffId(staff.id)}
                                    className={`
                                        flex items-center gap-4 p-4 rounded-lg border-2 cursor-pointer transition-all
                                        ${selectedStaffId === staff.id
                                            ? 'border-[#F27125] bg-orange-50'
                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                        }
                                    `}
                                >
                                    <div className="flex-shrink-0">
                                        {staff.avatar ? (
                                            <img
                                                src={staff.avatar}
                                                alt={staff.userName}
                                                className="w-12 h-12 rounded-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#F27125] to-[#d95c0b] flex items-center justify-center text-white font-semibold">
                                                {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-900">
                                            {staff.firstName} {staff.lastName}
                                        </p>
                                        <p className="text-sm text-gray-600">@{staff.userName}</p>
                                        <p className="text-sm text-gray-500 truncate">{staff.email}</p>
                                    </div>
                                    <div className="flex-shrink-0">
                                        <div className={`
                                            w-5 h-5 rounded-full border-2 flex items-center justify-center
                                            ${selectedStaffId === staff.id
                                                ? 'border-[#F27125] bg-[#F27125]'
                                                : 'border-gray-300'
                                            }
                                        `}>
                                            {selectedStaffId === staff.id && (
                                                <div className="w-2 h-2 bg-white rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer - Fixed */}
                <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
                    <p className="text-sm text-gray-600">
                        {selectedStaffId ? '1 staff đã chọn' : 'Chưa chọn staff nào'}
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            disabled={isLoading}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleAddStaff}
                            disabled={isLoading || !selectedStaffId}
                            className="px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <UserPlus size={18} />
                            {isLoading ? "Đang thêm..." : "Thêm Staff"}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}



export default AddStaffModal