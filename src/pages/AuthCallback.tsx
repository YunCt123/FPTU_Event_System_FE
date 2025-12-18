import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { toast } from "react-toastify";
import {
  requestNotificationPermission,
  registerSubscriptionWithBackend,
  isPushNotificationsEnabled,
} from "../utils/oneSignal";
import { apiUtils } from "../api/axios";
import { AUTH_URL } from "../constants/apiEndPoints";
import type { ApiResponse } from "../types/ApiResponse";

const AuthCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Hàm xử lý đăng ký notification sau khi login
  const handleNotificationSubscription = async () => {
    try {
      console.log("🚀 Bắt đầu đăng ký notification...");

      // Kiểm tra xem user đã cho phép notification chưa
      const isEnabled = await isPushNotificationsEnabled();
      console.log("🔔 Push notifications enabled:", isEnabled);

      if (!isEnabled) {
        // Nếu chưa cho phép, xin quyền trước
        console.log("🔔 Xin quyền notification...");
        await requestNotificationPermission();
        // Đợi 2 giây cho OneSignal xử lý
        await new Promise((resolve) => setTimeout(resolve, 2000));
      }

      // Dang ky subscription v?i backend
      console.log("?? Dang ky subscription v?i backend...");
      const result = await registerSubscriptionWithBackend();
      console.log("?? K?t qu? dang ky:", result);
    } catch (error) {
      console.error("? Failed to handle notification subscription:", error);
    }
  };

  useEffect(() => {
    const processAuthToken = () => {
      // 1. Phân tích URL để tìm kiếm token (support query hoặc hash, token/accessToken/access_token)
      const params = new URLSearchParams(location.search);
      const hashParams = new URLSearchParams(location.hash.replace(/^#/, ""));
      const accessToken =
        params.get("token") ||
        params.get("accessToken") ||
        params.get("access_token") ||
        hashParams.get("token") ||
        hashParams.get("accessToken") ||
        hashParams.get("access_token");
      const authCode = params.get("code") || hashParams.get("code");

      const exchangeCodeForToken = async (): Promise<string | null> => {
        if (!authCode) return null;
        try {
          // G?i backend ? exchange code -> accessToken
          const response = await apiUtils.get<
            ApiResponse<{ accessToken?: string; token?: string }>
          >(`${AUTH_URL}google/callback`, { code: authCode });
          const tokenFromApi =
            (response as any)?.data?.accessToken ||
            (response as any)?.accessToken ||
            (response as any)?.token;
          return tokenFromApi || null;
        } catch (error) {
          console.error("L?i exchange code Google:", error);
          return null;
        }
      };

      const handleToken = (token: string) => {
        // 2. Decode token và lưu vào LocalStorage
        const decodedToken: any = jwtDecode(token);

        localStorage.setItem("token", token);
        sessionStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(decodedToken));
        sessionStorage.setItem("user", JSON.stringify(decodedToken));

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
            navigate("/organizer/dashboard", { replace: true });
            break;
          case "student":
          case "staff":
          default:
            navigate("/home", { replace: true });
            break;
        }
      };

      const start = async () => {
        try {
          if (accessToken) {
            handleToken(accessToken);
            return;
          }

          const tokenFromCode = await exchangeCodeForToken();
          if (tokenFromCode) {
            handleToken(tokenFromCode);
            return;
          }

          toast.error("Đăng nhập Google thất bại hoặc không nhận được token.");
          navigate("/login", { replace: true });
        } catch (error) {
          // Xử lý lỗi giải mã token
          console.error("Lỗi xử lý Google callback:", error);
          toast.error("Lỗi xác thực. Vui lòng thử lại.");
          navigate("/login", { replace: true });
        }
      };

      void start();
    };

    processAuthToken();
  }, [location, navigate]); // Chạy khi component mount hoặc location thay đổi

  // Hiện thị giao diện Loading
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
