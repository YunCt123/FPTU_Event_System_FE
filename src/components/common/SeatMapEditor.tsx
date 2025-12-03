import { useState, useEffect } from "react";

export type SeatType = "empty" | "regular" | "vip";

export interface Seat {
  row: number;
  col: number;
  type: SeatType;
  label?: string;
}

interface SeatMapEditorProps {
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  seatMap: Seat[][];
  onSeatMapChange: (seatMap: Seat[][]) => void;
  rowLabels: string[];
  onRowLabelsChange: (labels: string[]) => void;
  mode?: "admin" | "organizer";
}

const SeatMapEditor = ({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  seatMap,
  onSeatMapChange,
  rowLabels,
  onRowLabelsChange,
  mode = "admin", // Default: admin mode - chỉ tạo lưới
}: SeatMapEditorProps) => {
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize seat map when rows/cols change
  useEffect(() => {
    if (rows > 0 && cols > 0 && !isInitialized) {
      initializeSeatMap();
      setIsInitialized(true);
    }
  }, [rows, cols, isInitialized]);

  const initializeSeatMap = () => {
    const newMap: Seat[][] = [];
    const newLabels: string[] = [];

    for (let r = 0; r < rows; r++) {
      const row: Seat[] = [];
      // Generate default row label (A, B, C, ...)
      newLabels.push(String.fromCharCode(65 + r));

      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          type: "empty", // Admin mode: tất cả ghế bắt đầu là empty
          label: `${String.fromCharCode(65 + r)}${c + 1}`,
        });
      }
      newMap.push(row);
    }

    onSeatMapChange(newMap);
    onRowLabelsChange(newLabels);
  };

  const handleSeatClick = (rowIdx: number, colIdx: number) => {
    // Chỉ cho phép click khi ở chế độ editor
    if (mode !== "organizer") return;

    const newMap = [...seatMap];
    const currentSeat = newMap[rowIdx][colIdx];

    // Cycle: regular -> vip -> empty -> regular
    const typeSequence: SeatType[] = ["regular", "vip", "empty"];
    const currentIndex = typeSequence.indexOf(currentSeat.type);
    const nextIndex = (currentIndex + 1) % typeSequence.length;

    newMap[rowIdx][colIdx] = {
      ...currentSeat,
      type: typeSequence[nextIndex],
    };

    onSeatMapChange(newMap);
  };

  const handleRowLabelChange = (rowIdx: number, value: string) => {
    const newLabels = [...rowLabels];
    newLabels[rowIdx] = value.toUpperCase();
    onRowLabelsChange(newLabels);

    // Update seat labels in that row
    const newMap = [...seatMap];
    for (let c = 0; c < cols; c++) {
      newMap[rowIdx][c] = {
        ...newMap[rowIdx][c],
        label: `${value.toUpperCase()}${c + 1}`,
      };
    }
    onSeatMapChange(newMap);
  };

  const getSeatColor = (type: SeatType): string => {
    switch (type) {
      case "regular":
        return "bg-green-500 hover:bg-green-600";
      case "vip":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "empty":
        return "bg-gray-200 hover:bg-gray-300";
      default:
        return "bg-gray-200";
    }
  };

  const getTotalSeats = (): { regular: number; vip: number; total: number } => {
    let regular = 0;
    let vip = 0;

    seatMap.forEach((row) => {
      row.forEach((seat) => {
        if (seat.type === "regular") regular++;
        if (seat.type === "vip") vip++;
      });
    });

    return { regular, vip, total: regular + vip };
  };

  const totalCapacity = rows * cols; // Tổng capacity = tổng ô trong lưới
  const stats = mode === 'organizer' ? getTotalSeats() : null;

  return (
    <div className="space-y-4">

      {mode === "admin" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số hàng (Rows)
              </label>
              <input
                type="number"
                min="1"
                max="26"
                value={rows || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  onRowsChange(value);
                  setIsInitialized(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 10"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Số cột (Columns)
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={cols || ""}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  onColsChange(value);
                  setIsInitialized(false);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: 20"
              />
            </div>
          </div>
          <div className="mt-2">
            Tổng số ghế khả dụng:{" "}
            <span className="font-bold">{totalCapacity}</span>
          </div>
        </div>
      )}

      {/* Stats for organizer */}
      {seatMap.length > 0 && mode === "organizer" && stats && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-4">
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Tổng ghế:</span>
              <span className="ml-2 font-bold text-green-700">{stats.total}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Ghế thường:</span>
              <span className="ml-2 font-bold text-green-700">{stats.regular}</span>
            </div>
            <div className="text-sm">
              <span className="font-semibold text-gray-700">Ghế VIP:</span>
              <span className="ml-2 font-bold text-yellow-700">{stats.vip}</span>
            </div>
          </div>
        </div>
      )}

      {/* Legend for organizer */}
      {seatMap.length > 0 && mode === "organizer" && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-green-500 rounded flex items-center justify-center text-white"></div>
              <span>Ghế thường</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center text-white"></div>
              <span>Ghế VIP</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-200 rounded"></div>
              <span>Lối đi/Trống</span>
            </div>
          </div>
        </div>
      )}

      {seatMap.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <table className="border-collapse">
                <tbody>
                  {seatMap.map((row, rowIdx) => (
                    <tr key={rowIdx}>
                      {/* Row Label Input */}
                      <td className="p-1">
                        <input
                          type="text"
                          maxLength={2}
                          value={rowLabels[rowIdx] || ""}
                          onChange={(e) =>
                            handleRowLabelChange(rowIdx, e.target.value)
                          }
                          className="w-12 h-8 text-center font-bold border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                          placeholder={String.fromCharCode(65 + rowIdx)}
                        />
                      </td>

                      {/* Seats */}
                      {row.map((seat, colIdx) => (
                        <td key={colIdx} className="p-1">
                          {mode === "admin" ? (
                            // Admin mode: chỉ hiển thị, không click được
                            <div
                              className="w-8 h-8 rounded bg-gray-200 border border-gray-300 flex items-center justify-center text-xs font-semibold text-gray-400"
                              title={`${seat.label} - Chưa phân loại`}
                            >
                              {colIdx + 1}
                            </div>
                          ) : (
                            // Editor mode: có thể click để thay đổi
                            <button
                              type="button"
                              onClick={() => handleSeatClick(rowIdx, colIdx)}
                              className={`w-8 h-8 rounded transition-colors flex items-center justify-center text-xs font-semibold ${getSeatColor(
                                seat.type
                              )}`}
                              title={`${seat.label} - ${seat.type}`}
                            ></button>
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Column numbers
          <div className="mt-2 flex gap-2 ml-14">
            {cols > 0 && Array.from({ length: cols }, (_, i) => (
              <div key={i} className="w-8 text-center text-xs text-gray-500 font-medium pl-1.5">
                {i + 1}
              </div>
            ))}
          </div> */}
        </div>
      )}
    </div>
  );
};

export default SeatMapEditor;
