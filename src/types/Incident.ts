export type IssueSeverity = 'LOW' | 'MEDIUM' | 'HIGH' ;


export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';


export interface IssueResponse {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  severity: IssueSeverity;
  status: IssueStatus;
  createdAt: string;
  updatedAt: string;
  eventId: string;
  reporterId: number;
  reporter: Reporter;
  event: Event;
}

export interface Reporter {
  id: number;
  userName: string;
  firstName: string;
  lastName: string;
  avatar: string;
}

export interface Organizer {
  ownerId: number;
}

export interface Event {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  organizer: Organizer;
}

export type IssuesResponse = IssueResponse[];