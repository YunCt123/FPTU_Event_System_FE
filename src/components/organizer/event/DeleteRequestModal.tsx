import { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DeleteRequestModalProps {
  eventTitle: string;
  eventId: string; 
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>; 
}

const DeleteRequestModal = ({ eventTitle, eventId, onClose, onSubmit }: DeleteRequestModalProps) => {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    // ✅ VALIDATION
    if (!reason.trim()) {
      setError('Vui lòng nhập lý do xóa sự kiện');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Lý do phải có ít nhất 10 ký tự');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await onSubmit(reason);
      onClose();
    } catch (error: any) {
      console.error('Error submitting delete request:', error);
      setError(error.response?.data?.message || 'Không thể gửi yêu cầu xóa');
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
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="text-red-600" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Gửi yêu cầu xóa sự kiện
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-yellow-800">
              Bạn không thể tự xóa sự kiện. Hãy gửi yêu cầu để Admin xem xét và phê duyệt.
            </p>
          </div>

          <div>
            <label htmlFor="reason" className="block text-sm font-semibold text-gray-900 mb-2">
              Lý do yêu cầu: <span className="text-red-500">*</span>
            </label>
            <textarea
              id="reason"
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              placeholder="Nhập lý do muốn xóa sự kiện..."
              rows={5}
              className={`w-full px-4 py-3 border ${
                error ? 'border-red-500' : 'border-gray-300'
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
        </div>

        {/* Footer */}
        <div className="p-6 bg-gray-50 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Đang gửi...
              </>
            ) : (
              'Gửi yêu cầu'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRequestModal;