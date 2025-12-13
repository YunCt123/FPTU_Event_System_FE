export type EventStatus = 
  | 'PENDING'    // Đang xử lý
  | 'APPROVED'   // Đã duyệt
  | 'CANCELED'   // Bị từ chối
  | 'COMPLETED'; // Hoàn thành

export type EventType = 
'CONFERENCE' 
| 'WORKSHOP' 
| 'SEMINAR' 
| 'COMPETITION' 
| 'CULTURAL' 
| 'SPORTS' 
| 'OTHER';

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

export interface eventSpeaker{
  id: number;
  topic: string;
}

export interface meta{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface speaker{
  id: number;
  name: string;
  bio: string;
  avatar: string;
  type: string;
  company: string;
}

export interface eventSpeaker{
  id: number;
  topic: string;
  speakerId: number;
  speaker: speaker;
}

export interface eventStaff{
  id:number;
  createdAt: string;
  eventId: number;
  userId: number;
  user: User;
}

export interface User{
  id: number;
  userName: string;
  email: string;
  firstName: string; 
  lastName: string;
  avatar?: string;
  roleName: "student" | "admin" | "staff" | "event_organizer";
  isActive: boolean;
  campus: Campus;
}

export interface GetEventResponse {
  id: string;
  title: string;
  description: string;
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
  eventSpeakers: eventSpeaker[];
  eventStaffs: eventStaff[];
  checkinCount: number; 
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

export interface UpdateEventRequest extends CreateEventRequest {
  id: number;
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

export interface EventDeleteResponse {
  id: string;
  message: string;
}
