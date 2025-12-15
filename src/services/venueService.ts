import { apiUtils } from '../api/axios';
import { VENUE_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { Venue, CreateVenueRequest, UpdateVenueRequest } from '../types/Venue';
import type { ApiResponse } from '../types/ApiResponse';

const venueService = { 
  
  // ✅ SỬA: Cho phép cả array và ApiResponse wrapper
  async getAllVenues(): Promise<AxiosResponse<Venue[] | ApiResponse<Venue[]>>> {
    return await apiUtils.get<Venue[] | ApiResponse<Venue[]>>(`${VENUE_URL}`);
  },

  async getVenuesByCampus(campusId: number): Promise<AxiosResponse<Venue[] | ApiResponse<Venue[]>>> {
    return await apiUtils.get<Venue[] | ApiResponse<Venue[]>>(`${VENUE_URL}?campusId=${campusId}`);
  },

  async getVenueById(id: number): Promise<AxiosResponse<ApiResponse<Venue>>> {
    return await apiUtils.get<ApiResponse<Venue>>(`${VENUE_URL}/${id}`);
  },

  async createVenue(data: CreateVenueRequest): Promise<AxiosResponse<ApiResponse<Venue>>> {
    return await apiUtils.post<ApiResponse<Venue>>(`${VENUE_URL}`, data);
  },

  async updateVenue(id: number, data: UpdateVenueRequest): Promise<AxiosResponse<ApiResponse<Venue>>> {
    return await apiUtils.patch<ApiResponse<Venue>>(`${VENUE_URL}/${id}`, data);
  },

  async deleteVenue(id: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return await apiUtils.delete<ApiResponse<{ message: string }>>(`${VENUE_URL}/${id}`);
  },
};

export default venueService;
