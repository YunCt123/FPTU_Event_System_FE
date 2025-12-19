import { useState, useEffect } from "react";
import { X, Plus, Minus, Loader } from "lucide-react";
import { toast } from "react-toastify";
import { seatService } from "../../../services";
import type { Venue } from "../../../types/Venue";

interface ApiSeat {
  id: number;
  rowLabel: string;
  colLabel: number;
  seatType: string;
  isActive: boolean;
  isBooked: boolean;
}

interface SeatMapData {
  rows: number;
  cols: number;
  rowLabels: string[];
  seats: Array<
    Array<{
      id: number;
      row: number;
      col: number;
      type: string;
      label: string;
      seatType: string;
      isActive: boolean;
      isBooked: boolean;
    }>
  >;
}

interface SelectedSeat {
  id: number;
  label: string;
  seatType: string;
  rowIndex: number;
  colIndex: number;
  isActive: boolean;
  isBooked: boolean;
}

interface SeatMapModalProps {
  venue: Venue;
  onClose: () => void;
}

const SeatMapModal = ({ venue, onClose }: SeatMapModalProps) => {
  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const getSeatColor = (seatType?: string, isActive?: boolean) => {
    if (!isActive) {
      return "bg-gray-300 text-gray-500 cursor-not-allowed";
    }

    switch ((seatType || "STANDARD").toUpperCase()) {
      case "VIP":
        return "bg-purple-500 text-white";
      case "STANDARD":
        return "bg-[#F27125] text-white";
      case "STAFF":
        return "bg-green-500 text-white";
      default:
        return "bg-[#5C6AC4] text-white";
    }
  };

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await seatService.getSeatsByVenue(venue.id.toString());

        const apiSeats = response.data?.data || response.data;
        console.log("API Response:", response.data);
        console.log("API Seats:", apiSeats);

        if (Array.isArray(apiSeats) && apiSeats.length > 0) {
          // Validate that we have seat data
          const firstSeat = apiSeats[0];
          console.log("First seat:", firstSeat);

          if (!firstSeat.rowLabel || firstSeat.colLabel === undefined) {
            setError("Định dạng dữ liệu ghế không hợp lệ");
            return;
          }

          const seatsByRow = apiSeats.reduce(
            (acc: Record<string, ApiSeat[]>, seat: ApiSeat) => {
              if (!acc[seat.rowLabel]) {
                acc[seat.rowLabel] = [];
              }
              acc[seat.rowLabel].push(seat);
              return acc;
            },
            {}
          );

          const rowLabels = Object.keys(seatsByRow).sort();
          const cols =
            rowLabels.length > 0 ? seatsByRow[rowLabels[0]].length : 0;

          const seats = rowLabels.map((rowLabel: string) => {
            const rowSeats = seatsByRow[rowLabel];
            return rowSeats
              .sort((a: ApiSeat, b: ApiSeat) => a.colLabel - b.colLabel)
              .map((seat: ApiSeat) => ({
                id: seat.id,
                row: rowLabels.indexOf(rowLabel),
                col: seat.colLabel - 1,
                type: seat.isActive
                  ? seat.seatType?.toLowerCase() || "standard"
                  : "disabled",
                label: `${rowLabel}${seat.colLabel}`,
                seatType: seat.seatType || "STANDARD",
                isActive: seat.isActive,
                isBooked: seat.isBooked,
              }));
          });

          const seatMapData: SeatMapData = {
            rows: rowLabels.length,
            cols: cols,
            rowLabels: rowLabels,
            seats: seats as any,
          };

          console.log("SeatMapData before setState:", seatMapData);
          console.log(
            "SeatMapData.seats is array:",
            Array.isArray(seatMapData.seats)
          );
          console.log("SeatMapData.seats.length:", seatMapData.seats.length);

          setSeatMap(seatMapData);
        } else {
          setError("Không có dữ liệu ghế");
        }
      } catch (err: any) {
        console.error("Error fetching seats:", err);
        const errorMsg =
          err.response?.data?.message || "Không thể tải thông tin ghế";
        setError(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    if (venue.hasSeats && venue.id) {
      fetchSeats();
    }
  }, [venue]);

  const handleSeatClick = (seat: any, rowIndex: number, colIndex: number) => {
    if (seat.isBooked) {
      toast.warning("Không thể thay đổi ghế đã được đặt");
      return;
    }

    setSelectedSeat({
      id: seat.id,
      label: seat.label,
      seatType: seat.seatType,
      rowIndex,
      colIndex,
      isActive: seat.isActive,
      isBooked: seat.isBooked,
    });
  };

  const handleToggleSeatStatus = async () => {
    if (!selectedSeat || !seatMap) return;

    try {
      setIsUpdating(true);
      const newStatus = !selectedSeat.isActive;

      await seatService.updateSeatStatus(selectedSeat.id, newStatus);

      toast.success(
        `Cập nhật ghế ${selectedSeat.label} thành ${
          newStatus ? "kích hoạt" : "vô hiệu hóa"
        } thành công`
      );

      // Update local state
      const newSeatMap = { ...seatMap };
      const seat =
        newSeatMap.seats[selectedSeat.rowIndex][selectedSeat.colIndex];
      seat.isActive = newStatus;
      seat.type = newStatus
        ? seat.seatType?.toLowerCase() || "standard"
        : "disabled";

      setSeatMap(newSeatMap);
      setSelectedSeat({
        ...selectedSeat,
        isActive: newStatus,
      });
    } catch (err: any) {
      console.error("Error updating seat status:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể cập nhật trạng thái ghế";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("[data-seat]")) {
      return;
    }
    setIsDragging(true);
    setDragStart({ x: e.clientX - panX, y: e.clientY - panY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPanX(e.clientX - dragStart.x);
    setPanY(e.clientY - dragStart.y);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const resetView = () => {
    setPanX(0);
    setPanY(0);
    setZoom(1);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSpeed = 0.1;
    const newZoom =
      e.deltaY > 0
        ? Math.max(0.5, zoom - zoomSpeed)
        : Math.min(2, zoom + zoomSpeed);
    setZoom(newZoom);
  };

  if (!venue.hasSeats) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Sơ đồ ghế</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">Venue này không có sơ đồ ghế ngồi</p>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <div className="flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4"></div>
            <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !seatMap) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Sơ đồ ghế</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={24} />
            </button>
          </div>
          <div className="p-6 text-center">
            <p className="text-gray-600">
              {error || "Không thể tải sơ đồ ghế"}
            </p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Sơ đồ ghế</h2>
            <p className="text-sm text-gray-600 mt-1">
              {venue.name} ({seatMap.rows} hàng × {seatMap.cols} cột)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col p-6 overflow-hidden">
          {/* Zoom Controls */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex justify-center flex-1"></div>
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-2 shrink-0">
              <button
                onClick={() => setZoom(Math.max(0.5, zoom - 0.2))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Thu nhỏ"
              >
                <Minus size={18} />
              </button>
              <span className="text-sm font-semibold w-12 text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={() => setZoom(Math.min(2, zoom + 0.2))}
                className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                title="Phóng to"
              >
                <Plus size={18} />
              </button>
              <button
                onClick={resetView}
                className="ml-2 px-3 py-2 text-xs font-semibold bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>

          {/* Seat Map Container */}
          <div
            className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-gray-50 cursor-grab active:cursor-grabbing relative min-h-96"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onWheel={handleWheel}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                className="inline-block p-4"
                style={{
                  transform: `translate(${panX}px, ${panY}px) scale(${zoom})`,
                  transformOrigin: "center",
                  transition: isDragging ? "none" : "transform 0.1s",
                }}
              >
                <div className="flex flex-col items-center gap-4 mb-4">
                  <div className="px-6 py-2 rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
                    SÂN KHẤU
                  </div>
                </div>
                {seatMap && seatMap.seats && seatMap.seats.length > 0 ? (
                  seatMap.seats.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex items-start gap-2 mb-2">
                      <div className="w-8 text-center font-bold text-gray-700 shrink-0 pt-0.5 text-sm">
                        {seatMap.rowLabels[rowIndex]}
                      </div>
                      <div className="flex gap-1">
                        {row.map((seat, colIndex) => {
                          const baseClass = getSeatColor(
                            seat.seatType,
                            seat.isActive
                          );
                          const isClickable = seat.isActive && !seat.isBooked;

                          return (
                            <div
                              key={colIndex}
                              data-seat="true"
                              className={`flex items-center justify-center rounded transition-all ${
                                isClickable
                                  ? "cursor-pointer hover:shadow-lg hover:scale-110 hover:z-10"
                                  : "cursor-default"
                              } ${baseClass}`}
                              onClick={() =>
                                handleSeatClick(seat, rowIndex, colIndex)
                              }
                              title={
                                !seat.isActive
                                  ? `${seat.label} - Vô hiệu hóa`
                                  : seat.isBooked
                                  ? `${seat.label} - Đã đặt`
                                  : seat.label
                              }
                              style={{
                                width: "28px",
                                height: "28px",
                                minWidth: "28px",
                                fontSize: "10px",
                                fontWeight: "600",
                              }}
                            >
                              {!seat.isActive
                                ? "✕"
                                : seat.isBooked
                                ? "🔒"
                                : seat.label.replace(/^[A-Z]/, "")}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-500">
                      Không có dữ liệu ghế để hiển thị
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Legend */}
        </div>
      </div>

      {/* Seat Configuration Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Cấu hình ghế {selectedSeat.label}
            </h2>
            <p className="text-sm text-gray-600 mb-2">
              Loại ghế:{" "}
              <span className="font-semibold">{selectedSeat.seatType}</span>
            </p>
            <p className="text-sm text-gray-600 mb-6">
              Trạng thái:{" "}
              <span
                className={`font-semibold ${
                  selectedSeat.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {selectedSeat.isActive ? "Kích hoạt" : "Vô hiệu hóa"}
              </span>
            </p>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-900">
                {selectedSeat.isActive
                  ? "Nhấn nút bên dưới để vô hiệu hóa ghế này"
                  : "Nhấn nút bên dưới để kích hoạt ghế này"}
              </p>
            </div>

            <div className="space-y-3 mb-6">
              <button
                onClick={handleToggleSeatStatus}
                disabled={isUpdating}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedSeat.isActive
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isUpdating ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={16} className="animate-spin" />
                    Đang cập nhật...
                  </div>
                ) : selectedSeat.isActive ? (
                  "Vô hiệu hóa ghế"
                ) : (
                  "Kích hoạt ghế"
                )}
              </button>
            </div>

            <button
              onClick={() => setSelectedSeat(null)}
              disabled={isUpdating}
              className="w-full py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-all"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatMapModal;
