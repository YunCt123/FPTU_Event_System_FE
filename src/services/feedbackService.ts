import { apiUtils } from "../api/axios";
// import { FEEDBACK_URL } from "../constants/apiEndPoints";
import type { AxiosResponse } from "axios";
import type { ApiResponse } from "../types/ApiResponse";
import type { FeedbackResponse } from "../types/Feedback";

const feedbackService = {
    
    // async getFeedbacksByEventId(eventId: string): Promise<AxiosResponse<ApiResponse<FeedbackResponse>>> {
    //     // return await apiUtils.get<ApiResponse<FeedbackResponse>>(`${FEEDBACK_URL}event/${eventId}`);
    // },
};

export default feedbackService;