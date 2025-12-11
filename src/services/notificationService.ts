import { apiUtils } from "../api/axios";
import { NOTIFICATION_URL } from "../constants/apiEndPoints";
import type { ApiResponse } from "../types/ApiResponse";
import type { AxiosResponse } from "axios";

/**
 * Interface cho request đăng ký subscription
 */
export interface SubscriptionRequest {
  subscriptionId: string;
  deviceId?: string;
}

/**
 * Interface cho response đăng ký subscription
 */
export interface SubscriptionResponse {
  registered: boolean;
}

/**
 * Notification Service - Xử lý các request liên quan đến notifications
 */
const notificationService = {
  /**
   * Đăng ký subscription với backend để nhận thông báo đích danh
   * @param data - subscriptionId từ OneSignal và deviceId (optional)
   * @returns Promise với response xác nhận đăng ký thành công
   */
  async registerSubscription(
    data: SubscriptionRequest
  ): Promise<AxiosResponse<ApiResponse<SubscriptionResponse>>> {
    return await apiUtils.post<ApiResponse<SubscriptionResponse>>(
      `${NOTIFICATION_URL}subscriptions`,
      data
    );
  },
};

export default notificationService;
