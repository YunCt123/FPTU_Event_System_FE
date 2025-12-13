import { apiUtils } from '../api/axios';
import { EVENT_URL, ORGANIZER_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { OrganizerResponse, OrganizerRequest, OrganizerDeleteResponse, OrganizerEventsResponse } from '../types/Organizer';
import type { ApiResponse } from '../types/ApiResponse';
import type { CreateStaffResponse, DeleteStaffResponse } from '../types/Staff';

const organizerService = {

    async getAllOrganizers(): Promise<AxiosResponse<ApiResponse<OrganizerResponse[]>>> {
        return await apiUtils.get<ApiResponse<OrganizerResponse[]>>(`${ORGANIZER_URL}`);
    },

    async postOrganizer(data: OrganizerRequest): Promise<AxiosResponse<ApiResponse<OrganizerResponse>>> {
        return await apiUtils.post<ApiResponse<OrganizerResponse>>(`${ORGANIZER_URL}`, data);
    },

    async putOrganizer(id: number, data: OrganizerRequest): Promise<AxiosResponse<ApiResponse<OrganizerResponse>>> {
        return await apiUtils.put<ApiResponse<OrganizerResponse>>(`${ORGANIZER_URL}${id}`, data);
    },
    
    async deleteOrganizer(id: number): Promise<AxiosResponse<ApiResponse<OrganizerDeleteResponse>>> {
        return await apiUtils.delete<ApiResponse<OrganizerDeleteResponse>>(`${ORGANIZER_URL}${id}`);
    },

    async getOrganizerEvents(params?:{
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        organizerId?: number;
        venueId?: number;
        category?: string;
    }): Promise<AxiosResponse<ApiResponse<OrganizerEventsResponse>>> {
        return await apiUtils.get<ApiResponse<OrganizerEventsResponse>>(`${EVENT_URL}my-events`, { params });
    },

    async postEventStaff(
        eventId: string,
        data:{
            userId: number;
    }): Promise<AxiosResponse<ApiResponse<CreateStaffResponse>>> {
        return await apiUtils.post<ApiResponse<CreateStaffResponse>>(`${EVENT_URL}${eventId}/staff`, data);
    },

    async deleteEventStaff(
        eventId: string,
        userId: number
    ): Promise<AxiosResponse<ApiResponse<DeleteStaffResponse>>> {
        return await apiUtils.delete<ApiResponse<DeleteStaffResponse>>(`${EVENT_URL}${eventId}/staff/${userId}`);
    }
    
};

export default organizerService;