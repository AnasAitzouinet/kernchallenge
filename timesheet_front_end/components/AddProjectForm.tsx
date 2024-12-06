"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { AddNewProjectSchema } from "@/schemas"
import { Textarea } from "./ui/textarea"
import { cn } from "@/lib/utils"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns";
import { Calendar } from "./ui/calendar"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { ProjectCreate } from "@/types/time-tracking"
import { toast } from "sonner"
import { AddNewProject } from "@/server"
import { DatetimePicker } from "./ui/Datetime-picker"

export default function AddProjectForm({ children }: { children: React.ReactNode }) {
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
    const form = useForm<z.infer<typeof AddNewProjectSchema>>({
        resolver: zodResolver(AddNewProjectSchema),
        defaultValues: {
            name: "",
            description: "",
            start_time: new Date(),
            end_time: new Date(),
        },
    })

    const onSubmit = (values: z.infer<typeof AddNewProjectSchema>) => {
        console.log(values)
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a new Project</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 ">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Username</FormLabel>
                                    <FormControl>
                                        <Input placeholder="timesheet app" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Enter project description here..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="start_time"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center">
                                        <CalendarIcon size={16} />
                                        <span className="ml-2">Start Time</span>
                                    </FormLabel>
                                    <DatetimePicker
                                        {...field}
                                        format={[
                                            ["months", "days", "years"],
                                            ["hours", "minutes", "am/pm"],
                                        ]}
                                    />
                                    
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                         <FormField
                            control={form.control}
                            name="end_time"
                            render={({ field }) => (
                                <FormItem className="flex flex-col">
                                    <FormLabel className="flex items-center">
                                        <CalendarIcon size={16} />
                                        <span className="ml-2">End Time</span>
                                    </FormLabel>
                                    <DatetimePicker
                                        {...field}
                                        format={[
                                            ["months", "days", "years"],
                                            ["hours", "minutes", "am/pm"],
                                        ]}
                                    />
                                    <FormDescription>
                                        <span className="text-xs text-muted-foreground">
                                            project will be automatically closed after this time
                                        </span>
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button type="submit">Submit</Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
