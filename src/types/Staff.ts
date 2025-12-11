export type StaffRole = 'CHECK_IN' | 'SUPPORT' | 'COORDINATOR';
export type StaffStatus = 'ACTIVE' | 'INACTIVE';

export interface Staff {
  id: number;
  accountId: number;
  fullName: string;
  email: string;
  phone: string;
  role: StaffRole;
  status: StaffStatus;
  assignedAt: string;
  hasAppAccess: boolean;
  eventId: number;
}

export interface CreateStaffRequest {
  accountId: number;
  eventId: number;
  role: StaffRole;
  hasAppAccess?: boolean;
}

export interface CreateStaffResponse {
  id: number;
  createdAt: string;
  eventId: string;
  userId: number;
  user: User;
  event: Event;
}

export interface User {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  roleName: string;
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
}

export interface UpdateStaffRequest {
  role?: StaffRole;
  status?: StaffStatus;
  hasAppAccess?: boolean;
}
