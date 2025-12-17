import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Minus } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { seatService } from "../../../services";
// import type { SeatMapData, Seat } from "../../../types/Venue";

interface ApiSeat {
  id: number;
  rowLabel: string;
  colLabel: number;
  seatType: string;
  isActive: boolean;
  isBooked: boolean;
}

interface SeatReservation {
  rowIndex: number;
  colIndex: number;
  reservedFor: "VIP" | "GUEST" | "STAFF" | null;
  guestName?: string;
  note?: string;
}

interface SelectedSeat {
  id: number;
  label: string;
  seatType: string;
  rowIndex: number;
  colIndex: number;
}

interface SeatMapData {
  seats: any[][];
  rowLabels: string[];
  colLabels: string[];
  rows: number;
  cols: number;
}

const SeatAllocationPage = () => {
  const { eventId, venueId } = useParams();
  const navigate = useNavigate();

  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [reservations, setReservations] = useState<SeatReservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<SelectedSeat | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // mimic mobile seat color mapping
  const getSeatColor = (seatType?: string) => {
    switch ((seatType || "STANDARD").toUpperCase()) {
      case "VIP":
        return "bg-purple-500 text-white";
      case "STANDARD":
        return "bg-[#F27125] text-white";
      case "STAFF":
        return "bg-green-500 text-white";
      case "RESERVED":
        return "bg-gray-400 text-white";
      default:
        return "bg-[#5C6AC4] text-white";
    }
  };

  useEffect(() => {
    const fetchSeats = async () => {
      try {
        setIsLoading(true);
        setError(null);

        if (!venueId) {
          setError("Không tìm thấy ID địa điểm");
          return;
        }

        console.log("Fetching seats:", { eventId, venueId });

        const response = await seatService.getSeatsByVenue(venueId, eventId);

        console.log("API Response:", response.data);

        const apiSeats = response.data?.data || response.data;

        // Transform flat API response to 2D grid structure
        if (Array.isArray(apiSeats) && apiSeats.length > 0) {
          // Group seats by row
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

          // Sort rows and get unique row labels
          const rowLabels = Object.keys(seatsByRow).sort();
          const cols =
            rowLabels.length > 0 ? seatsByRow[rowLabels[0]].length : 0;

          // Convert to 2D array structure
          const seats = rowLabels.map((rowLabel) => {
            const rowSeats = seatsByRow[rowLabel];
            return rowSeats
              .sort((a: any, b: any) => a.colLabel - b.colLabel)
              .map((seat: any) => ({
                id: seat.id,
                row: rowLabels.indexOf(rowLabel),
                col: seat.colLabel - 1,
                type: seat.isActive
                  ? seat.seatType?.toLowerCase() || "standard"
                  : "disabled",
                label: `${rowLabel}${seat.colLabel}`,
                seatType: seat.seatType || "STANDARD",
                isBooked: seat.isBooked,
              }));
          });

          const seatMapData: SeatMapData = {
            rows: rowLabels.length,
            cols: cols,
            rowLabels: rowLabels,
            colLabels: [],
            seats: seats as any,
          };

          setSeatMap(seatMapData);

          // Extract booked seats as reservations
          const bookedSeats = apiSeats
            .filter((seat: ApiSeat) => seat.isBooked)
            .map((seat: ApiSeat) => ({
              rowIndex: rowLabels.indexOf(seat.rowLabel),
              colIndex: seat.colLabel - 1,
              reservedFor: (seat.seatType?.toUpperCase() as any) || "GUEST",
              guestName: "",
              note: "",
            }));
          setReservations(bookedSeats);
        } else {
          setError("Không có dữ liệu ghế");
        }
      } catch (err: any) {
        console.error("Error fetching seats:", err);
        const errorMsg =
          err.response?.data?.message || "Không thể tải thông tin ghế";
        setError(errorMsg);
        toast.error(errorMsg);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeats();
  }, [eventId, venueId]);

  const isSeatReserved = (
    rowIndex: number,
    colIndex: number
  ): SeatReservation | null => {
    return (
      reservations.find(
        (r) => r.rowIndex === rowIndex && r.colIndex === colIndex
      ) || null
    );
  };

  const handleSeatClick = (seat: any, rowIndex: number, colIndex: number) => {
    const isDisabled = seat.type === "disabled";
    const isEmpty = seat.type === "empty";

    if (isEmpty || isDisabled || seat.isBooked) {
      return;
    }

    setSelectedSeat({
      id: seat.id,
      label: seat.label,
      seatType: seat.seatType,
      rowIndex,
      colIndex,
    });
  };

  const handleUpdateSeatType = async (newSeatType: string) => {
    if (!selectedSeat || !eventId) return;

    try {
      setIsUpdating(true);
      console.log("Updating seat type:", {
        seatId: selectedSeat.id,
        newType: newSeatType,
        eventId,
      });

      await seatService.updateSeatType(selectedSeat.id, newSeatType, eventId);

      toast.success(`Cập nhật ghế ${selectedSeat.label} thành công`);

      // Update local seatMap state
      if (seatMap) {
        const newSeatMap = { ...seatMap };
        const seat =
          newSeatMap.seats[selectedSeat.rowIndex][selectedSeat.colIndex];
        seat.seatType = newSeatType;

        setSeatMap(newSeatMap);
      }

      setSelectedSeat(null);
    } catch (err: any) {
      console.error("Error updating seat type:", err);
      const errorMsg =
        err.response?.data?.message || "Không thể cập nhật loại ghế";
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    // Prevent dragging when clicking on a seat
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

  // seat styling will be applied inline in JSX using getSeatColor and reserved state

  // For organizer view we only show the seat map; stats removed to match mobile modal simplicity

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải sơ đồ ghế...</p>
        </div>
      </div>
    );
  }

  if (error || !seatMap) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {error || "Không thể tải sơ đồ ghế"}
          </h3>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  // seat styling will be applied inline in JSX using getSeatColor and reserved state

  // For organizer view we only show the seat map; stats removed to match mobile modal simplicity

  return (
    <div className="h-screen flex flex-col bg-white">
      <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-200 shrink-0">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sơ đồ ghế</h1>
          <p className="text-sm text-gray-600">
            Chế độ: Organizer — cấu hình loại ghế
          </p>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-6 overflow-hidden">
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

        <div
          className="flex-1 overflow-hidden border border-gray-200 rounded-lg bg-gray-50 cursor-grab active:cursor-grabbing relative"
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
              {seatMap?.seats.map((row: any, rowIndex: number) => (
                <div key={rowIndex} className="flex items-start gap-2 mb-2">
                  <div className="w-8 text-center font-bold text-gray-700 shrink-0 pt-0.5 text-sm">
                    {seatMap.rowLabels[rowIndex]}
                  </div>
                  <div className="flex gap-1">
                    {row.map((seat: any, colIndex: number) => {
                      const reserved = isSeatReserved(rowIndex, colIndex);
                      const isDisabled = seat.type === "disabled";
                      const isEmpty = seat.type === "empty";
                      const isSeatBooked = (seat as any).isBooked;

                      const baseClass =
                        isEmpty || isDisabled
                          ? "bg-gray-200 border border-gray-300"
                          : isSeatBooked
                          ? "bg-gray-400 text-white"
                          : reserved
                          ? reserved.reservedFor === "VIP"
                            ? "bg-purple-500 text-white"
                            : reserved.reservedFor === "GUEST"
                            ? "bg-blue-500 text-white"
                            : "bg-green-500 text-white"
                          : getSeatColor((seat as any).seatType);

                      return (
                        <div
                          key={colIndex}
                          data-seat="true"
                          className={`flex items-center justify-center rounded transition-all ${
                            isEmpty || isDisabled || isSeatBooked
                              ? "cursor-default"
                              : "cursor-pointer hover:shadow-lg hover:scale-110 hover:z-10"
                          } ${baseClass}`}
                          onClick={() =>
                            handleSeatClick(seat, rowIndex, colIndex)
                          }
                          title={
                            isEmpty || isDisabled
                              ? "Không khả dụng"
                              : isSeatBooked
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
                          {isEmpty || isDisabled
                            ? ""
                            : isSeatBooked
                            ? "🔒"
                            : seat.label.replace(/^[A-Z]/, "")}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F27125] rounded"></div>
            <span>Tiêu chuẩn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded"></div>
            <span>VIP</span>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {selectedSeat && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              Cấu hình ghế {selectedSeat.label}
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Loại hiện tại:{" "}
              <span className="font-semibold">{selectedSeat.seatType}</span>
            </p>

            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleUpdateSeatType("standard")}
                disabled={isUpdating || selectedSeat.seatType === "standard"}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedSeat.seatType === "standard"
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-[#F27125] text-white hover:bg-[#E05E1F]"
                } disabled:opacity-50`}
              >
                {isUpdating ? "Đang cập nhật..." : "Đặt làm Tiêu chuẩn"}
              </button>

              <button
                onClick={() => handleUpdateSeatType("vip")}
                disabled={isUpdating || selectedSeat.seatType === "vip"}
                className={`w-full py-3 px-4 rounded-lg font-semibold transition-all ${
                  selectedSeat.seatType === "vip"
                    ? "bg-gray-100 text-gray-500 cursor-not-allowed"
                    : "bg-purple-500 text-white hover:bg-purple-600"
                } disabled:opacity-50`}
              >
                {isUpdating ? "Đang cập nhật..." : "Đặt làm VIP"}
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

export default SeatAllocationPage;
