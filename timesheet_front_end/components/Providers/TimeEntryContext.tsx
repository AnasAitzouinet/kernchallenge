"use client"

import React, { createContext, useState, useEffect, useContext } from 'react';
import {
    StartBreak,
    EndBreak,
    GetTimeEntries,
    StartTimeEntry,
    EndTimeEntry,
} from '@/server'; // Update with your actual import paths
import { toast } from 'sonner';
import { TimeEntryRead, TimeEntryStatus } from '@/types/time-tracking';
import { useRouter } from 'next/navigation';


interface TimeEntryContextProps {
    activeEntry: TimeEntryRead | null;
    entries: TimeEntryRead[];
    startEntry: (projectId: number) => Promise<void>;
    endEntry: () => Promise<void>;
    startBreak: () => Promise<void>;
    endBreak: () => Promise<void>;
    calculateDuration: () => string;
    duration: string;
    FinishedEntries: TimeEntryRead[];
}

const TimeEntryContext = createContext<TimeEntryContextProps | undefined>(undefined);

export function TimeEntryProvider({ children }: { children: React.ReactNode }) {
    const [activeEntry, setActiveEntry] = useState<TimeEntryRead | null>(null);
    const [entries, setEntries] = useState<TimeEntryRead[]>([]);
    const [duration, setDuration] = useState<string>('00:00:00');
    const [FinishedEntries, setFinishedEntries] = useState<TimeEntryRead[]>([]);
    const router = useRouter();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                GetTimeEntries().then((response) => {
                    if (response.error) {
                        toast.error(response.message);
                    } else {
                        const allEntries = response.entries || [];
                        setEntries(allEntries);

                        // Find the active entry
                        const active = allEntries.find(
                            (entry: TimeEntryRead) => entry.status !== TimeEntryStatus.finished
                        );
                        setActiveEntry(active || null);

                        // Filter finished entries
                        const finished = allEntries.filter(
                            (entry: TimeEntryRead) => entry.status === TimeEntryStatus.finished
                        );
                        setFinishedEntries(finished);
                    }
                });
            } catch (err) {
                console.error('Failed to fetch time entries.', err);
                toast.error('Failed to fetch time entries.');
            }
        };

        fetchEntries();
    }, []);


    const startEntry = async (projectId: number) => {
        try {
            const response = await StartTimeEntry({ project_id: projectId });
            if (response.error) {
                toast.error(response.message);
            } else {
                if (response.entry) {
                    setActiveEntry(response.entry);
                    setEntries((prev) => [...prev, response.entry!]); // Use non-null assertion to avoid TypeScript error
                    toast.success('Time entry started.');
                } else {
                    toast.error('Failed to start time entry.');
                }
            }
        } catch (err) {
            console.error('Failed to start time entry.', err);
            toast.error('Failed to start time entry.');
        }finally{
            router.refresh();
        }
    };

    const endEntry = async () => {
        if (!activeEntry) return;

        try {
            const response = await EndTimeEntry({ id: activeEntry.id });
            console.log(response);
            if (response.error) {
                toast.error(response.message);
            } else {
                setActiveEntry(null);
                if (response.entry) {
                    setEntries((prev) =>
                        prev.map((entry) => (entry.id === response.entry!.id ? response.entry! : entry))
                    );
                    toast.success('Time entry ended.');
                } else {
                    toast.error('Failed to end time entry.');
                }
            }
        } catch (err) {
            console.error('Failed to end time entry.', err);
            toast.error('Failed to end time entry.');
        }finally{
            router.refresh();
        }
    };

    const startBreak = async () => {
        if (!activeEntry) return;

        try {
            const response = await StartBreak({ time_entry_id: activeEntry.id });
            if (response.error) {
                toast.error(response.message);
            } else {
                if (response.break) {
                    setActiveEntry((prev) => {
                        if (prev) {
                            return {
                                ...prev,
                                status: TimeEntryStatus.breaktime,
                                breaks: [...(prev.breaks || []), response.break!],
                            };
                        }
                        return prev;
                    });
                    toast.success('Break started.');
                } else {
                    toast.error('Failed to start break.');
                }
            }
        } catch (err) {
            console.error('Failed to start break.', err);
            toast.error('Failed to start break.');
        }
    };

    const endBreak = async () => {
        if (!activeEntry) return;

        // Find the latest break that hasn't ended
        const ongoingBreak = activeEntry.breaks
            .slice()
            .reverse()
            .find((brk) => !brk.end_time);

        if (!ongoingBreak) {
            toast.error('No active break to end.');
            return;
        }

        try {
            const response = await EndBreak({
                time_entry_id: activeEntry.id,
                break_id: ongoingBreak.id,
            });

            if (response.error) {
                toast.error(response.message);
            } else {
                if (response.break) {
                    const updatedBreaks = activeEntry.breaks.map((brk) =>
                        brk.id === response.break!.id ? response.break! : brk
                    );
                    setActiveEntry((prev) => {
                        if (prev) {
                            return {
                                ...prev,
                                status: TimeEntryStatus.open,
                                breaks: updatedBreaks,
                            };
                        }
                        return prev;
                    });
                    toast.success('Break ended.');
                } else {
                    toast.error('Failed to end break.');
                }
            }
        } catch (err) {
            console.error('Failed to end break.', err);
            toast.error('Failed to end break.');
        }
    };

    const calculateDuration = (): string => {
        if (!activeEntry) return '00:00:00';

        const startTime = new Date(activeEntry.start_time);
        const now = new Date();

        let totalSeconds = Math.floor((now.getTime() - startTime.getTime()) / 1000);

        // Subtract break durations
        if (activeEntry.breaks && activeEntry.breaks.length > 0) {
            activeEntry.breaks.forEach((brk) => {
                const breakStart = new Date(brk.start_time);
                const breakEnd = brk.end_time ? new Date(brk.end_time) : now;
                const breakSeconds = Math.floor((breakEnd.getTime() - breakStart.getTime()) / 1000);
                totalSeconds -= breakSeconds;
            });
        }

        if (totalSeconds < 0) totalSeconds = 0;

        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        return `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    useEffect(() => {
        // If there's no active entry, reset the duration
        if (!activeEntry) {
            setDuration('00:00:00');
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

        // Clean up the interval on component unmount or when activeEntry changes
        return () => clearInterval(timer);
    }, [activeEntry, calculateDuration]);

    return (
        <TimeEntryContext.Provider
            value={{
                activeEntry,
                entries,
                startEntry,
                endEntry,
                startBreak,
                endBreak,
                calculateDuration,
                duration,
                FinishedEntries,
            }}
        >
            {children}
        </TimeEntryContext.Provider>
    );
}

export function useTimeEntryContext(): TimeEntryContextProps {
    const context = useContext(TimeEntryContext);
    if (context === undefined) {
        throw new Error('useTimeEntryContext must be used within a TimeEntryProvider');
    }
    return context;
}
