import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { toast } from "react-toastify";
import type { Seat, Venue } from "../../../types/Venue";
import SeatMapEditor from "../../common/SeatMapEditor";



interface SeatMapEditorModalProps {
  venue: Venue;
  onClose: () => void;
  onSuccess: (venue: Venue) => void;
}

const ManageSeat = ({
  venue,
  onClose,
  onSuccess,
}: SeatMapEditorModalProps) => {
  const [loading, setLoading] = useState(false);
  const [seatMap, setSeatMap] = useState<Seat[][]>([]);
  const [rowLabels, setRowLabels] = useState<string[]>([]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  useEffect(() => {
    // Load existing seat map
    if (venue.seatMap) {
      setSeatMap(venue.seatMap.seats);
      setRowLabels(venue.seatMap.rowLabels);
    } else {
      toast.error("Hội trường này chưa có sơ đồ ghế");
      onClose();
    }
  }, [venue, onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!venue.seatMap) {
      toast.error("Không tìm thấy sơ đồ ghế");
      return;
    }

    setLoading(true);

    // Simulate processing
    setTimeout(() => {
      // Calculate capacity from classified seats
      const classifiedSeats = seatMap
        .flat()
        .filter((seat) => seat.type !== "empty");

      const updatedVenue: Venue = {
        ...venue,
        capacity: classifiedSeats.length,
        seatMap: {
          rows: venue.seatMap!.rows,
          cols: venue.seatMap!.cols,
          seats: seatMap,
          rowLabels: rowLabels,
        },
      };

      toast.success("Cập nhật phân loại ghế thành công!");
      onSuccess(updatedVenue);
      setLoading(false);
    }, 500);
  };

  const getTotalSeats = (): { regular: number; vip: number; empty: number; total: number } => {
    let regular = 0;
    let vip = 0;
    let empty = 0;

    seatMap.forEach((row) => {
      row.forEach((seat) => {
        if (seat.type === "regular") regular++;
        if (seat.type === "vip") vip++;
        if (seat.type === "empty") empty++;
      });
    });

    return { regular, vip, empty, total: regular + vip };
  };

  const stats = getTotalSeats();

  if (!venue.seatMap) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Phân loại ghế - {venue.name}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Organizer: Chỉnh sửa loại ghế (Thường/VIP/Lối đi)
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={loading}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          {/* Stats Section */}
          <div className="p-6 bg-linear-to-r from-blue-50 to-indigo-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex gap-6">
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Tổng ghế khả dụng:</span>
                  <span className="ml-2 font-bold text-blue-700 text-lg">{stats.total}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Ghế thường:</span>
                  <span className="ml-2 font-bold text-green-700 text-lg">{stats.regular}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Ghế VIP:</span>
                  <span className="ml-2 font-bold text-yellow-700 text-lg">{stats.vip}</span>
                </div>
                <div className="text-sm">
                  <span className="font-semibold text-gray-700">Lối đi:</span>
                  <span className="ml-2 font-bold text-gray-600 text-lg">{stats.empty}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Seat Map Editor */}
          <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
            <form id="seat-map-form" onSubmit={handleSubmit}>
              <SeatMapEditor
                rows={venue.seatMap.rows}
                cols={venue.seatMap.cols} 
                onRowsChange={() => {}}
                onColsChange={() => {}} 
                seatMap={seatMap}
                onSeatMapChange={setSeatMap}
                rowLabels={rowLabels}
                onRowLabelsChange={setRowLabels}
                mode="organizer"
              />
            </form>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-white">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={loading}
          >
            Hủy
          </button>
          <button
            type="submit"
            form="seat-map-form"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            Lưu phân loại ghế
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageSeat;
