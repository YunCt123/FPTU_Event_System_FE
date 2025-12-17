import { apiUtils } from '../api/axios';
import { AUTH_URL, USER_URL } from '../constants/apiEndPoints';
import type { LoginRequest, LoginResponse, RegisterRequest } from '../types/User';
import type { ApiResponse } from '../types/ApiResponse';
import type { AxiosResponse } from 'axios';
import type { ChangePasswordRequest, UpdateAccountRequest } from '../types/Auth';

/**
 * Auth Service - Xử lý các request liên quan đến authentication
 */
const authService = {
  /**
   * Đăng ký user mới
   * @param data - Thông tin đăng ký
   * @returns Promise với response chứa thông tin user đã đăng ký
   */
  async register(data: RegisterRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
    return await apiUtils.post<ApiResponse<LoginResponse>>(`${AUTH_URL}register`, data);
  },

  /**
   * Đăng nhập với email và password
   * @param data - Email và password
   * @returns Promise với response chứa accessToken, refreshToken và thông tin user
   */
  async login(data: LoginRequest): Promise<AxiosResponse<ApiResponse<LoginResponse>>> {
    return await apiUtils.post<ApiResponse<LoginResponse>>(`${AUTH_URL}login`, data);
  },

  async updateAccount(data: UpdateAccountRequest): Promise<AxiosResponse<ApiResponse<string>>> {
    return await apiUtils.patch<ApiResponse<string>>(`${USER_URL}me`, data);
  },

  async changePassword(data: ChangePasswordRequest): Promise<AxiosResponse<ApiResponse<string>>> {
    return await apiUtils.post<ApiResponse<string>>(`${AUTH_URL}change-password`, data);
  },
};

export default authService;
