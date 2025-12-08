import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface EventModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const EventModal: React.FC<EventModalProps> = ({ title, children, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 10);
  }, []);

  const handleClose = () => {
    setShow(false);
    setTimeout(() => onClose(), 200);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/25"
      onClick={handleClose}
    >
      <div
        className={`
          bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col
          transition-all duration-200 transform
          ${show ? "opacity-100 scale-100" : "opacity-0 scale-90"}
        `}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-white">
          <h2 className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          {children}
        </div>
      </div>
    </div>
  );
};

export default EventModal;
