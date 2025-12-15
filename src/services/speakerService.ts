import { apiUtils } from '../api/axios';
import { SPEAKER_URL } from '../constants/apiEndPoints';
import type { AxiosResponse } from 'axios';
import type { ApiResponse } from '../types/ApiResponse';
import type { GetAllSpeaker, SpeakerAssignResponse, SpeakerRequest, SpeakerResponse } from '../types/Speaker';

const speakerService = {

    async postSpeaker(data: SpeakerRequest): Promise<AxiosResponse<ApiResponse<SpeakerResponse>>> {
        return await apiUtils.post<ApiResponse<SpeakerResponse>>(`${SPEAKER_URL}`, data);
    },

    async assignSpeaker(eventId: string,
        data:{
            speakerId: number;
            topic: string;
        }
    ): Promise<AxiosResponse<ApiResponse<SpeakerAssignResponse>>> {
        return await apiUtils.post<ApiResponse<SpeakerAssignResponse>>(`${SPEAKER_URL}events/${eventId}/assign`, data);
    },

    async getAllSpeaker(param?:{
        page?: number;
        limit?: number;
        search?: string;
        type?: "internal" | "external";
    }
    ): Promise<AxiosResponse<ApiResponse<GetAllSpeaker>>> {
        return await apiUtils.get<ApiResponse<GetAllSpeaker>>(`${SPEAKER_URL}`, param);
    },

    async getSpeakerById(id: number): Promise<AxiosResponse<ApiResponse<SpeakerResponse>>> {
        return await apiUtils.get<ApiResponse<SpeakerResponse>>(`${SPEAKER_URL}${id}`);
    },

    async deleteSpeaker(eventId: string, speakerId: number): Promise<AxiosResponse<ApiResponse<{ message: string }>>> {
        return await apiUtils.delete<ApiResponse<{ message: string }>>(`${SPEAKER_URL}events/${eventId}/speakers/${speakerId}/`);
    },
};

export default speakerService;