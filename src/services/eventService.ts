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
} from "../types/Event";
import type { ApiResponse } from "../types/ApiResponse";
import type { BookingOnlineRequest, BookingOnlineResponse } from "../types/Event";

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
        return await apiUtils.get<ApiResponse<GetTotalEventsResponse[]>>(`${EVENT_URL}`, params);
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

  async deleteEvent(params?: {
    id: string;
    userId: number;
  }): Promise<AxiosResponse<ApiResponse<EventDeleteResponse>>> {
    return await apiUtils.delete<ApiResponse<EventDeleteResponse>>(
      `${EVENT_URL}${params?.id}?userId=${params?.userId}`
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

    async bookingOnline(data: BookingOnlineRequest): Promise<AxiosResponse<BookingOnlineResponse>> {
        return await apiUtils.post<BookingOnlineResponse>(
            `${EVENT_URL}`, data
        );
    },

    
    
};

export default eventService;
