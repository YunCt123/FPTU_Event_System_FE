import type { GetEventResponse } from "./Event";

export interface Campus {
  id: number;
  name: string;
  code: string;
  address: string;
} ;

export interface Owner {
  id:number;
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
};

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
};

export interface OrganizerRequest {
    name: string;
    description?: string;
    contactEmail: string;
    logoUrl: string;
    ownerId: number;
    campusId: number;
};

export interface OrganizerDeleteResponse {
    message: string;
};

export interface OrganizerEventsResponse {
  data: GetEventResponse[];
  meta?: meta;
};

export interface meta{
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
