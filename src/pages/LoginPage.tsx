import { useNavigate } from "react-router-dom";
import FPTLogo from "../assets/fpt_logo.png";
import { toast } from "react-toastify";
import { useState } from "react";
import authService from "../services/authService";
import { jwtDecode } from "jwt-decode";

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Please enter both email and password!");
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
        
        // Điều hướng dựa trên role từ decoded token
        const userRole = decodedToken.role || decodedToken.roleName || decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
        
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
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 
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
            <img src={FPTLogo} alt="FPT Logo" 
            className="w-32  " />
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
            <div className="mb-10">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Password</label>
                <a
                  href="#"
                  className="text-sm text-blue-600 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="mt-1 w-full border rounded-lg px-3 py-2.5 outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <button
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-[#F27125] text-white py-3 rounded-lg hover:bg-[#d95c0b] transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
            {/* Footer */}
            <p className="text-gray-600 text-sm mt-8 text-center">
              Don't have an account?{" "}
              <a href="#" className="text-[#F27125] font-semibold hover:underline">
                Sign Up
              </a>
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
    </div>
  );
};

export default LoginPage;