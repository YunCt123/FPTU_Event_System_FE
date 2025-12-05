import { apiUtils } from '../api/axios';
import { ORGANIZER_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { OrganizerResponse, OrganizerRequest, OrganizerDeleteResponse } from '../types/Organizer';
import type { ApiResponse } from '../types/ApiResponse';

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

};

export default organizerService;