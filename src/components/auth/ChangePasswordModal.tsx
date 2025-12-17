import { useState } from "react";
import type { ChangePasswordRequest } from "../../types/Auth";
import { authService } from "../../services";
import { toast } from "react-toastify";
import { Lock, X, Eye, EyeOff, Loader } from "lucide-react";

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const ChangePasswordModal = ({ isOpen, onClose }: ChangePasswordModalProps) => {
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<ChangePasswordRequest>({
        currentPassword: "",
        newPassword: ""
    });
    const [passwordConfirm, setPasswordConfirm] = useState<string>("");
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleClose = () => {
        setFormData({ currentPassword: "", newPassword: "" });
        setPasswordConfirm("");
        setShowCurrentPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
        onClose();
    };

    const handleSubmit = async(e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.currentPassword) {
            toast.error("Vui lòng nhập mật khẩu hiện tại");
            return;
        }

        if (!formData.newPassword) {
            toast.error("Vui lòng nhập mật khẩu mới");
            return;
        }

        if (formData.newPassword.length < 6) {
            toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
            return;
        }

        if (formData.newPassword !== passwordConfirm) {
            toast.error("Mật khẩu xác nhận không khớp");
            return;
        }

        if (formData.currentPassword === formData.newPassword) {
            toast.error("Mật khẩu mới phải khác mật khẩu hiện tại");
            return;
        }

        setIsLoading(true);
        try {
            const response = await authService.changePassword(formData);
            if (response.data.message === "Đổi mật khẩu thành công") {
                toast.success(response.data.message);
                handleClose();
            }
        } catch (error: any) {
            console.error('Error changing password:', error);
            const errorMessage = error.response?.data?.message || 'Đổi mật khẩu thất bại. Vui lòng thử lại!';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={handleClose}>
            <div 
                className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#F27125]/10 rounded-lg">
                            <Lock className="text-[#F27125]" size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900">Đổi mật khẩu</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    {/* Current Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu hiện tại <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showCurrentPassword ? "text" : "password"}
                                name="currentPassword"
                                value={formData.currentPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                                placeholder="Nhập mật khẩu hiện tại"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showNewPassword ? "text" : "password"}
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                                placeholder="Nhập mật khẩu mới (ít nhất 6 ký tự)"
                                disabled={isLoading}
                                minLength={6}
                            />
                            <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Confirm New Password */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={passwordConfirm}
                                onChange={(e) => setPasswordConfirm(e.target.value)}
                                className="w-full px-4 py-2.5 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
                                placeholder="Nhập lại mật khẩu mới"
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Info */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-sm text-blue-800">
                            <strong>Lưu ý:</strong> Mật khẩu mới phải có ít nhất 6 ký tự và khác với mật khẩu hiện tại.
                        </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d95c0b] transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader size={18} className="animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <Lock size={18} />
                                    Đổi mật khẩu
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}



export default ChangePasswordModal