import type { Venue } from "./Venue";

export type Status = 'Active' | 'Inactive';

export interface Campus {
  id: number;
  name: string;
  code: string;
  capacity?: number | null;
  address: string;
  image?: string | null;
  status: Status; 
  venues?: Venue[];
}

export interface CreateCampusRequest {
  code: string;
  name: string;
  capacity?: number | null;
  address: string;
  image?: string;
}

export interface UpdateCampusRequest{
  code?: string;
  name?: string;
  capacity?: number | null;
  address?: string;
  image?: string;
  status?: Status;
}

export interface CreateCampusResponse{
  message: string;  
  campus: Campus;
}

export interface UpdateCampusResponse{
  message: string;  
  campus: Campus;
}