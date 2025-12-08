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

export interface UpdateStaffRequest {
  role?: StaffRole;
  status?: StaffStatus;
  hasAppAccess?: boolean;
}
