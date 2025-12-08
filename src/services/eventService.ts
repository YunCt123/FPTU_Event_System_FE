import { apiUtils } from "../api/axios";
import { EVENT_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { EventDeleteResponse, GetEventResponse } from "../types/Event";
import type { ApiResponse } from "../types/ApiResponse";

const eventService = {
    async getAllEvents(params: {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  organizerId?: number;
  venueId?: number;
}): Promise<AxiosResponse<ApiResponse<GetEventResponse[]>>> {
        return await apiUtils.get<ApiResponse<GetEventResponse[]>>(`${EVENT_URL}`);
    },

    async getEventById(id: string): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.get<ApiResponse<GetEventResponse>>(`${EVENT_URL}${id}`);
    },

    async deleteEvent(id: string): Promise<AxiosResponse<ApiResponse<EventDeleteResponse>>> {
        return await apiUtils.delete<ApiResponse<EventDeleteResponse>>(`${EVENT_URL}${id}`);
    },

    async patchEvent(id: string): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.patch<ApiResponse<GetEventResponse>>(`${EVENT_URL}${id}`);
    }

};
export default eventService;