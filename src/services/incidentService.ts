import axios from "../api/axios";
import { INCIDENT_URL } from "../constants/apiEndPoints";

export const incidentService = {
  // Get all incidents (Admin: all incidents, Organizer: only their events' incidents)
  getAllIncidents: async () => {
    const response = await axios.get(INCIDENT_URL);
    return response;
  },

  // Get incidents for a specific event
  getEventIncidents: async (eventId: string) => {
    const response = await axios.get(`${INCIDENT_URL}/event/${eventId}`);
    return response;
  },

  // Get incidents reported by current user (Staff only)
  getMyIncidents: async () => {
    const response = await axios.get(`${INCIDENT_URL}/my`);
    return response;
  },

  // Create a new incident report (Staff only)
  createIncident: async (data: {
    title: string;
    description: string;
    severity: string;
    eventId: string;
    imageUrl?: string;
  }) => {
    const response = await axios.post(INCIDENT_URL, data);
    return response;
  },

  // Update incident status
  updateIncidentStatus: async (id: number, status: string) => {
    const response = await axios.patch(`${INCIDENT_URL}/${id}/status`, { status });
    return response;
  },

  // Update incident details (Admin and Event Organizer owner only)
  updateIncident: async (
    id: number,
    data: {
      title?: string;
      description?: string;
      severity?: string;
      status?: string;
    }
  ) => {
    const response = await axios.patch(`${INCIDENT_URL}/${id}`, data);
    return response;
  },
};
