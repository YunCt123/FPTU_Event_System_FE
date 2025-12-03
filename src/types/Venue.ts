export type VenueStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

export type SeatType = 'empty' | 'regular' | 'vip';

export interface Seat {
  row: number;
  col: number;
  type: SeatType;
  label?: string;
}

export interface SeatMapData {
  rows: number;
  cols: number;
  seats: Seat[][];
  rowLabels: string[];
}

export interface Venue {
  id: number;
  name: string;
  description?: string;
  capacity: number;
  status: VenueStatus;
  imageUrl?: string;
  isActive: boolean;
  seatMap?: SeatMapData;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVenueRequest {
  name: string;
  description?: string;
  capacity: number;
  status: VenueStatus;
  imageUrl?: string;
  seatMap?: SeatMapData;
}

export interface UpdateVenueRequest extends CreateVenueRequest {
  id: number;
}
