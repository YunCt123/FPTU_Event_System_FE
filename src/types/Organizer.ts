export interface Organizer {
  id: number;
  name: string;
  description: string;
  contactEmail: string;
  logo_url: string;
  campus: string;
}

export interface CreateOrganizerRequest {
  name: string;
  description: string;
  contactEmail: string;
  logo_url: string;
  campus: string;
}

export interface UpdateOrganizerRequest extends CreateOrganizerRequest {
  id: number;
}
