// types/time-tracking.d.ts

export enum TimeEntryStatus {
  open = 'open',
  breaktime = 'breaktime',
  finished = 'finished',
}

export interface BreakRead {
  id: number;
  start_time: string; // ISO string
  end_time: string | null; // ISO string or null
}

export interface TimeEntryRead {
  id: number;
  project_id: number;
  user_id: number;
  start_time: string; // ISO string
  end_time: string | null; // ISO string or null
  description: string | null;
  status: TimeEntryStatus;
  breaks: BreakRead[];
}

export interface TimeEntryCreate {
  project_id: number;
  description?: string;
}

export interface ProjectRead {
  id: number;
  name: string;
  description: string;
  owner_id: number;
}

export interface ProjectCreate {
  name: string;
  description: string;
}

export interface EndEntryData {
  id: number;
}

export interface EndBreakData {
  time_entry_id: number;
  break_id: number;
}

