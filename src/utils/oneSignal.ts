import { toast } from "react-toastify";
import notificationService from "../services/notificationService";

// Declare OneSignal on window
declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignalDeferred?: any[];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    OneSignal?: any;
  }
}

/**
 * OneSignal App ID - Lấy từ biến môi trường
 */
const ONESIGNAL_APP_ID = import.meta.env.VITE_ONESIGNAL_APP_ID || "";

/**
 * Các loại notification từ backend
 */
export type NotificationType =
  | "staff_assigned"
  | "event_created"
  | "event_approved"
  | "event_rejected"
  | "one_day"
  | "thirty_min"
  | "incident_reported";

/**
 * Interface cho notification data từ backend
 */
export interface NotificationData {
  eventId?: string;
  type?: NotificationType;
  startTime?: string;
  endTime?: string;
  status?: "PENDING" | "PUBLISHED" | "CANCELED";
  // Thêm fields cho incident_reported
  incidentId?: string;
  severity?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  reporterName?: string;
}

/**
 * Khởi tạo OneSignal
 */
export const initOneSignal = async (): Promise<void> => {
  if (!ONESIGNAL_APP_ID) {
    console.warn(
      "⚠️ OneSignal App ID chưa được cấu hình. Thêm VITE_ONESIGNAL_APP_ID vào file .env"
    );
    return;
  }

  console.log("🚀 Đang khởi tạo OneSignal với App ID:", ONESIGNAL_APP_ID);

  window.OneSignalDeferred = window.OneSignalDeferred || [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  window.OneSignalDeferred.push(async function (OneSignal: any) {
    try {
      await OneSignal.init({
        appId: ONESIGNAL_APP_ID,
        allowLocalhostAsSecureOrigin: true,
      });

      console.log("✅ OneSignal initialized successfully");

      // Thiết lập click handler
      setupNotificationClickHandler(OneSignal);

      // Lắng nghe subscription change
      OneSignal.User.PushSubscription.addEventListener(
        "change",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        async (event: any) => {
          console.log("🔔 Subscription changed:", event);
          const subscriptionId = OneSignal.User.PushSubscription.id;
          console.log("🔑 New subscription ID:", subscriptionId);

          if (subscriptionId) {
            const token =
              localStorage.getItem("token") || sessionStorage.getItem("token");
            if (token) {
              await registerSubscriptionWithBackend();
            }
          }
        }
      );

      // Kiểm tra existing subscription
      const subscriptionId = OneSignal.User.PushSubscription.id;
      console.log("🔑 Current subscription ID:", subscriptionId);

      if (subscriptionId) {
        const token =
          localStorage.getItem("token") || sessionStorage.getItem("token");
        if (token) {
          console.log("📤 Auto-registering existing subscription...");
          await registerSubscriptionWithBackend();
        }
      }
    } catch (error) {
      console.error("❌ Failed to initialize OneSignal:", error);
    }
  });
};

/**
 * Xin quyền thông báo từ user
 */
export const requestNotificationPermission = async (): Promise<boolean> => {
  try {
    console.log("🔔 Đang xin quyền notification...");

    const permission = await Notification.requestPermission();
    console.log("📋 Permission result:", permission);

    if (permission === "granted") {
      console.log("✅ User đã cho phép notification!");
      return true;
    } else {
      console.log("❌ User từ chối hoặc dismiss notification");
      return false;
    }
  } catch (error) {
    console.error("❌ Failed to request notification permission:", error);
    return false;
  }
};

/**
 * Lấy subscription ID từ OneSignal
 */
export const getSubscriptionId = async (): Promise<string | null> => {
  try {
    if (window.OneSignal) {
      const subscriptionId = window.OneSignal.User?.PushSubscription?.id;
      return subscriptionId || null;
    }
    return null;
  } catch (error) {
    console.error("Failed to get subscription ID:", error);
    return null;
  }
};

/**
 * Kiểm tra user đã cho phép push notifications chưa
 */
export const isPushNotificationsEnabled = async (): Promise<boolean> => {
  try {
    return Notification.permission === "granted";
  } catch (error) {
    console.error("Failed to check push notifications status:", error);
    return false;
  }
};

/**
 * Đăng ký subscription với backend
 */
export const registerSubscriptionWithBackend = async (): Promise<boolean> => {
  try {
    // Kiểm tra user đã đăng nhập chưa
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) {
      console.warn("⚠️ User chưa đăng nhập. Không thể đăng ký subscription.");
      return false;
    }
    console.log("✅ Token found");

    // Lấy subscriptionId từ OneSignal
    const subscriptionId = await getSubscriptionId();
    console.log("🔑 Subscription ID từ OneSignal:", subscriptionId);

    if (!subscriptionId) {
      console.warn(
        "⚠️ Không có subscription ID. User có thể chưa cho phép thông báo."
      );
      console.log("💡 Hãy cho phép thông báo trong browser trước");
      return false;
    }

    console.log("📤 Gọi API đăng ký subscription...");
    console.log("📤 Request body:", {
      subscriptionId: subscriptionId,
      deviceId: navigator.userAgent,
    });

    // Gọi API đăng ký với backend
    const response = await notificationService.registerSubscription({
      subscriptionId: subscriptionId,
      deviceId: navigator.userAgent,
    });

    console.log("📥 Response từ backend:", response);
    console.log("📥 Response data:", response.data);

    if (response.status === 201 || response.data?.data?.registered) {
      console.log("✅ Subscription registered successfully with backend");
      return true;
    }

    return false;
  } catch (error) {
    console.error("❌ Failed to register subscription with backend:", error);
    return false;
  }
};

/**
 * Điều hướng đến trang event
 */
const navigateToEvent = (eventId: string): void => {
  window.location.href = `/events/${eventId}`;
};

/**
 * Thiết lập click handler cho notifications
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const setupNotificationClickHandler = (OneSignal: any): void => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  OneSignal.Notifications.addEventListener("click", (event: any) => {
    const data = event.notification.additionalData as
      | NotificationData
      | undefined;

    if (!data) {
      return;
    }

    switch (data.type) {
      case "staff_assigned":
        toast.info("Bạn đã được phân công làm staff cho sự kiện");
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "event_created":
        toast.success(
          "Sự kiện của bạn đã được tạo thành công - đang chờ phê duyệt"
        );
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "event_approved":
        toast.success("🎉 Sự kiện của bạn đã được phê duyệt và công bố!");
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "event_rejected":
        toast.error(
          "Sự kiện của bạn đã bị từ chối. Vui lòng kiểm tra lại thông tin."
        );
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "one_day":
        toast.info("📅 Sự kiện sắp diễn ra trong 1 ngày");
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "thirty_min":
        toast.warning("⏰ Sự kiện sắp diễn ra trong 30 phút!");
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      case "incident_reported":
        // Thông báo sự cố mới (cho Admin và Organizer)
        const severityText = data.severity || "MEDIUM";
        const reporterText = data.reporterName ? ` - Người báo: ${data.reporterName}` : "";
        toast.error(`🚨 Báo cáo sự cố mới - Mức độ: ${severityText}${reporterText}`);
        if (data.eventId) navigateToEvent(data.eventId);
        break;

      default:
        if (data.eventId) navigateToEvent(data.eventId);
    }
  });
};

/**
 * Kiểm tra xem OneSignal đã được khởi tạo chưa
 */
export const isOneSignalInitialized = (): boolean => {
  return !!ONESIGNAL_APP_ID;
};

export default {
  initOneSignal,
  requestNotificationPermission,
  getSubscriptionId,
  registerSubscriptionWithBackend,
  isOneSignalInitialized,
  isPushNotificationsEnabled,
};
