import React from "react";
import { Facebook, Youtube, Mail, MapPin, Phone, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#F27125] flex items-center justify-center text-white font-bold text-lg">
                F
              </div>
              <span className="text-xl font-bold text-gray-800">F-Event</span>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Nền tảng quản lý sự kiện và phân phối vé tự động dành riêng cho
              sinh viên và giảng viên Đại học FPT.
            </p>
            <div className="flex gap-4 pt-2">
              <a
                href="#"
                className="text-gray-400 hover:text-[#1877F2] transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-[#FF0000] transition-colors"
              >
                <Youtube size={20} />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <Globe size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Khám phá</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="/events"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Sự kiện sắp tới
                </a>
              </li>
              <li>
                <a
                  href="/rankings"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Bảng xếp hạng CLB
                </a>
              </li>
              <li>
                <a
                  href="/speakers"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Diễn giả tiêu biểu
                </a>
              </li>
              <li>
                <a
                  href="/gallery"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Thư viện ảnh
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Hỗ trợ</h3>
            <ul className="space-y-3 text-sm text-gray-500">
              <li>
                <a
                  href="/help"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Trung tâm trợ giúp
                </a>
              </li>
              <li>
                <a
                  href="/policy"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Quy định check-in
                </a>
              </li>
              <li>
                <a
                  href="/privacy"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Chính sách bảo mật
                </a>
              </li>
              <li>
                <a
                  href="/report-bug"
                  className="hover:text-[#F27125] transition-colors"
                >
                  Báo cáo lỗi hệ thống
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-gray-800 mb-4">Liên hệ</h3>
            <ul className="space-y-4 text-sm text-gray-500">
              <li className="flex items-start gap-3">
                <MapPin size={18} className="mt-0.5 shrink-0 text-[#F27125]" />
                <span>Khu Công nghệ cao TP Hồ Chí Minh</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={18} className="shrink-0 text-[#F27125]" />
                <a
                  href="mailto:daihocfpt@fpt.edu.vn"
                  className="hover:text-[#F27125]"
                >
                  daihocfpt@fpt.edu.vn
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={18} className="shrink-0 text-[#F27125]" />
                <span>(024) 7300 1866</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-sm text-center md:text-left">
            © {new Date().getFullYear()} FPT University. Capstone Project by{" "}
            <span className="text-gray-600 font-medium">FPT University</span>.
          </p>

          <div className="flex gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-gray-600">
              Privacy Policy
            </a>
            <a href="#" className="hover:text-gray-600">
              Terms of Service
            </a>
            <a href="#" className="hover:text-gray-600">
              Cookies Settings
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
