import { useNavigate } from "react-router-dom";
import FPTLogo from "../assets/fpt_logo.png";
import { toast } from "react-toastify";
import { useState } from "react";
import authService from "../services/authService";
import { jwtDecode } from "jwt-decode";
import { GOOGLE_URL } from "../constants/apiEndPoints";
import RegisterUserModal from "../components/auth/RegisterUserModal";
import { Eye, EyeOff } from "lucide-react";
import {
  requestNotificationPermission,
  registerSubscriptionWithBackend,
  isPushNotificationsEnabled,
} from "../utils/oneSignal";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);



  const handleGoogleLogin = () => {
    window.location.href = GOOGLE_URL;
  };

  // Hàm xử lý đăng ký notification sau khi login
  const handleNotificationSubscription = async () => {
    try {

      // Kiểm tra xem user đã cho phép notification chưa
      const isEnabled = await isPushNotificationsEnabled();

      if (!isEnabled) {
        // Nếu chưa cho phép, xin quyền trước
        console.log("🔔 Xin quyền notification...");
        await requestNotificationPermission();

        // Đợi để user click Allow/Block và OneSignal xử lý
        console.log("⏳ Đợi user cho phép notification...");

        // Retry nhiều lần để đợi subscriptionId
        for (let i = 0; i < 10; i++) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
          const result = await registerSubscriptionWithBackend();
          if (result) {
            console.log("✅ Đăng ký thành công sau", i + 1, "giây");
            return;
          }
          console.log(`⏳ Retry ${i + 1}/10...`);
        }
        console.log(
          "⚠️ Không thể đăng ký sau 10 giây. User có thể chưa cho phép notification."
        );
        return;
      }

      // Đăng ký subscription với backend
      console.log("📤 Đăng ký subscription với backend...");
      const result = await registerSubscriptionWithBackend();
      console.log("📤 Kết quả đăng ký:", result);
    } catch (error) {
      console.error("❌ Failed to handle notification subscription:", error);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Vui lòng nhập mật khẩu và email!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      console.log(response.status);

      if (response.status == 201) {
        console.log(response);
        const { accessToken } = response.data;

        // Decode accessToken để lấy thông tin user
        const decodedToken: any = jwtDecode(accessToken);
        console.log("Decoded token:", decodedToken);

        // Lưu token và thông tin user
        localStorage.setItem("token", accessToken);
        localStorage.setItem("user", JSON.stringify(decodedToken));

        toast.success("Login successfully!");

        // Đăng ký nhận thông báo OneSignal sau khi login thành công
        handleNotificationSubscription();

        // Điều hướng dựa trên role từ decoded token
        const userRole =
          decodedToken.role ||
          decodedToken.roleName ||
          decodedToken[
            "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
          ];

        switch (userRole) {
          case "admin":
            navigate("/admin/dashboard");
            break;
          case "event_organizer":
            navigate("/organizer/dashboard");
            break;
          case "student":
          case "staff":
          default:
            navigate("/home");
            break;
        }
      } else {
        toast.error("Email or password is incorrect!");
      }
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.data?.message ||
        "Email or password is incorrect!";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      <div className="flex flex-col items-center justify-center px-10 lg:px-24 py-16 prose">
        <div className="w-full max-w-md border border-gray-300 p-4 rounded-lg">
          <div className="flex justify-center  mb-6">
            <img src={FPTLogo} alt="FPT Logo" className="w-32  " />
          </div>
          <h1 className="flex justify-center text-[#F27125] text-5xl font-bold mb-10 text-center lg:text-left">
            FPT Events
          </h1>
          <div className="space-y-5">
            {/* email */}
            <div className="mb-10">
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {/* password */}
            <div className="mb-10 ">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="mt-1 w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#F27125] text-white py-3 rounded-lg hover:bg-[#d95c0b] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
            <a href="#" className="text-sm text-blue-600 hover:underline">
              Quên mật khẩu
            </a>
            <div className="flex items-center space-x-2 my-6">
              <div className="grow border-t border-gray-300"></div>
              <span className="shrink text-xs text-gray-500 font-medium">
                HOẶC
              </span>
              <div className="grow border-t border-gray-300"></div>
            </div>

            {/* GOOGLE */}
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full bg-white text-gray-700 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-medium space-x-3"
            >
              <img
                src="https://www.svgrepo.com/show/353817/google-icon.svg"
                alt="Google"
                className="w-5 h-5"
              />
              <span>Đăng nhập với Google</span>
            </button>
            {/* Footer */}
            <p className="text-gray-600 text-sm mt-8 text-center">
              Bạn chưa có tài khoản?{" "}
              <button
                onClick={() => setIsRegisterOpen(true)}
                className="text-[#F27125] font-semibold hover:underline"
              >
                Đăng ký
              </button>
            </p>
          </div>
        </div>
      </div>

      <div className="hidden lg:flex items-center justify-center bg-gray-100">
        <img
          src="https://th.bing.com/th/id/R.d99b25a9c5d5b8f484cd64aec784416d?rik=ko4qFdZXR5zYYQ&riu=http%3a%2f%2fthongtintuyensinh247.com%2fwp-content%2fuploads%2f2023%2f08%2ffpt.jpeg&ehk=LPscQ%2bnrlL5fytxXaZ%2fgbqs%2f6uiZs5tKzvrR0LjPbpQ%3d&risl=&pid=ImgRaw&r=0"
          alt="FPT University Campus"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Register Modal */}
      <RegisterUserModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
      />
    </div>
  );
};

export default LoginPage;
