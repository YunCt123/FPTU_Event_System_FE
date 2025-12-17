import type { Campus } from "./Campus";

export type VenueStatus = "ACTIVE" | "MAINTENANCE" | "INACTIVE";

export type SeatType = "empty" | "regular" | "vip";

export interface Seat {
  id: number;
  rowLabel: number;
  colLabel: number;
  seatType: SeatType;
  label?: string;
  isActive?: boolean;
}

export interface Venue {
  id: number;
  name: string;
  location: string;
  row: number;
  column: number;
  hasSeats: boolean;
  mapImageUrl: string | null;
  status: VenueStatus;
  campusId: Campus["id"];
  capacity?: number;
}

export interface CreateVenueRequest {
  name: string;
  location: string;
  row: number;
  column: number;
  hasSeats: boolean;
  mapImageUrl?: string;
  campusId: number;
  capacity: number;
}

export interface CreateVenueResponse {
  message: string;
  venue: Venue;
}

export interface UpdateVenueRequest {
  name: string;
  location: string;
  mapImageUrl?: string;
  capacity?: number;
}

export interface UpdateVenueResponse {
  message: string;
  venue: Venue;
}
