import { apiUtils } from "../api/axios";
import { SEAT_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/ApiResponse";

const seatService = {
  /**
   * Lấy danh sách ghế theo venueId
   * Nếu truyền eventId sẽ trả về trạng thái isBooked theo event đó
   * @param venueId - Venue ID (required)
   * @param eventId - Event ID để check availability (optional)
   */
  async getSeatsByVenue(
    venueId: string,
    eventId?: string
  ): Promise<AxiosResponse<ApiResponse<any>>> {
    const url = `${SEAT_URL}venue/${venueId}`;
    const params = eventId ? { eventId } : undefined;
    return await apiUtils.get<ApiResponse<any>>(url, params);
  },

  /**
   * Cập nhật loại ghế (standard, vip, etc.)
   * @param seatId - Seat ID (required)
   * @param seatType - Loại ghế: "standard" hoặc "vip"
   * @param eventId - Event ID (required)
   */
  async updateSeatType(
    seatId: number,
    seatType: string,
    eventId: string
  ): Promise<AxiosResponse<ApiResponse<any>>> {
    const url = `${SEAT_URL}${seatId}/type`;
    return await apiUtils.patch<ApiResponse<any>>(url, { seatType, eventId });
  },
};

export default seatService;
