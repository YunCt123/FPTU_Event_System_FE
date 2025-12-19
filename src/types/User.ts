export interface Campus {
  id: number;
  name: string;
  code: string;
  address: string;
}

export interface Meta{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface User {
  id: number;
  userName: string;
  passwordHash: string;
  avatar?: string;
  phoneNumber?: string;
  gender?: boolean;
  address?: string;
  firstName: string;
  lastName: string;
  studentCode?: string;
  email: string;
  createdAt: string;
  status: "APPROVED" | "PENDING" | "REJECTED";
  isActive: boolean;
  roleName: "student" | "admin" | "staff" | "event_organizer";
  campusId: number;
  campus: Campus;
  studentCardImage?: string;
}

export interface UserResponse {
  data: User[];
  meta: Meta;
}

export interface GetPendingUsersResponse {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  phoneNumber: string;
  gender: boolean;
  address: string;
  studentCode: string;
  studentCardImage?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  roleName: "staff" | "student" | "admin";
  isActive: boolean;
  createdAt: string; 
  campus: Campus;
}

export interface StatusUserResponse {
  message: string;
  user: GetUsersStatusResponse;
}

export interface GetUsersStatusResponse {
  id: number;
  userName: string;
  googleId?: string;
  avatar?: string;
  phoneNumber: string;
  gender: boolean;
  address: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  email: string;
  studentCardImage?: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  refreshTokenHash?: string;
  createdAt: string;
  isActive: boolean;
  roleName: "staff" | "student" | "admin";
  campusId: number;
}

export interface PatchUserResponse {
  id: number;
  userName: string;
  googleId: string | null;
  avatar: string;
  phoneNumber: string;
  gender: boolean; 
  address: string;
  firstName: string;
  lastName: string;
  studentCode: string | null;
  email: string;
  studentCardImage: string | null;
  status: "APPROVED" | "PENDING" | "REJECTED"; 
  refreshTokenHash: string | null;
  createdAt: string; 
  isActive: boolean;
  roleName: "student" | "admin" | "event_organizer"; 
  campusId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  message: string;
}

export interface UserParams {
  page?: number;
  limit?: number;
  roleName?: string;
  search?: string;
  campusId?: number;
  isActive?: boolean;
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  campusId: number;
  studentCode?: string; // optional (vì User cho phép null)
  phoneNumber?: string; // optional
  gender?: boolean; // optional
  address?: string; // optional
  avatar?: string;
  studentCardImage?: string; // optional
}

export interface CreateStaffRequest {
  userName: string;
  email: string;
  password: string;
  campusId: number;
  roleName: string;
  firstName: string;
  lastName: string;
  studentCode?: string;
  phoneNumber?: string;
  gender?: boolean;
  address?: string;
  avatar?: string;
}
