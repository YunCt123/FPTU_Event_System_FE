import { apiUtils } from '../api/axios';
import { USER_URL } from '../constants/apiEndPoints';
import type { User } from '../types/User';
import type { ApiResponse } from '../types/ApiResponse';
import type { AxiosResponse } from 'axios';

const userService = {
    async getUsers(params: {
  page?: number;
  limit?: number;
  roleName?: string;
  search?: string;
  campusId?: number;
  isActive?: boolean;
}): Promise<AxiosResponse<ApiResponse<User[]>>> {
        return await apiUtils.get<ApiResponse<User[]>>(`${USER_URL}`,  params );
    },
    
};

export default userService;