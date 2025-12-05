export type EventStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
export type EventType = 'CONFERENCE' | 'WORKSHOP' | 'SEMINAR' | 'COMPETITION' | 'CULTURAL' | 'SPORTS' | 'OTHER';

export interface Event {
  id: number;
  title: string;
  description: string;
  eventType: EventType;
  status: EventStatus;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  currentParticipants: number;
  venueId?: number;
  venueName?: string;
  campusId?: number;
  campusName?: string;
  organizerId: number;
  organizerName?: string;
  imageUrl?: string;
  requiresApproval: boolean;
  isPublished: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  eventType: EventType;
  startDate: string;
  endDate: string;
  registrationDeadline: string;
  maxParticipants: number;
  venueId?: number;
  campusId?: number;
  imageUrl?: string;
  requiresApproval: boolean;
}

export interface UpdateEventRequest extends CreateEventRequest {
  id: number;
}
