import { useState } from 'react';
import { Edit } from 'lucide-react';
import { toast } from 'react-toastify';
import type { Venue, VenueStatus } from '../../../types/Venue';
import ManageSeat from '../../../components/organizer/ManageSeat';

// Mock data để test UI/UX - sử dụng cùng data với Admin
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

const OrganizerVenuePage = () => {
  const [venues, setVenues] = useState<Venue[]>(MOCK_VENUES);
  const [isSeatMapModalOpen, setIsSeatMapModalOpen] = useState(false);
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  const handleEditSeatMap = (venue: Venue) => {
    if (!venue.seatMap) {
      toast.error('Hội trường này chưa có sơ đồ ghế');
      return;
    }
    setSelectedVenue(venue);
    setIsSeatMapModalOpen(true);
  };

  const handleSeatMapModalClose = () => {
    setIsSeatMapModalOpen(false);
    setSelectedVenue(null);
  };

  const handleSeatMapSuccess = (updatedVenue: Venue) => {
    setVenues(venues.map(v => v.id === updatedVenue.id ? updatedVenue : v));
    handleSeatMapModalClose();
    toast.success('Cập nhật sơ đồ ghế thành công!');
  };

  const getSeatMapStats = (venue: Venue) => {
    if (!venue.seatMap) return null;

    const seats = venue.seatMap.seats.flat();
    const regular = seats.filter(s => s.type === 'regular').length;
    const vip = seats.filter(s => s.type === 'vip').length;
    const empty = seats.filter(s => s.type === 'empty').length;

    return { regular, vip, empty, total: regular + vip };
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý sơ đồ ghế</h1>
        <p className="text-gray-600 mt-1">Phân loại ghế cho các hội trường</p>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Hình ảnh</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Tên hội trường</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Sơ đồ ghế</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái phân loại</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trạng thái</th>
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {venues.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chưa có hội trường nào
                  </td>
                </tr>
              ) : (
                venues.map((venue) => {
                  const stats = getSeatMapStats(venue);
                  
                  return (
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
                        {venue.seatMap ? (
                          <div>
                            <div className="font-medium">
                              {venue.seatMap.rows}×{venue.seatMap.cols}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              ({venue.capacity} ghế)
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400">Chưa có sơ đồ</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {stats ? (
                          <div className="text-xs space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-green-500 rounded"></span>
                              <span className="text-gray-700">Thường: <span className="font-semibold">{stats.regular}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-yellow-500 rounded"></span>
                              <span className="text-gray-700">VIP: <span className="font-semibold">{stats.vip}</span></span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="w-3 h-3 bg-gray-300 rounded"></span>
                              <span className="text-gray-500">Trống: <span className="font-semibold">{stats.empty}</span></span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-gray-400 text-sm">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(venue.status)}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          {venue.seatMap ? (
                            <button
                              onClick={() => handleEditSeatMap(venue)}
                              className="flex items-center gap-1 px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                              title="Phân loại ghế"
                            >
                              <Edit size={16} />
                              Phân loại
                            </button>
                          ) : (
                            <span className="text-xs text-gray-400">Không có sơ đồ</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Total Count */}
      {venues.length > 0 && (
        <div className="mt-4 text-sm text-gray-600">
          Tổng số: <span className="font-semibold">{venues.length}</span> hội trường
        </div>
      )}

      {/* Seat Map Editor Modal */}
      {isSeatMapModalOpen && selectedVenue && (
        <ManageSeat
          venue={selectedVenue}
          onClose={handleSeatMapModalClose}
          onSuccess={handleSeatMapSuccess}
        />
      )}
    </div>
  );
};

export default OrganizerVenuePage;
