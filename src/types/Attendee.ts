export type CheckInStatus = "CHECKED_IN" | "NOT_CHECKED_IN" | "CANCELLED";

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

export interface AttendanceReponse {
  summary: Sumary;
  data: Data[];
  meta: meta;
}

export interface Sumary {
  totalRegistered: number;
  checkedIn: number;
  notCheckin: number;
  cancelled: number;
  attendanceRate: number;
}

export interface Data {
  ticketId: string;
  qrCode: string;
  status: string;
  bookingDate?: string;
  checkinTime?: string;
  checkoutTime?: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  studentCode?: string;
  seat?: Seat;
}

export interface Seat {
  label: string;
  row: string;
  col: number;
  type: string;
}

export interface meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  currentPage?: number;
  totalItems?: number;
}
