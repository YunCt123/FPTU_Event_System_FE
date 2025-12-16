import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import type { SeatMapData, Seat } from "../../../types/Venue";

interface SeatReservation {
  rowIndex: number;
  colIndex: number;
  reservedFor: "VIP" | "GUEST" | "STAFF" | null;
  guestName?: string;
  note?: string;
}

const SeatAllocationPage = () => {
  const { eventId, venueId } = useParams();
  const navigate = useNavigate();

  const [seatMap, setSeatMap] = useState<SeatMapData | null>(null);
  const [reservations, setReservations] = useState<SeatReservation[]>([]);

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
    // Mock data - Replace with actual API call
    const mockSeatMap: SeatMapData = {
      rows: 10,
      cols: 12,
      rowLabels: ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"],
      seats: Array.from({ length: 10 }, (_, rowIndex) =>
        Array.from({ length: 12 }, (_, colIndex) => ({
          row: rowIndex,
          col: colIndex,
          type: colIndex === 5 || colIndex === 6 ? "empty" : "regular",
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
        reservedFor: "VIP",
        guestName: "Nguyễn Văn A",
        note: "Ban tổ chức",
      },
      {
        rowIndex: 0,
        colIndex: 1,
        reservedFor: "VIP",
        guestName: "Trần Thị B",
      },
    ]);
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

  // seat styling will be applied inline in JSX using getSeatColor and reserved state

  // For organizer view we only show the seat map; stats removed to match mobile modal simplicity

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Sơ đồ ghế</h1>
          <p className="text-sm text-gray-600">
            Chế độ: Organizer — chỉ xem sơ đồ
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex justify-center mb-4">
          <div className="px-6 py-1 rounded-full bg-gray-100 text-sm font-semibold">
            SÂN KHẤU
          </div>
        </div>

        <div className="h-96 overflow-auto p-4 bg-white">
          <div className="inline-block min-w-full">
            {seatMap?.seats.map((row, rowIndex) => (
              <div key={rowIndex} className="flex items-center gap-3 mb-3">
                <div className="w-8 text-center font-bold text-gray-700">
                  {seatMap.rowLabels[rowIndex]}
                </div>
                <div className="flex-1">
                  <div
                    className="w-full"
                    style={{
                      display: "grid",
                      gap: 8,
                      gridTemplateColumns: `repeat(${row.length}, minmax(32px, 1fr))`,
                      alignItems: "start",
                    }}
                  >
                    {row.map((seat, colIndex) => {
                      const reserved = isSeatReserved(rowIndex, colIndex);
                      const isEmpty = seat.type === "empty";
                      const baseClass = isEmpty
                        ? "bg-transparent"
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
                          className={`rounded-lg overflow-hidden ${baseClass}`}
                          title={
                            reserved
                              ? `${reserved.reservedFor}: ${
                                  reserved.guestName || ""
                                }`
                              : seat.label
                          }
                          style={{
                            width: "100%",
                            paddingTop: "100%",
                            position: "relative",
                          }}
                        >
                          <div
                            style={{ position: "absolute", inset: 0 }}
                            className="flex items-center justify-center text-xs font-semibold"
                          >
                            {isEmpty
                              ? ""
                              : reserved
                              ? "🔒"
                              : seat.label.replace(/^[A-Z]/, "")}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-200 rounded"></div>
            <span>Trống</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[#F27125] rounded"></div>
            <span>Tiêu chuẩn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500 rounded"></div>
            <span>VIP</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-green-500 rounded"></div>
            <span>Staff</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gray-400 rounded"></div>
            <span>Đã đặt (admin)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatAllocationPage;
