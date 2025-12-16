import { apiUtils } from "../api/axios";
import { ORGANIZER_REQUEST_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/ApiResponse";
import type {
  OrganizerRequestItem,
  OrganizerRequestListResponse,
  OrganizerRequestParams,
  OrganizerRequestReviewPayload,
} from "../types/Organizer";

const organizerRequestService = {
  /**
   * Get all organizer requests (Admin)
   */
  async getAllOrganizerRequests(
    params?: OrganizerRequestParams
  ): Promise<AxiosResponse<OrganizerRequestListResponse>> {
    return await apiUtils.get<OrganizerRequestListResponse>(
      ORGANIZER_REQUEST_URL,
      params
    );
  },

  /**
   * Get organizer request by ID
   */
  async getOrganizerRequestById(
    id: number
  ): Promise<AxiosResponse<ApiResponse<OrganizerRequestItem>>> {
    return await apiUtils.get<ApiResponse<OrganizerRequestItem>>(
      `${ORGANIZER_REQUEST_URL}/${id}`
    );
  },

  /**
   * Review organizer request (Approve/Reject)
   */
  async reviewOrganizerRequest(
    id: number,
    data: OrganizerRequestReviewPayload
  ): Promise<AxiosResponse<ApiResponse<OrganizerRequestItem>>> {
    return await apiUtils.patch<ApiResponse<OrganizerRequestItem>>(
      `${ORGANIZER_REQUEST_URL}/${id}/review`,
      data
    );
  },

  /**
   * Create a new organizer request (User)
   */
  async createOrganizerRequest(data: {
    name: string;
    description: string;
    contactEmail: string;
    logoUrl: string;
    proofImageUrl: string;
    campusId: number;
  }): Promise<AxiosResponse<ApiResponse<OrganizerRequestItem>>> {
    return await apiUtils.post<ApiResponse<OrganizerRequestItem>>(
      ORGANIZER_REQUEST_URL,
      data
    );
  },

  /**
   * Get current user's organizer requests
   */
  async getMyOrganizerRequests(
    params?: OrganizerRequestParams
  ): Promise<AxiosResponse<OrganizerRequestListResponse>> {
    return await apiUtils.get<OrganizerRequestListResponse>(
      `${ORGANIZER_REQUEST_URL}/my-requests`,
      params
    );
  },

  /**
   * Delete organizer request
   */
  async deleteOrganizerRequest(
    id: number
  ): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
    return await apiUtils.delete<ApiResponse<{ message: string }>>(
      `${ORGANIZER_REQUEST_URL}/${id}`
    );
  },
};

export default organizerRequestService;
