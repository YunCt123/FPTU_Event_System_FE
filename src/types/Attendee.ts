export type CheckInStatus = 'CHECKED_IN' | 'NOT_CHECKED_IN' | 'CANCELLED';

export interface Attendee {
  id: number;
  studentId: string;
  fullName: string;
  email: string;
  phone: string;
  registeredAt: string;
  checkInStatus: CheckInStatus;
  checkInTime?: string;
  seat?: string;
  notes?: string;
  eventId: number;
}

export interface CreateAttendeeRequest {
  studentId: string;
  eventId: number;
  seat?: string;
  notes?: string;
}

export interface UpdateAttendeeRequest {
  checkInStatus?: CheckInStatus;
  seat?: string;
  notes?: string;
}
