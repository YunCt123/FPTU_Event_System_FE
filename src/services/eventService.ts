import { apiUtils } from "../api/axios";
import { EVENT_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { CreateEventRequest, EventDeleteResponse, GetEventResponse, GetTotalEventsResponse, UpdateEventRequest, UpdateEventResponse } from "../types/Event";
import type { ApiResponse } from "../types/ApiResponse";

const eventService = {
    async getAllEvents(params?: {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        organizerId?: number;
        venueId?: number;
    }): Promise<AxiosResponse<ApiResponse<GetTotalEventsResponse[]>>> {
        return await apiUtils.get<ApiResponse<GetTotalEventsResponse[]>>(`${EVENT_URL}`);
    },

    async getEventById(id: string): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.get<ApiResponse<GetEventResponse>>(`${EVENT_URL}${id}`);
    },

    async deleteEvent(params?: { 
        id: string
        userId: number
    }): Promise<AxiosResponse<ApiResponse<EventDeleteResponse>>> {
        return await apiUtils.delete<ApiResponse<EventDeleteResponse>>(`${EVENT_URL}${params?.id}?userId=${params?.userId}`);
    },

    async patchEvent(id: string, data: {status: string}): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.patch<ApiResponse<GetEventResponse>>(`${EVENT_URL}${id}/status`, data);
    },
    
    async postEvent(data: CreateEventRequest): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.post<ApiResponse<GetEventResponse>>(`${EVENT_URL}`, data);
    },
    
    async patchEventById(params?: {
        id: string;
        data: UpdateEventRequest;
    }): Promise<AxiosResponse<ApiResponse<UpdateEventResponse>>> {
        return await apiUtils.patch<ApiResponse<UpdateEventResponse>>(`${EVENT_URL}${params?.id}`, params?.data);
    }

    // XÓA HOẶC COMMENT OUT hàm này
    // async getTotalEventsByMoth(param?:{
    //     year?: number;
    // }): Promise<AxiosResponse<ApiResponse<{ month: string; totalEvents: number }[]>>> {
    //     return await apiUtils.get<ApiResponse<{ month: string; totalEvents: number }[]>>(`${EVENT_URL}stats/monthly`, { param});
    // }
};

export default eventService;