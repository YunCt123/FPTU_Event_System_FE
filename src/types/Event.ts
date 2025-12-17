import type { User } from './User';
export type EventStatus = 
  | 'PENDING'    // Đang xử lý
  | 'APPROVED'   // Đã duyệt
  | 'CANCELED'   // Bị từ chối
  | 'COMPLETED'  // Hoàn thành
  | 'PENDING_DELETE'; // TRẠNG THÁI CHỜ XÓA

export type EventType = 
'CONFERENCE' 
| 'WORKSHOP' 
| 'SEMINAR' 
| 'COMPETITION' 
| 'CULTURAL' 
| 'SPORTS' 
| 'OTHER';

export interface Event {
  id: string; 
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

export interface organizer{
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logoUrl?: string;
}

export interface campus{
  id: number;
  name: string;
  code: string;
  addres: string;
}

export interface venue{
  id: number;
  name: string;
  location: string;
  hasSeats: boolean;
  campusId?: number;
  campus: campus;
}

export interface host{
  id: number;
  name: string;
  email: string;
  firtName: string;
  lastName: string;
} 

// export interface eventSpeaker{
//   id: number;
//   topic: string;
// }

export interface meta{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface eventSpeaker{
  id: number;
  topic: string;
  speaker: speaker;
}

export interface speaker{
  id: number;
  name: string;
  bio: string;
  avatar: string;
  type: string;
  company: string;
}



export interface eventStaff{
  id:number;
  createdAt: string;
  eventId: number;
  userId: number;
  user: User;
}

export interface GetEventResponse {
  id: string;
  title: string;
  description: string;
  category?: string;
  bannerUrl?: string;
  imageUrl?: string; 
  startTimeRegistration: string;
  endTimeRegistration: string;
  startTime: string;
  endTime: string;
  status: string;
  maxCapacity: number;
  registeredCount: number;
  isGlobal: boolean;
  createdAt: string;
  hostId: number;
  organizerId: number;
  venueId?: number;
  organizer: organizer;
  venue?: venue;
  host: host;
  eventSpeakers?: eventSpeaker[];
  eventStaffs?: eventStaff[];
  checkinCount: number; 
  endTimeRegister?: string;
  startTimeRegister?: string;
}

export interface GetTotalEventsResponse {
  data: GetEventResponse
  meta?: meta;
}

export interface GetTotalEventsByMothResponse {
  month: string;
  totalEvents: number;
}

export interface GetTotalRegisteredEventsResponse {
  date: string;
  totalRegistrations: number;
}
export interface CreateEventRequest {
  title: string;
  description: string;
  category: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  startTimeRegister: string;
  endTimeRegister: string;
  maxCapacity: number;
  isGlobal: boolean;
  organizerId: number;
  venueId?: number;
  hostId: number;
  staffIds?: number[];
  speakers?: {
    speakerId: number;
    topic: string;
  }[];
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: string;
  bannerUrl?: string;
  startTime?: string;
  endTime?: string;
  startTimeRegister?: string;
  endTimeRegister?: string;
  maxCapacity?: number;
  isGlobal?: boolean;
  organizerId?: number;
  venueId?: number;
  hostId?: number;
  staffIds?: number[];
  speakers?: {
    speakerId: number;
    topic: string;
  }[];
}

export interface EventModalProps {
  title: string;
  isOpen: boolean;
  initialData: EventFormData;
  onClose: () => void;
  onSubmit: (data: EventFormData) => void;
}

export interface EventFormData {
  name: string;
  description: string;
  location: string;
  date: string;
}

export interface UpdateEventResponse {
  id: string;
  title: string;
  description: string;
  category?: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  status: string;
  maxCapacity: number;
  registeredCount: number;
  isGlobal: boolean;
  createdAt: string;
  organizerId: number;
  venueId?: number;
  organizer: organizer;
  venue?: {
    id: number;
    name: string;
    location: string;
    hasSeats: boolean;
  }
  host: host;  
}

export interface EventDeleteResponse {
  id: string;
  message: string;
}

export interface DeleteRequest {
  id: string;
  eventId: string;
  eventTitle: string;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedBy: {
    id: number;
    name: string;
    email: string;
  };
  reviewedBy?: {
    id: number;
    name: string;
    email: string;
  };
  reviewNote?: string;
  createdAt: string;
  reviewedAt?: string;
}

export interface CancellationReason {
  id: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  eventId: string;
  requestedBy: number;
  event?: {
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
  };
  requester?: {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  reviewer?: {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface DeleteEventByOrganizersRequest {
  reason: string;
}

export interface DeleteEventByOrganizersResponse {
  message: string;
  cancellationReason: CancellationReason;
}

export interface GetDeleteRequestsResponse {
  data: DeleteRequestItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface DeleteRequestItem {
  id: number;
  reason: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  eventId: string;
  requestedBy: number;
  event: {
    id: string;
    title: string;
    status: string;
    startTime: string;
    endTime: string;
    organizer: {
      id: number;
      name: string;
    };
  };
  requester: {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  reviewer: {
    id: number;
    userName: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface BookingOnlineRequest {
  title: string;
  description: string;
  category?: string;
  bannerUrl?: string;
  startTime: string;
  endTime: string;
  organizerId: number;
  hostId: number;
  staffIds?: number[];
  speakers?: {
    speakerId: number;
    topic: string;
  }[];
  isOnline: boolean;
  onlineMeetingUrl?: string;
}

export interface BookingOnlineResponse {
  event:{
    id: string;
    title: string;
    description: string;
    category?: string;
    bannerUrl?: string;
    startTimeRegistration: string;
    endTimeRegistration: string;
    startTime: string;
    endTime: string;
    status: string;
    maxCapacity: number;
    registeredCount: number;
    isOnline: boolean;
    onlineMeetingUrl?: string;
    recurrenceType?: string;
    recurrenceInterval?: number;
    recurrenceEndDate?: string;
    recurrenceCount?: number;
    isGlobal: boolean;
    createdAt: string;
    hostId: number;
    organizerId: number;
    venueId?: number;
    organizer: organizer;
    venue?: venue;
    host: host;
    eventSpeakers?: eventSpeaker[];
    eventStaffs?: eventStaff[];
    checkinCount: number;
  }
  totalOccurrences: number;
}





