import { apiUtils } from '../api/axios';
import { CAMPUS_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { Campus, CreateCampusRequest, UpdateCampusRequest } from '../types/Campus';
import type { ApiResponse } from '../types/ApiResponse';

const campusService = {
  async getAllCampuses(): Promise<AxiosResponse<Campus[]>> {
    return await apiUtils.get<Campus[]>(`${CAMPUS_URL}`);
  },

  async getCampusById(id: number): Promise<AxiosResponse<ApiResponse<Campus>>> {
    return await apiUtils.get<ApiResponse<Campus>>(`${CAMPUS_URL}/${id}`);
  },

  async createCampus(data: CreateCampusRequest): Promise<AxiosResponse<Campus>> {
    return await apiUtils.post<Campus>(`${CAMPUS_URL}`, data);
  },

  async updateCampus(id: number, data: UpdateCampusRequest): Promise<Campus> {
    return await apiUtils.patch<Campus>(`${CAMPUS_URL}/${id}`, data);
  },

  async updateCampusStatus(id: number, status: 'Active' | 'Inactive'): Promise<AxiosResponse<ApiResponse<Campus>>> {
    return await apiUtils.patch<ApiResponse<Campus>>(`${CAMPUS_URL}/${id}/status`, { status });
  },

  async getCampusVenues(id: number): Promise<AxiosResponse<ApiResponse<Campus>>> {
    return await apiUtils.get<ApiResponse<Campus>>(`${CAMPUS_URL}/${id}/venues`);
  },
};

export default campusService;