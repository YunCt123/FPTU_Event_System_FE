import { apiUtils } from "../api/axios";
import { EVENT_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { Event, GetEventResponse } from "../types/Event";
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

    async getEventById(id: number): Promise<AxiosResponse<ApiResponse<Event>>> {
        return await apiUtils.get<ApiResponse<Event>>(`${EVENT_URL}${id}`);
    },

    async deleteEvent(id: number): Promise<AxiosResponse<ApiResponse<null>>> {
        return await apiUtils.delete<ApiResponse<null>>(`${EVENT_URL}${id}`);
    }

};
export default eventService;