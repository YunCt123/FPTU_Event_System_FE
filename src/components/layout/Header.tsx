import { useEffect, useState } from "react";
import {
  Menu,
  X,
  Search,
  LogOut,
  ChevronDown,
  UserRound,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../services";
import type { User } from "../../types/User";
import { NotificationDropdown } from "../notification";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const navigate = useNavigate();
  const users = localStorage.getItem("user");
  const UserLoggedIn = users ? JSON.parse(users) : null;
  const [userLoggedIn, setUserLoggedIn] = useState<User>();
  console.log("object", UserLoggedIn);

  const user = {
    isLoggedIn: true,
    name: "Nguyen Van A",
    role: "admin",
    avatar:
      "https://ui-avatars.com/api/?name=Nguyen+Van+A&background=F27125&color=fff",
  };

  const fetchUser = async () => {
    try {
      const response = await userService.getUserInUse();
      if (response.status === 200) {
        setUserLoggedIn(response.data.data);
        console.log("User in use:", response.data);
      } else {
        console.log("Not user or Api");
      }
    } catch (error) {
      console.log("Error fetching user in use:", error);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const navItems = [
    { label: "Trang chủ", href: "/home" },
    { label: "Về chúng tôi", href: "/about" },
    ...(UserLoggedIn?.roleName === "event_organizer"
      ? [{ label: "Dashboard", href: "/organizer/dashboard" }]
      : []),
    ...(UserLoggedIn?.roleName === "admin"
      ? [{ label: "Dashboard", href: "/admin/dashboard" }]
      : []),
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => (window.location.href = "/home")}
          >
            <div className="w-10 h-10 rounded-lg bg-[#F27125] flex items-center justify-center text-white font-bold text-xl shadow-md transform hover:scale-105 transition-transform">
              F
            </div>
            <div className="hidden md:flex flex-col">
              <span className="text-lg font-bold text-gray-800 leading-none">
                F-Event
              </span>
              <span className="text-xs text-gray-500 font-medium">
                FPTU Internal Ticketing
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-[#F27125] transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#F27125] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <NotificationDropdown />
            <div className="relative">
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-1 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
              >
                <span className="text-sm font-medium text-gray-700 hidden sm:block">
                  {userLoggedIn?.firstName.split(" ").pop()}
                </span>
                <img
                  src={userLoggedIn?.avatar}
                  alt="Avatar"
                  className="w-8 h-8 rounded-full border border-gray-200"
                />
                <ChevronDown
                  size={14}
                  className="text-gray-400 hidden sm:block"
                />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-gray-100 mb-1">
                    <p className="text-sm font-semibold text-gray-800">
                      {userLoggedIn?.firstName} {userLoggedIn?.lastName}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {userLoggedIn?.roleName}
                    </p>
                  </div>

                  <a
                    href="/profile"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-[#F27125]"
                  >
                    <UserRound size={16} /> Hồ sơ cá nhân
                  </a>

                  <div className="border-t border-gray-100 mt-1 pt-1">
                    <button
                      onClick={() => navigate("/login")}
                      className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut size={16} /> Đăng xuất
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="md:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white absolute w-full shadow-lg h-screen">
          <div className="p-4 space-y-4">
            {/* Mobile Search */}
            <div className="flex items-center bg-gray-100 rounded-lg px-3 py-2">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Tìm kiếm sự kiện..."
                className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full"
              />
            </div>

            <nav className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-orange-50 hover:text-[#F27125] font-medium"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
