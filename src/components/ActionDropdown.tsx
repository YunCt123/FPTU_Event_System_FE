import { MoreVertical } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";


interface DropdownAction {
  label: string;
  icon?: LucideIcon;
  onClick: () => void;
  danger?: boolean; 
  disabled?: boolean;
}

interface ActionDropdownProps {
  actions: DropdownAction[];
}

const ActionDropdown = ({ actions }: ActionDropdownProps) => {
  const [open, setOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);


  // Click outside → close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Check if dropdown should open upward
  useEffect(() => {
    if (open && buttonRef.current && dropdownRef.current) {
      const buttonRect = buttonRef.current.getBoundingClientRect();
    const dropdownHeight = dropdownRef.current.offsetHeight;
    const spaceBelow = window.innerHeight - buttonRect.bottom;// Approximate height
      
      // If not enough space below, open upward
      setDropUp(spaceBelow < dropdownHeight && buttonRect.top > dropdownHeight);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative inline-block">
      {/* 3 dots */}
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-all duration-150 ease-in-out transform active:scale-95"
        aria-label="Actions"
      >
        <MoreVertical size={18} className="text-gray-600" />
      </button>

      {/* Dropdown */}
      {open && (
        <div 
          ref={dropdownRef}
          className={`absolute right-0 z-[9999] w-44 rounded-lg bg-white border border-gray-200 shadow-lg animate-slideDown
            ${dropUp ? 'bottom-full mb-2' : 'top-full mt-2'}
          `}
        >
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <button
                key={index}
                onClick={() => {
                  action.onClick();
                  setOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors duration-150
                  ${index === 0 ? 'rounded-t-lg' : ''}
                  ${index === actions.length - 1 ? 'rounded-b-lg' : ''}
                  ${action.danger 
                    ? 'text-red-600 hover:bg-red-50 active:bg-red-100' 
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                  }
                `}
              >
                {Icon && <Icon size={16} className={action.danger ? 'text-red-500' : 'text-gray-500'} />}
                <span className="font-medium">{action.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ActionDropdown;
