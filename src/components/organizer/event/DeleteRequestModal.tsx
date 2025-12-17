import { useState } from "react";
import { X, AlertTriangle, Trash2 } from "lucide-react";

interface DeleteRequestModalProps {
  eventTitle: string;
  eventId: string;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isPending?: boolean; // ✅ Thêm prop để phân biệt PENDING vs non-PENDING
  onDeletePending?: () => Promise<void>; // ✅ Callback xóa trực tiếp cho PENDING event
}

const DeleteRequestModal = ({
  eventTitle,
  eventId,
  onClose,
  onSubmit,
  isPending = false,
  onDeletePending,
}: DeleteRequestModalProps) => {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // ✅ Xử lý xóa trực tiếp cho PENDING event
  const handleDeletePending = async () => {
    if (!onDeletePending) return;

    setIsSubmitting(true);
    setError("");

    try {
      await onDeletePending();
      onClose();
    } catch (error: any) {
      console.error("Error deleting pending event:", error);
      setError(error.response?.data?.message || "Không thể xóa sự kiện");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Xử lý gửi yêu cầu hủy cho non-PENDING event
  const handleSubmit = async () => {
    // ✅ VALIDATION
    if (!reason.trim()) {
      setError("Vui lòng nhập lý do hủy sự kiện");
      return;
    }

    if (reason.trim().length < 10) {
      setError("Lý do phải có ít nhất 10 ký tự");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await onSubmit(reason);
      onClose();
    } catch (error: any) {
      console.error("Error submitting cancel request:", error);
      setError(error.response?.data?.message || "Không thể gửi yêu cầu hủy");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/15 backdrop-blur-[2px] flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-3">
              <div
                className={`p-2 ${
                  isPending ? "bg-orange-100" : "bg-red-100"
                } rounded-lg`}
              >
                {isPending ? (
                  <Trash2 className="text-orange-600" size={24} />
                ) : (
                  <AlertTriangle className="text-red-600" size={24} />
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {isPending ? "Xóa sự kiện" : "Gửi yêu cầu hủy sự kiện"}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                  Sự kiện: <span className="font-semibold">{eventTitle}</span>
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isSubmitting}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {isPending ? (
            // ✅ UI cho PENDING event - Xóa trực tiếp
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <p className="text-sm text-orange-800 font-medium mb-2">
                Bạn có chắc chắn muốn xóa sự kiện này?
              </p>
              <p className="text-sm text-orange-700">
                Sự kiện đang chờ duyệt có thể được xóa trực tiếp. Hành động này
                không thể hoàn tác.
              </p>
            </div>
          ) : (
            // ✅ UI cho non-PENDING event - Yêu cầu hủy
            <>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-yellow-800">
                  Bạn không thể tự hủy sự kiện đã được duyệt. Hãy gửi yêu cầu để
                  Admin xem xét và phê duyệt.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reason"
                  className="block text-sm font-semibold text-gray-900 mb-2"
                >
                  Lý do yêu cầu hủy: <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="reason"
                  value={reason}
                  onChange={(e) => {
                    setReason(e.target.value);
                    setError("");
                  }}
                  placeholder="Nhập lý do muốn hủy sự kiện..."
                  rows={5}
                  className={`w-full px-4 py-3 border ${
                    error ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none transition-all`}
                  disabled={isSubmitting}
                />
                {error ? (
                  <p className="text-xs text-red-500 mt-2">{error}</p>
                ) : (
                  <p className="text-xs text-gray-500 mt-2">
                    Tối thiểu 10 ký tự
                  </p>
                )}
              </div>
            </>
          )}

          {/* Error message cho PENDING */}
          {isPending && error && (
            <p className="text-xs text-red-500 mt-3">{error}</p>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy bỏ
          </button>

          {isPending ? (
            // ✅ Nút xóa cho PENDING event
            <button
              onClick={handleDeletePending}
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xóa...
                </>
              ) : (
                <>
                  <Trash2 size={16} />
                  Xóa sự kiện
                </>
              )}
            </button>
          ) : (
            // ✅ Nút gửi yêu cầu hủy cho non-PENDING event
            <button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !reason.trim() || reason.trim().length < 10
              }
              className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang gửi...
                </>
              ) : (
                "Gửi yêu cầu hủy"
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DeleteRequestModal;
