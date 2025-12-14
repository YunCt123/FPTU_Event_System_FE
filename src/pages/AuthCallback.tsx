import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  requestNotificationPermission,
  registerSubscriptionWithBackend,
  isPushNotificationsEnabled,
} from "../utils/oneSignal";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm xử lý đăng ký notification sau khi login
  const handleNotificationSubscription = async () => {
    try {
      console.log("🔔 Bắt đầu đăng ký notification...");

      // Kiểm tra xem user đã cho phép notification chưa
      const isEnabled = await isPushNotificationsEnabled();
      console.log("📋 Push notifications enabled:", isEnabled);

      if (!isEnabled) {
        // Nếu chưa cho phép, xin quyền trước
        console.log("🔔 Xin quyền notification...");
        await requestNotificationPermission();
        // Đợi 2 giây cho OneSignal xử lý
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Đăng ký subscription với backend
      console.log("📤 Đăng ký subscription với backend...");
      const result = await registerSubscriptionWithBackend();
      console.log("📤 Kết quả đăng ký:", result);
    } catch (error) {
      console.error("❌ Failed to handle notification subscription:", error);
    }
  };

  useEffect(() => {
    const processAuthToken = () => {
      // 1. Phân tích URL để tìm kiếm token
      const params = new URLSearchParams(location.search);
      const accessToken = params.get("token");

      if (!accessToken) {
        // Xử lý trường hợp không có token (ví dụ: Google từ chối)
        toast.error("Đăng nhập Google thất bại hoặc không nhận được token.");
        navigate("/login", { replace: true });
        return;
      }

      try {
        // 2. Decode token và lưu vào LocalStorage
        const decodedToken: any = jwtDecode(accessToken);

        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(decodedToken));

        toast.success("Đăng nhập bằng Google thành công!");

        // Đăng ký nhận thông báo OneSignal sau khi login thành công
        handleNotificationSubscription();

        // 3. Điều hướng dựa trên Role (Lấy logic từ LoginPage.jsx)
        const userRole =
          decodedToken.role ||
          decodedToken.roleName ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        switch (userRole) {
          case "admin":
            navigate("/admin/dashboard", { replace: true });
            break;
          case "event_organizer":
            navigate("/organizer", { replace: true });
            break;
          case "student":
          case "staff":
          default:
            navigate("/home", { replace: true });
            break;
        }
      } catch (error) {
        // Xử lý lỗi giải mã token
        console.error("Lỗi giải mã token:", error);
        toast.error("Lỗi xác thực. Vui lòng thử lại.");
        navigate("/login", { replace: true });
      }
    };

    processAuthToken();
  }, [location, navigate]); // Chạy khi component mount hoặc location thay đổi

  // Hiển thị giao diện Loading
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27125] mx-auto mb-4"></div>
        <p className="text-lg text-gray-700">Đang xử lý đăng nhập Google...</p>
        <p className="text-sm text-gray-500 mt-2">Vui lòng chờ...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
