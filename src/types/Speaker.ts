export interface SpeakerRequest {
  name: string;
  bio: string;
  avatar: string;
  type: "internal" | "external";
  company: string;
}

export interface SpeakerResponse {
    id: number;
    name: string;
    bio: string;
    avatar: string;
    type: "internal" | "external";
    company: string;
    createdAt: string;
    eventSpeakers?:eventSpeaker[]
}

export interface eventSpeaker{
    id: number;
    topic: string;
    speakerId: number;
    eventId: string;
    event: {
        id: string;
        title: string;
        startTime: string;
        endTime: string;
    }
}

export interface SpeakerAssignRequest{
  speakerId: number;
  topic: string;
} 

export interface Event {
  id: string;
  title: string;
  startTime: string; 
  endTime: string;   
}

export interface SpeakerAssignResponse{
  id: number;
  topic: string;
  speakerId: number;
  eventId: string;
  speaker: SpeakerResponse;
  event: Event;
}

export interface GetAllSpeaker{
    data: SpeakerResponse[];
    meta: Meta;
}

export interface Meta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}
