import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Users,
  Lock,
  Unlock,
  Save,
  Grid,
  List,
} from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import type { SeatMapData, Seat } from '../../../types/Venue';

interface SeatReservation {
  rowIndex: number;
  colIndex: number;
  reservedFor: 'VIP' | 'GUEST' | 'STAFF' | null;
  guestName?: string;
  note?: string;
}

const SeatAllocationPage = () => {
  const { eventId, venueId } = useParams();
  const navigate = useNavigate();

  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [reservations, setReservations] = useState<SeatReservation[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<Set<string>>(new Set());
  const [reservationType, setReservationType] = useState<'VIP' | 'GUEST' | 'STAFF'>('VIP');
  const [guestName, setGuestName] = useState('');
  const [note, setNote] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockSeatMap: SeatMapData = {
      rows: 10,
      cols: 12,
      rowLabels: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      seats: Array.from({ length: 10 }, (_, rowIndex) =>
        Array.from({ length: 12 }, (_, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          type: colIndex === 5 || colIndex === 6 ? 'empty' : 'regular',
          label: `${String.fromCharCode(65 + rowIndex)}${colIndex + 1}`,
        }))
      ),
    };
    setSeatMap(mockSeatMap);

    // Mock reservations
    setReservations([
      {
        rowIndex: 0,
        colIndex: 0,
        reservedFor: 'VIP',
        guestName: 'Nguyễn Văn A',
        note: 'Ban tổ chức',
      },
      {
        rowIndex: 0,
        colIndex: 1,
        reservedFor: 'VIP',
        guestName: 'Trần Thị B',
      },
    ]);
  }, [eventId, venueId]);

  const getSeatKey = (rowIndex: number, colIndex: number) => {
    return `${rowIndex}-${colIndex}`;
  };

  const isSeatReserved = (rowIndex: number, colIndex: number): SeatReservation | null => {
    return (
      reservations.find(
        (r) => r.rowIndex === rowIndex && r.colIndex === colIndex
      ) || null
    );
  };

  const toggleSeatSelection = (rowIndex: number, colIndex: number) => {
    const seatKey = getSeatKey(rowIndex, colIndex);
    const newSelected = new Set(selectedSeats);

    if (newSelected.has(seatKey)) {
      newSelected.delete(seatKey);
    } else {
      newSelected.add(seatKey);
    }

    setSelectedSeats(newSelected);
  };

  const handleReserveSeats = () => {
    if (selectedSeats.size === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }

    const newReservations: SeatReservation[] = [];

    selectedSeats.forEach((seatKey) => {
      const [rowIndex, colIndex] = seatKey.split('-').map(Number);
      newReservations.push({
        rowIndex,
        colIndex,
        reservedFor: reservationType,
        guestName: reservationType === 'GUEST' ? guestName : undefined,
        note: note || undefined,
      });
    });

    setReservations([...reservations, ...newReservations]);
    setSelectedSeats(new Set());
    setGuestName('');
    setNote('');
  };

  const handleCancelReservation = (rowIndex: number, colIndex: number) => {
    setReservations(
      reservations.filter(
        (r) => !(r.rowIndex === rowIndex && r.colIndex === colIndex)
      )
    );
  };

  const getSeatStyle = (
    seat: Seat,
    reserved: SeatReservation | null,
    isSelected: boolean
  ) => {
    if (seat.type === 'empty') {
      return 'bg-transparent cursor-default';
    }

    if (reserved) {
      const colors = {
        VIP: 'bg-purple-500 text-white cursor-pointer hover:bg-purple-600',
        GUEST: 'bg-blue-500 text-white cursor-pointer hover:bg-blue-600',
        STAFF: 'bg-green-500 text-white cursor-pointer hover:bg-green-600',
      };
      return colors[reserved.reservedFor!];
    }

    if (isSelected) {
      return 'bg-orange-500 text-white cursor-pointer hover:bg-orange-600';
    }

    return 'bg-gray-200 text-gray-700 cursor-pointer hover:bg-gray-300';
  };

  const stats = {
    total: seatMap ? seatMap.rows * seatMap.cols : 0,
    available:
      seatMap
        ? seatMap.seats.flat().filter((s) => s.type !== 'empty').length - reservations.length
        : 0,
    reserved: reservations.length,
    vip: reservations.filter((r) => r.reservedFor === 'VIP').length,
    guest: reservations.filter((r) => r.reservedFor === 'GUEST').length,
    staff: reservations.filter((r) => r.reservedFor === 'STAFF').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Phân bổ & Đặt trước ghế
            </h1>
            <p className="text-gray-600 mt-1">
              Đặt trước ghế cho VIP/Khách mời trước khi mở đăng ký
            </p>
          </div>
        </div>
        <button
          onClick={() => console.log('Save reservations')}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors"
        >
          <Save size={20} />
          Lưu thay đổi
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Tổng ghế</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Còn trống</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.available}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">VIP</div>
          <div className="text-2xl font-bold text-purple-600 mt-1">{stats.vip}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Khách mời</div>
          <div className="text-2xl font-bold text-blue-600 mt-1">{stats.guest}</div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
          <div className="text-sm text-gray-600">Staff</div>
          <div className="text-2xl font-bold text-green-600 mt-1">{stats.staff}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Seat Map */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Sơ đồ ghế</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'grid'
                      ? 'bg-[#F27125] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg ${
                    viewMode === 'list'
                      ? 'bg-[#F27125] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Stage */}
            <div className="bg-gray-800 text-white text-center py-3 rounded-lg mb-6">
              STAGE / MÀN HÌNH
            </div>

            {/* Seat Grid */}
            {viewMode === 'grid' && seatMap && (
              <div className="overflow-x-auto">
                <div className="inline-block min-w-full">
                  {seatMap.seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-center gap-2 mb-2">
                      <div className="w-8 text-center font-bold text-gray-700">
                        {seatMap.rowLabels[rowIndex]}
                      </div>
                      {row.map((seat, colIndex) => {
                        const reserved = isSeatReserved(rowIndex, colIndex);
                        const isSelected = selectedSeats.has(
                          getSeatKey(rowIndex, colIndex)
                        );
                        return (
                          <button
                            key={colIndex}
                            onClick={() => {
                              if (seat.type !== 'empty') {
                                toggleSeatSelection(rowIndex, colIndex);
                              }
                            }}
                            disabled={seat.type === 'empty'}
                            className={`w-10 h-10 rounded-lg text-xs font-medium transition-colors ${getSeatStyle(
                              seat,
                              reserved,
                              isSelected
                            )}`}
                            title={
                              reserved
                                ? `${reserved.reservedFor}: ${reserved.guestName || ''}`
                                : seat.label
                            }
                          >
                            {seat.type !== 'empty' && (reserved ? '🔒' : colIndex + 1)}
                          </button>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legend */}
            <div className="mt-6 pt-6 border-t border-gray-200 flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-gray-200 rounded"></div>
                <span>Trống</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-orange-500 rounded"></div>
                <span>Đang chọn</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-500 rounded"></div>
                <span>VIP</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-500 rounded"></div>
                <span>Khách mời</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-green-500 rounded"></div>
                <span>Staff</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reservation Panel */}
        <div className="space-y-6">
          {/* Reservation Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Đặt trước ghế
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại đặt trước
                </label>
                <select
                  value={reservationType}
                  onChange={(e) =>
                    setReservationType(e.target.value as 'VIP' | 'GUEST' | 'STAFF')
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="VIP">VIP</option>
                  <option value="GUEST">Khách mời</option>
                  <option value="STAFF">Staff</option>
                </select>
              </div>

              {reservationType === 'GUEST' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tên khách mời
                  </label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="Nhập tên khách mời..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú thêm..."
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                <Users size={16} className="inline mr-2" />
                Đã chọn: {selectedSeats.size} ghế
              </div>

              <button
                onClick={handleReserveSeats}
                disabled={selectedSeats.size === 0}
                className="w-full flex items-center justify-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Lock size={20} />
                Đặt trước ghế
              </button>
            </div>
          </div>

          {/* Reserved Seats List */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Danh sách đã đặt ({reservations.length})
            </h3>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {reservations.length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">
                  Chưa có ghế nào được đặt trước
                </p>
              ) : (
                reservations.map((reservation, index) => {
                  const seat = seatMap?.seats[reservation.rowIndex][reservation.colIndex];
                  const badgeColors = {
                    VIP: 'bg-purple-100 text-purple-700',
                    GUEST: 'bg-blue-100 text-blue-700',
                    STAFF: 'bg-green-100 text-green-700',
                  };

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">
                            {seat?.label}
                          </span>
                          <span
                            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                              badgeColors[reservation.reservedFor!]
                            }`}
                          >
                            {reservation.reservedFor}
                          </span>
                        </div>
                        {reservation.guestName && (
                          <div className="text-sm text-gray-600 mt-1">
                            {reservation.guestName}
                          </div>
                        )}
                        {reservation.note && (
                          <div className="text-xs text-gray-500 mt-1">
                            {reservation.note}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() =>
                          handleCancelReservation(
                            reservation.rowIndex,
                            reservation.colIndex
                          )
                        }
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Hủy đặt trước"
                      >
                        <Unlock size={16} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatAllocationPage;
