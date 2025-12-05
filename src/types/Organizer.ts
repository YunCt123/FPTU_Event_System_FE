export interface Campus {
  id: number;
  name: string;
  code: string;
  address: string;
} ;

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
  owner?: any; // Nếu có schema owner thì thay vào đây
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
