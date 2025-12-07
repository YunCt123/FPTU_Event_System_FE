import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Building2,
  MapPin,
  Users,
  ChevronDown,
  ChevronRight,
  Map,
  UserCog,
} from 'lucide-react';

interface SideBarProps {
  userRole: 'admin' | 'organizer';
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  path?: string;
  children?: MenuItem[];
}

const SideBar = ({ userRole }: SideBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedMenus, setExpandedMenus] = useState<string[]>([]);

  // Admin menu items
  const adminMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/admin/dashboard',
    },
    {
      id: 'events',
      label: 'Quản lý Sự kiện',
      icon: <Calendar size={20} />,
      children: [
        {
          id: 'events-list',
          label: 'Danh sách sự kiện',
          icon: <Building2 size={18} />,
          path: '/admin/list-events',
        },
        {
          id: 'events-doashboard',
          label: 'Tổng kết sự kiện',
          icon: <Building2 size={18} />,
          path: '/admin/dashboard-events',
        }
      ],
    },
    {
      id: 'venues',   
      label: 'Quản lý Địa điểm',
      icon: <Building2 size={20} />,
      path: '/admin/venues',
    },
    {
      id: 'organizers',
      label: 'Quản lý Organizer',
      icon: <Users size={20} />,
      path: '/admin/organizers',
    },
    {
      id: 'campuses',
      label: 'Quản lý Campus',
      icon: <Map size={20} />,
      path: '/admin/campuses',
    },
  ];

  // Organizer menu items
  const organizerMenuItems: MenuItem[] = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <LayoutDashboard size={20} />,
      path: '/organizer/dashboard',
    },
    {
      id: 'events',
      label: 'Quản lý Sự kiện',
      icon: <Calendar size={20} />,
      path: '/organizer/events',
    },
    {
      id: 'attendees',
      label: 'Người tham dự',
      icon: <Users size={20} />,
      path: '/organizer/attendees',
    },
    {
      id: 'staff',
      label: 'Quản lý Staff',
      icon: <UserCog size={20} />,
      path: '/organizer/staff',
    },
    {
      id: 'reports',
      label: 'Báo cáo',
      icon: <MapPin size={20} />,
      path: '/organizer/reports',
    },
  ];

  const menuItems = userRole === 'admin' ? adminMenuItems : organizerMenuItems;

  // Auto-expand menu containing active route
  const findActiveParentMenu = (): string | null => {
    for (const item of menuItems) {
      if (item.children) {
        const hasActiveChild = item.children.some(
          (child) => child.path && location.pathname.startsWith(child.path)
        );
        if (hasActiveChild) {
          return item.id;
        }
      }
    }
    return null;
  };

  // Update expanded menus when route changes - auto focus
  useEffect(() => {
    const activeParent = findActiveParentMenu();
    if (activeParent) {
      setExpandedMenus([activeParent]);
    } else {
      setExpandedMenus([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  const toggleMenu = (menuId: string) => {
    setExpandedMenus((prev) => {
      // If clicking on already expanded menu, collapse it
      if (prev.includes(menuId)) {
        return [];
      }
      // Otherwise, expand only this menu (collapse others)
      return [menuId];
    });
  };

  const isActive = (path?: string) => {
    if (!path) return false;
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const isParentActive = (children?: MenuItem[]) => {
    if (!children) return false;
    return children.some((child) => isActive(child.path));
  };

  const handleNavigation = (path?: string) => {
    if (path) {
      navigate(path);
    }
  };

  const renderMenuItem = (item: MenuItem, level: number = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedMenus.includes(item.id);
    const itemIsActive = isActive(item.path);
    const parentIsActive = isParentActive(item.children);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleMenu(item.id);
            } else {
              handleNavigation(item.path);
            }
          }}
          className={`
            w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-all
            ${level > 0 ? 'pl-12' : ''}
            ${
              itemIsActive || parentIsActive
                ? 'bg-[#F27125] text-white shadow-md'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
        >
          <div className="flex items-center gap-3">
            <span
              className={`
                ${itemIsActive || parentIsActive ? 'text-white' : 'text-gray-500'}
              `}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </div>
          {hasChildren && (
            <span>
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </span>
          )}
        </button>

        {/* Render children */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {item.children!.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 h-screen sticky top-0 flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 shrink-0">
        <div className="flex items-center gap-3">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/")}
          >
          <div className="w-10 h-10 rounded-lg bg-[#F27125] flex items-center justify-center text-white font-bold text-xl shadow-md transform hover:scale-105 transition-transform">
              F
            </div>
          <div>
            <h2 className="font-bold text-gray-900">FPT-Event</h2>
            <p className="text-xs text-gray-500">
              {userRole === 'admin' ? 'Admin Panel' : 'Organizer Panel'}
            </p>
          </div>
          </div>
        </div>
      </div>

      {/* Navigation Menu - Scrollable */}
      <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
        {menuItems.map((item) => renderMenuItem(item))}
      </nav>

      {/* Footer - Always at bottom */}
      <div className="p-4 border-t border-gray-200 shrink-0 bg-white">
        <div className="text-xs text-gray-500 text-center">
          <p>FPTU Internal Ticketing</p>
          <p className="mt-1">© 2025 FPT-Event</p>
        </div>
      </div>
    </aside>
  );
};

export default SideBar;
