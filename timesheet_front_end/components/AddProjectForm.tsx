"use client"

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ProjectCreate } from '@/types/time-tracking'; // Ensure to import the correct type
import { toast } from 'sonner'; // Import toast for notifications
import { AddNewProject } from '@/server';


export default function AddProjectForm({children}: {children: React.ReactNode}) {
    const [newProject, setNewProject] = useState<ProjectCreate>({ name: '', description: '' });
    const [loadingProjectAdd, setLoadingProjectAdd] = useState<boolean>(false);

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
        <Dialog>
            <DialogTrigger>
                {children}
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
    )
}
