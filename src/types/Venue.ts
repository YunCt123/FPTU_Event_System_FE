export type VenueStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export interface Venue {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  status: VenueStatus;
  imageUrl?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  capacity: number;
  status: VenueStatus;
  imageUrl?: string;
}

export interface UpdateVenueRequest extends CreateVenueRequest {
  id: number;
}
