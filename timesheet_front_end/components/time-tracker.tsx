"use client"

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ProjectCreate, ProjectRead, TimeEntryRead, TimeEntryStatus } from '@/types/time-tracking';
import { AddNewProject, GetProjects } from '@/server'; // Update with your actual import paths
import { Play, Pause, Square } from 'lucide-react';
import { TimeEntryProvider, useTimeEntryContext } from '@/components/Providers/TimeEntryContext';

export default function TimeTracker() {
  return (
    <TimeEntryProvider>
      <TimeTrackerContent />
    </TimeEntryProvider>
  );
}

function TimeTrackerContent() {
  const [projects, setProjects] = useState<ProjectRead[]>([]);
  const [loadingProjectAdd, setLoadingProjectAdd] = useState<boolean>(false);
  const [newProject, setNewProject] = useState<ProjectCreate>({
    name: '',
    description: '',
  });

  const {
    activeEntry,
    startEntry,
    endEntry,
    startBreak,
    endBreak,
    duration,
    FinishedEntries
  } = useTimeEntryContext();

  console.log(duration);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await GetProjects();
        if (response.error) {
          toast.error(response.message);
        } else {
          setProjects(response.projects || []); // Ensure projects is always an array
        }
      } catch (err) {
        console.error('Failed to fetch projects.', err);
      }
    };

    fetchProjects();
  }, []);

  const handleAddProject = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newProject.name || !newProject.description) {
      toast.error('Please fill out all fields.');
      return;
    }

    setLoadingProjectAdd(true);
    try {
      const response = await AddNewProject(newProject);
      if (response.error) {
        toast.error(response.message);
      } else {
        setProjects((prev) => [...prev, response.project!]);
        toast.success('Project added successfully!');
        setNewProject({ name: '', description: '' });
      }
    } catch (err) {
      console.error('Failed to add project.', err);
      toast.error('Failed to add project.');
    } finally {
      setLoadingProjectAdd(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header and Add Project Dialog */}
      <Header
        handleAddProject={handleAddProject}
        newProject={newProject}
        setNewProject={setNewProject}
        loadingProjectAdd={loadingProjectAdd}
      />

      {/* Main Content */}
      <main className="container mx-auto p-4">
        <Card className="mb-4">
          <div className="divide-y">
            {projects.map((project) => (
              <div
                key={project.id}
                className="flex items-center justify-between p-4"
              >
                <div>
                  <h3 className="font-medium">{project.name}</h3>
                  <div className="text-sm text-muted-foreground">
                    {project.description}
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {activeEntry && activeEntry.project_id === project.id ? (
                    <ActiveEntryControls
                      activeEntry={activeEntry}
                      duration={duration}
                      endEntry={endEntry}
                      startBreak={startBreak}
                      endBreak={endBreak}
                    />
                  ) : FinishedEntries.some(entry => entry.project_id === project.id) ? (
                    <Button
                      disabled
                      className='bg-green-500'
                    >
                      Finished
                    </Button>
                  ) : (
                    <Button
                      variant="outline"
                      onClick={() => startEntry(project.id)}
                    >
                      <Play size={16} /> Start
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  );
}

// Header Component
interface HeaderProps {
  handleAddProject: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  newProject: ProjectCreate;
  setNewProject: React.Dispatch<React.SetStateAction<ProjectCreate>>;
  loadingProjectAdd: boolean;
}

function Header({
  handleAddProject,
  newProject,
  setNewProject,
  loadingProjectAdd,
}: HeaderProps) {
  return (
    <header className="border-b flex justify-center items-center shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <nav className="flex items-center space-x-4 lg:space-x-6">
          {['Time', 'Projects', 'Team', 'Reports'].map((text) => (
            <Button
              key={text}
              variant="link"
              className={text === 'Time' ? 'text-primary' : 'text-muted-foreground'}
            >
              {text}
            </Button>
          ))}
        </nav>
        <Dialog>
          <DialogTrigger asChild>
            <Button>Add Project</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a new Project</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddProject}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Project Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Time sheet project"
                    value={newProject.name}
                    onChange={(e) =>
                      setNewProject({ ...newProject, name: e.target.value })
                    }
                    disabled={loadingProjectAdd}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter a description"
                    value={newProject.description}
                    onChange={(e) =>
                      setNewProject({ ...newProject, description: e.target.value })
                    }
                    disabled={loadingProjectAdd}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full"
                  disabled={loadingProjectAdd}
                >
                  {loadingProjectAdd ? 'Adding Project...' : 'Add Project'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}

// ActiveEntryControls Component
interface ActiveEntryControlsProps {
  activeEntry: TimeEntryRead;
  duration: string;
  endEntry: () => Promise<void>;
  startBreak: () => Promise<void>;
  endBreak: () => Promise<void>;
}

function ActiveEntryControls({
  activeEntry,
  duration,
  endEntry,
  startBreak,
  endBreak,
}: ActiveEntryControlsProps) {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-16 text-right font-mono">{duration}</div>
      {activeEntry.status === TimeEntryStatus.open && (
        <Button variant="ghost" onClick={startBreak}>
          <Pause size={16} /> Break
        </Button>
      )}
      {activeEntry.status === TimeEntryStatus.breaktime && (
        <Button variant="ghost" onClick={endBreak}>
          <Play size={16} /> Resume
        </Button>
      )}
      <Button variant="ghost" onClick={endEntry}>
        <Square size={16} /> End
      </Button>
    </div>
  );
}
