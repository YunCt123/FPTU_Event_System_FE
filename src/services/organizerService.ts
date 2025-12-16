import { apiUtils } from '../api/axios';
import { EVENT_URL, ORGANIZER_URL, USER_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { 
  OrganizerResponse, 
  OrganizerRequest, 
  OrganizerDeleteResponse, 
  OrganizerEventsAPIResponse as EventResponse 
} from '../types/Organizer';
import type { ApiResponse } from '../types/ApiResponse';
import type { CreateEventRequest, GetEventResponse } from '../types/Event';
import type { User } from '../types/User'; 
import type { CreateStaffResponse, DeleteStaffResponse } from '../types/Staff';

const organizerService = {

    async getAllOrganizers(): Promise<AxiosResponse<OrganizerResponse[] | ApiResponse<OrganizerResponse[]>>> {
        return await apiUtils.get<OrganizerResponse[] | ApiResponse<OrganizerResponse[]>>(`${ORGANIZER_URL}`);
    },

    async getCurrentOrganizer(): Promise<AxiosResponse<ApiResponse<OrganizerResponse>>> {
        return await apiUtils.get<ApiResponse<OrganizerResponse>>(`${ORGANIZER_URL}me`);
    },

    async getOrganizerById(id: number): Promise<AxiosResponse<ApiResponse<OrganizerResponse>>> {
        return await apiUtils.get<ApiResponse<OrganizerResponse>>(`${ORGANIZER_URL}${id}`);
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
    }): Promise<AxiosResponse<GetEventResponse | ApiResponse<GetEventResponse>>> {
        return await apiUtils.get<GetEventResponse | ApiResponse<GetEventResponse>>(`${EVENT_URL}my-events`, params); 
    },

    async getStaffEvent(params?:{
        page?: number;
        limit?: number;
        search?: string;
        isActive?: boolean;
        campusId?: number;
    }): Promise<AxiosResponse<User[] | ApiResponse<User[]>>> {
        return await apiUtils.get<User[] | ApiResponse<User[]>>(`${USER_URL}staff`, params); 
    },

    async postEvent(data: CreateEventRequest): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
        return await apiUtils.post<ApiResponse<GetEventResponse>>(`${EVENT_URL}`, data);
    },

    async postEventStaff(
    eventId: number, data: {
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