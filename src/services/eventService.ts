import { apiUtils } from "../api/axios";
import { EVENT_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type {
  CancellationReason,
  CreateEventRequest,
  DeleteEventByOrganizersRequest,
  DeleteEventByOrganizersResponse,
  EventDeleteResponse,
  GetEventResponse,
  GetTotalEventsResponse,
  UpdateEventRequest,
  UpdateEventResponse,
  GetDeleteRequestsResponse,
  BookingWeeklyResponse,
  BookingWeeklyRequest,
} from "../types/Event";
import type { ApiResponse } from "../types/ApiResponse";
import type {
  BookingOnlineRequest,
  BookingOnlineResponse,
} from "../types/Event";

const eventService = {
  async getAllEvents(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    organizerId?: number;
    venueId?: number;
  }): Promise<AxiosResponse<ApiResponse<GetTotalEventsResponse[]>>> {
    // SỬA LẠI: truyền params trực tiếp, KHÔNG bọc trong { params: params }
    return await apiUtils.get<ApiResponse<GetTotalEventsResponse[]>>(
      `${EVENT_URL}`,
      params
    );
  },

  async getEventById(
    id: string
  ): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
    console.log("API Call: getEventById with ID:", id);
    console.log("Full URL:", `${EVENT_URL}${id}`);

    const response = await apiUtils.get<ApiResponse<GetEventResponse>>(
      `${EVENT_URL}${id}`
    );

    console.log("API Response:", response);
    return response;
  },

  async deleteEvent(
    params: { id: string; userId?: number } | string
  ): Promise<AxiosResponse<ApiResponse<EventDeleteResponse>>> {
    const payload = typeof params === "string" ? { id: params } : params;
    const query = payload.userId ? `?userId=${payload.userId}` : "";
    return await apiUtils.delete<ApiResponse<EventDeleteResponse>>(
      `${EVENT_URL}${payload.id}${query}`
    );
  },

  // ✅ API XÓA SỰ KIỆN CHO ORGANIZER (CHỈ PENDING STATUS)
  async deleteEventByOrganizer(
    id: string
  ): Promise<AxiosResponse<ApiResponse<EventDeleteResponse>>> {
    return await apiUtils.delete<ApiResponse<EventDeleteResponse>>(
      `${EVENT_URL}${id}`
    );
  },

  async patchEvent(
    id: string,
    data: { status: string }
  ): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
    return await apiUtils.patch<ApiResponse<GetEventResponse>>(
      `${EVENT_URL}${id}/status`,
      data
    );
  },

  async postEvent(
    data: CreateEventRequest
  ): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
    return await apiUtils.post<ApiResponse<GetEventResponse>>(
      `${EVENT_URL}`,
      data
    );
  },

  async approveDeleteRequest(params: {
    requestId: number;
    status: "APPROVED" | "REJECTED";
    adminNote?: string;
  }): Promise<AxiosResponse<ApiResponse<any>>> {
    console.group("APPROVE/REJECT DELETE REQUEST");
    console.log("1. Request ID:", params.requestId);
    console.log("2. Status:", params.status);
    console.log("3. Admin Note:", params.adminNote);
    console.log(
      "4. Full URL:",
      `${EVENT_URL}cancellation-requests/${params.requestId}/status`
    );
    console.log("5. Request Body:", {
      status: params.status,
      adminNote:
        params.adminNote || "Đã xem xét và chấp thuận yêu cầu hủy sự kiện",
    });
    console.groupEnd();
    return await apiUtils.patch<ApiResponse<any>>(
      `${EVENT_URL}cancellation-requests/${params.requestId}/status`,
      {
        status: params.status,
        adminNote:
          params.adminNote || "Đã xem xét và chấp thuận yêu cầu hủy sự kiện",
      }
    );
  },

  async patchEventById({
    id,
    data,
  }: {
    id: string;
    data: UpdateEventRequest;
  }): Promise<AxiosResponse<ApiResponse<UpdateEventResponse>>> {
    console.log("Patching event:", id, "with data:", data);
    return await apiUtils.patch<ApiResponse<UpdateEventResponse>>(
      `${EVENT_URL}${id}`,
      data
    );
  },

  // ✅ API GỬI YÊU CẦU XÓA TỪ ORGANIZER (KHÔNG ĐỔI STATUS)
  async requestCancelEvent(params: {
    eventId: string;
    data: DeleteEventByOrganizersRequest;
  }): Promise<AxiosResponse<ApiResponse<DeleteEventByOrganizersResponse>>> {
    console.log("📤 Organizer sending cancel request:", params);
    return await apiUtils.post<ApiResponse<DeleteEventByOrganizersResponse>>(
      `${EVENT_URL}${params.eventId}/cancel`,
      params.data
    );
  },

  // ✅ API LẤY DANH SÁCH YÊU CẦU XÓA (ADMIN)
  async getDeleteRequests(params?: {
    page?: number;
    limit?: number;
    status?: string;
    eventId?: string;
    requestedBy?: number;
  }): Promise<AxiosResponse<ApiResponse<GetDeleteRequestsResponse>>> {
    console.log("📋 Fetching delete requests with params:", params);
    return await apiUtils.get<ApiResponse<GetDeleteRequestsResponse>>(
      `${EVENT_URL}cancellation-requests`,
      params
    );
  },

  async postCancellationReason(data: {
    reason: string;
    isActive: boolean;
  }): Promise<AxiosResponse<ApiResponse<CancellationReason>>> {
    return await apiUtils.post<ApiResponse<CancellationReason>>(
      `${EVENT_URL}cancellations`,
      data
    );
  },

  async bookingOnline(
    data: BookingOnlineRequest
  ): Promise<AxiosResponse<BookingOnlineResponse>> {
    return await apiUtils.post<BookingOnlineResponse>(`${EVENT_URL}`, data);
  },

  async bookingWeekly(
    data: BookingWeeklyRequest
  ): Promise<AxiosResponse<BookingWeeklyResponse>> {
    return await apiUtils.post<BookingWeeklyResponse>(`${EVENT_URL}`, data);
  },
};

export default eventService;
