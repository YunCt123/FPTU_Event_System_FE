import { apiUtils } from '../api/axios';
import { USER_URL } from '../constants/apiEndPoints';
import type { GetUsersStatusResponse, PatchUserResponse, User } from '../types/User';
import type { ApiResponse } from '../types/ApiResponse';
import type { AxiosResponse } from 'axios';

const userService = {
    async getUsers(params?: {
  page?: number;
  limit?: number;
  roleName?: string;
  search?: string;
  campusId?: number;
  isActive?: boolean;
}): Promise<AxiosResponse<ApiResponse<User[]>>> {
        return await apiUtils.get<ApiResponse<User[]>>(`${USER_URL}`,  params );
    },

    async patchUserDeactivate(id: number): Promise<AxiosResponse<ApiResponse<PatchUserResponse>>> {
        return await apiUtils.patch<ApiResponse<PatchUserResponse>>(`${USER_URL}${id}/deactivate`);
    },

    async patchUserStatus(id: number, data:{status: string}): Promise<AxiosResponse<ApiResponse<GetUsersStatusResponse>>> {
        return await apiUtils.patch<ApiResponse<GetUsersStatusResponse>>(`${USER_URL}${id}/status`, data);
    },

    async getUserById(id: number): Promise<AxiosResponse<ApiResponse<User>>> {
        return await apiUtils.get<ApiResponse<User>>(`${USER_URL}${id}`);
    },

    async getStaffUser(): Promise<AxiosResponse<ApiResponse<User[]>>> {
        return await apiUtils.get<ApiResponse<User[]>>(`${USER_URL}staff`);
    }

      
};

export default userService;