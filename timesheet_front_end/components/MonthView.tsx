"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ProjectRead } from "@/types/time-tracking";
import {
    FloatingPanelCloseButton,
    FloatingPanelContent,
    FloatingPanelForm,
    FloatingPanelLabel,
    FloatingPanelRoot,
    FloatingPanelTrigger,
} from "@/components/ui/FloatingPanel";
import { ScrollArea } from "./ui/scroll-area";

interface MonthViewProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    getDaysInMonth: (month: number, year: number) => { day: number }[];
    projects: ProjectRead[];
}

const MonthView: React.FC<MonthViewProps> = ({
    currentDate,
    setCurrentDate,
    getDaysInMonth,
    projects,
}) => {
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const offset = firstDayOfMonth;

    const projectsByDate: { [key: number]: ProjectRead[] } = {};
    daysInMonth.forEach(({ day }) => {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        projectsByDate[day] = projects.filter(project => new Date(project.start_time).toDateString() === date.toDateString());
    });

    return (
        <motion.div
            key="month"
            initial={{ opacity: 0, height: "100%" }}
            animate={{ opacity: 1, height: "100%" }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="py-5 px-5 space-y-2 h-full min-h-screen"
            style={{ width: '100%', height: '600px' }}
        >
            <h1 className="text-4xl font-bold">
                {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h1>
            <div className="flex justify-between items-center">
                <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))}>
                    Prev Month
                </Button>
                <Button variant="secondary" onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))}>
                    Next Month
                </Button>
            </div>
            <div className="grid grid-cols-7 gap-2 text-white">
                {dayNames.map(dayName => (
                    <div key={dayName} className="p-2 text-center text-xl font-bold bg-neutral-900/40 rounded-md">
                        {dayName}
                    </div>
                ))}
                {Array.from({ length: offset }).map((_, index) => {
                    const dayNumber = new Date(currentDate.getFullYear(), currentDate.getMonth(), -(offset - index)).getDate();
                    return (
                        <div key={`empty-${index}`} className="p-2 border border-gray-300/10 bg-neutral-800/50 rounded-md">
                            <div className="text-lg font-bold">{dayNumber}</div>
                        </div>
                    );
                })}
                {daysInMonth.map(({ day }) => (
                    <div key={day} className="p-2 border border-gray-300/10 h-44 bg-neutral-700/50 rounded-md ">
                        <div className="text-lg font-bold">{day}</div>

                        <div className="flex flex-col space-y-2">
                            {projectsByDate[day].slice(0,4).map(project => (
                                <div key={project.id} className="bg-sky-900 rounded-lg px-2">
                                    <p className="text-sm font-medium">{project.name}</p>
                                </div>
                            ))}
                             {
                                projectsByDate[day].length > 4 && (
                                    <FloatingPanelRoot>
                                        <FloatingPanelTrigger title="Projects"  className="bg-transparent text-center flex items-center justify-center rounded-lg px-2 h-5 w-full">
                                                <p className="text-sm font-medium text-white">+{projectsByDate[day].length - 4} more</p>
                                        </FloatingPanelTrigger>
                                        <FloatingPanelContent className="fixed w-[250px] rounded-md px-5 bg-sky-200/90 overflow-auto">
                                            
                                            <div className="flex flex-col space-y-2 pb-2">
                                                {projectsByDate[day].slice(4).map(project => (
                                                    <div key={project.id} className="bg-sky-900 rounded-lg px-2 py-1">
                                                        <p className="text-sm font-medium">{project.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </FloatingPanelContent>
                                    </FloatingPanelRoot>
                                )
                             }
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};

export default MonthView;
