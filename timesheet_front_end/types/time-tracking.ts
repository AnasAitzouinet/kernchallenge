// types/time-tracking.d.ts

export enum ProjectStatus {
  open = "open",
  breaktime = "breaktime",
  finished = "finished",
}

export interface BreakRead {
  id: number;
  project_id: number;
  start_time: string; // ISO string
  end_time: string | null; // ISO string or null
}

export interface ProjectRead {
  id: number;
  name: string;
  description: string;
  owner_id: number;
  start_time: string; // ISO string
  end_time: string | null; // ISO string or null
  status: ProjectStatus;
  redo: boolean;
  breaks: BreakRead[];
}

export interface ProjectCreate {
  name: string;
  description: string;
  start_time?: Date;
  end_time?: Date;
}

export interface EndBreakData {
  project_id: number;
}
