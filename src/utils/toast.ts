import { toast } from 'react-toastify';

/**
 * Toast Notification Helper Functions
 * Sử dụng các function này để hiển thị thông báo trong app
 */

// Success notification - màu xanh
export const showSuccess = (message: string) => {
  toast.success(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Error notification - màu đỏ
export const showError = (message: string) => {
  toast.error(message, {
    position: 'top-right',
    autoClose: 4000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Warning notification - màu vàng
export const showWarning = (message: string) => {
  toast.warning(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Info notification - màu xanh dương
export const showInfo = (message: string) => {
  toast.info(message, {
    position: 'top-right',
    autoClose: 3000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
  });
};

// Loading notification with promise
export const showLoading = (promise: Promise<any>, messages: {
  pending: string;
  success: string;
  error: string;
}) => {
  return toast.promise(promise, {
    pending: messages.pending,
    success: messages.success,
    error: messages.error,
  });
};

// Custom toast với options
export const showCustomToast = (message: string, options?: any) => {
  toast(message, options);
};
