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
