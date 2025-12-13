export interface FeedbackResponse {
  feedbacks: Feedback[];
  statistics: FeedbackStatistics;
}

export interface FeedbackStatistics {
  total: number;           
  averageRating: number;   
}

export interface Feedback {
  id: number;
  rating: number;          
  comment: string;
  createdAt: string;      
  eventId: string;        
  userId: number;
  user: FeedbackUser;
}

export interface FeedbackUser {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

