"use client";

import React, { createContext, useState, useEffect, useContext } from "react";
import {
  StartBreak,
  EndBreak,
  GetProjects,
  AddNewProject,
  RemoveProject,
} from "@/server"; // Update with your actual import paths
import { toast } from "sonner";
import { ProjectRead, ProjectStatus } from "@/types/time-tracking";
import { useRouter } from "next/navigation";

interface ProjectContextProps {
  activeProject: ProjectRead | null;
  projects: ProjectRead[];
  addProject: (data: { name: string; description: string }) => Promise<void>;
  removeProject: (projectId: number) => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
  calculateDuration: () => string;
  duration: string;
  finishedProjects: ProjectRead[];
}

const ProjectContext = createContext<ProjectContextProps | undefined>(
  undefined
);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const [activeProject, setActiveProject] = useState<ProjectRead | null>(null);
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [duration, setDuration] = useState<string>("00:00:00");
  const [finishedProjects, setFinishedProjects] = useState<ProjectRead[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await GetProjects();
        if (response.error) {
          toast.error(response.message);
        } else {
          const allProjects = response.projects || [];
          setProjects(allProjects);

          // Find the active project (status is not 'finished')
          const active = allProjects.find(
            (project: ProjectRead) =>
              project.status !== ProjectStatus.finished
          );
          setActiveProject(active || null);

          // Filter finished projects
          const finished = allProjects.filter(
            (project: ProjectRead) =>
              project.status === ProjectStatus.finished
          );
          setFinishedProjects(finished);
        }
      } catch (err) {
        console.error("Failed to fetch projects.", err);
        toast.error("Failed to fetch projects.");
      }
    };

    fetchProjects();
  }, []);

  const addProject = async (data: { name: string; description: string }) => {
    try {
      const response = await AddNewProject(data);
      if (response.error) {
        toast.error(response.message);
      } else {
        if (response.project) {
          setProjects((prev) => [...prev, response.project as ProjectRead]);
          toast.success("Project added.");
        } else {
          toast.error("Failed to add project.");
        }
      }
    } catch (err) {
      console.error("Failed to add project.", err);
      toast.error("Failed to add project.");
    } finally {
      router.refresh();
    }
  };

  const removeProject = async (projectId: number) => {
    try {
      const response = await RemoveProject(projectId);
      if (response.error) {
        toast.error(response.message);
      } else {
        setProjects((prev) =>
          prev.filter((project) => project.id !== projectId)
        );
        toast.success("Project removed.");
      }
    } catch (err) {
      console.error("Failed to remove project.", err);
      toast.error("Failed to remove project.");
    } finally {
      router.refresh();
    }
  };

  const startBreak = async () => {
    if (!activeProject) return;

    try {
      const response = await StartBreak(activeProject.id);
      if (response.error) {
        toast.error(response.message);
      } else {
        if (response.break) {
          setActiveProject((prev) => {
            if (prev) {
              return {
                ...prev,
                status: ProjectStatus.breaktime,
                breaks: [...(prev.breaks || []), response.break!],
              };
            }
            return prev;
          });
          toast.success("Break started.");
        } else {
          toast.error("Failed to start break.");
        }
      }
    } catch (err) {
      console.error("Failed to start break.", err);
      toast.error("Failed to start break.");
    }
  };

  const endBreak = async () => {
    if (!activeProject) return;

    // Find the latest break that hasn't ended
    const ongoingBreak = activeProject.breaks
      .slice()
      .reverse()
      .find((brk) => !brk.end_time);

    if (!ongoingBreak) {
      toast.error("No active break to end.");
      return;
    }

    try {
      const response = await EndBreak(activeProject.id);
      if (response.error) {
        toast.error(response.message);
      } else {
        if (response.break) {
          const updatedBreaks = activeProject.breaks.map((brk) =>
            brk.id === response.break!.id ? response.break! : brk
          );
          setActiveProject((prev) => {
            if (prev) {
              return {
                ...prev,
                status: ProjectStatus.open,
                breaks: updatedBreaks,
              };
            }
            return prev;
          });
          toast.success("Break ended.");
        } else {
          toast.error("Failed to end break.");
        }
      }
    } catch (err) {
      console.error("Failed to end break.", err);
      toast.error("Failed to end break.");
    }
  };

  const calculateDuration = (): string => {
    if (!activeProject) return "00:00:00";

    const startTime = new Date(activeProject.start_time);
    const now = new Date();

    let totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

    // Subtract break durations
    if (activeProject.breaks && activeProject.breaks.length > 0) {
      activeProject.breaks.forEach((brk) => {
        const breakStart = new Date(brk.start_time);
        const breakEnd = brk.end_time ? new Date(brk.end_time) : now;
        const breakSeconds = Math.floor(
          (breakEnd.getTime() - breakStart.getTime()) / 1000
        );
        totalSeconds -= breakSeconds;
      });
    }

    if (totalSeconds < 0) totalSeconds = 0;

    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    // If there's no active project, reset the duration
    if (!activeProject) {
      setDuration("00:00:00");
      return;
    }

    // Function to update the duration
    const updateDuration = () => {
      setDuration(calculateDuration());
    };

    // Initial call to set the duration immediately
    updateDuration();

    // Set up the interval to update every second
    const timer = setInterval(updateDuration, 1000);

    // Clean up the interval on component unmount or when activeProject changes
    return () => clearInterval(timer);
  }, [activeProject]);

  return (
    <ProjectContext.Provider
      value={{
        activeProject,
        projects,
        addProject,
        removeProject,
        startBreak,
        endBreak,
        calculateDuration,
        duration,
        finishedProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext(): ProjectContextProps {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error(
      "useProjectContext must be used within a ProjectProvider"
    );
  }
  return context;
}
