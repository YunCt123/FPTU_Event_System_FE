import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface EventModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const EventModal = ({ title, onClose, children }: EventModalProps) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 10);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      
      {/* Modal content */}
      <div
        className={`
          bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto
          transition-all duration-200 transform
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-2xl font-bold text-gray-900">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
