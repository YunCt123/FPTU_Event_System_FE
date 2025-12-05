export type CampusStatus = 'ACTIVE' | 'INACTIVE';

export interface Campus {
  id: number;
  code: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  imageUrl?: string;
  status: CampusStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateCampusRequest {
  code: string;
  name: string;
  address: string;
  city: string;
  description?: string;
  imageUrl?: string;
  status: CampusStatus;
}

export interface UpdateCampusRequest extends CreateCampusRequest {
  id: number;
}
