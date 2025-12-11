import { toast } from "react-toastify";

const Logout = () => {
    const handleLogout = () => {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        localStorage.removeItem("user");
        window.location.href = "/login";
        toast.success("Logged out successfully!");
    }
    return (handleLogout());
};

export default Logout;