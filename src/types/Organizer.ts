export interface Campus {
  id: number;
  name: string;
  code: string;
  address: string;
}

export interface Owner {
  id: number;
  userName: string;
  email: string;
  firstName: string;
  lastName: string;
}

export interface Organizer {
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logoUrl?: string;
  campusId: number;
  ownerId?: number;
}

export interface OrganizerResponse {
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logoUrl?: string;
  createdAt: string;
  updatedAt: string;
  campusId: number;
  ownerId?: number;
  owner?: Owner;
  campus?: Campus;
}

export interface OrganizerRequest {
  name: string;
  description?: string;
  contactEmail: string;
  logoUrl: string;
  ownerId: number;
  campusId: number;
}

export interface OrganizerDeleteResponse {
  message: string;
}

export interface OrganizerEventsResponse {
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
  checkinCount: number;
  isGlobal: boolean;
  createdAt: string;
  hostId: number;
  organizerId: number;
  venueId?: number;
  organizer?: {
    id: number;
    name: string;
    description: string;
    contactEmail: string;
    logoUrl?: string;
  };
  venue?: {
    id: number;
    name: string;
    location: string;
    hasSeats: boolean;
    campusId?: number;
    campus?: {
      id: number;
      name: string;
      code: string;
      address: string;
    };
  };
  host?: {
    id: number;
    name: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  eventSpeakers?: any[];
  eventStaffs?: any[];
}

export interface OrganizerEventsAPIResponse {
  data: OrganizerEventsResponse[];
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Organizer Request Types
export type OrganizerRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface OrganizerRequestUser {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
  roleName: string;
  campus: {
    id: number;
    name: string;
    code: string;
  };
}

export interface OrganizerRequestCampus {
  id: number;
  name: string;
  code: string;
}

export interface OrganizerRequestAdminReviewer {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  userName: string;
}

export interface OrganizerRequestItem {
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logoUrl: string;
  proofImageUrl: string;
  status: OrganizerRequestStatus;
  reason: string | null;
  createdAt: string;
  reviewedAt: string | null;
  userId: number;
  adminReviewerId: number | null;
  campusId: number;
  user: OrganizerRequestUser;
  campus: OrganizerRequestCampus;
  adminReviewer: OrganizerRequestAdminReviewer | null;
}

export interface OrganizerRequestMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrganizerRequestListResponse {
  data: OrganizerRequestItem[];
  meta: OrganizerRequestMeta;
}

export interface OrganizerRequestParams {
  page?: number;
  limit?: number;
  status?: OrganizerRequestStatus;
}

export interface OrganizerRequestReviewPayload {
  status: "APPROVED" | "REJECTED";
  reason?: string;
}
