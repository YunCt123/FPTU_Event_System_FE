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
  isActive: boolean;
  roleName: "student" | "admin" | "staff" | "event_organizer";
  campusId: number;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  message: string
}

export interface RegisterRequest {
  userName: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  campusId: number;
  studentCode?: string;     // optional (vì User cho phép null)
  phoneNumber?: string;     // optional
  gender?: boolean;         // optional
  address?: string;         // optional
  avatar?: string; 
}


