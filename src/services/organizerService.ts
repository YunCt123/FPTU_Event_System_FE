import { apiUtils } from '../api/axios';
import { EVENT_URL, ORGANIZER_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { 
  OrganizerResponse, 
  OrganizerRequest, 
  OrganizerDeleteResponse, 
  OrganizerEventsAPIResponse 
} from '../types/Organizer';
import type { ApiResponse } from '../types/ApiResponse';
import type { CreateStaffResponse } from '../types/Staff';
import type { GetEventResponse, CreateEventRequest } from '../types/Event';

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
    }): Promise<AxiosResponse<ApiResponse<OrganizerEventsAPIResponse>>> {
        return await apiUtils.get<ApiResponse<OrganizerEventsAPIResponse>>(`${EVENT_URL}/my-events`, params);
    },

    async postEventStaff(
        eventId: string,
        data:{
            userId: number;
    }): Promise<AxiosResponse<ApiResponse<CreateStaffResponse>>> {
        return await apiUtils.post<ApiResponse<CreateStaffResponse>>(`${EVENT_URL}${eventId}/staff`, data);
    },

    async postEvent(data: CreateEventRequest): Promise<AxiosResponse<ApiResponse<GetEventResponse>>> {
      console.log('Calling POST /events/');
      console.log('Data:', data);
      
      return await apiUtils.post<ApiResponse<GetEventResponse>>(
        `${EVENT_URL}`, 
        data,
        {
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

};

export default organizerService;