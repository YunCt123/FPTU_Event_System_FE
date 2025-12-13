import { apiUtils } from '../api/axios';
import { VENUE_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { Venue, CreateVenueRequest, UpdateVenueRequest } from '../types/Venue';

const venueService = {
  async getAllVenues(): Promise<AxiosResponse<Venue[]>> {
    return await apiUtils.get<Venue[]>(`${VENUE_URL}`);
  },

  async getVenueById(id: number): Promise<AxiosResponse<Venue>> {
    return await apiUtils.get<Venue>(`${VENUE_URL}/${id}`);
  },

  async createVenue(data: CreateVenueRequest): Promise<AxiosResponse<Venue>> {
    return await apiUtils.post<Venue>(`${VENUE_URL}`, data);
  },

  async updateVenue(id: number, data: UpdateVenueRequest): Promise<AxiosResponse<Venue>> {
    return await apiUtils.patch<Venue>(`${VENUE_URL}/${id}`, data);
  },

  async deleteVenue(id: number): Promise<AxiosResponse<{ message: string }>> {
    return await apiUtils.delete<{ message: string }>(`${VENUE_URL}/${id}`);
  },
};

export default venueService;
