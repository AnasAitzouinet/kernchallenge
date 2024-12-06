// WeekView.tsx

"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ProjectRead } from "@/types/time-tracking";

interface WeekViewProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  weekNumber: number;
  daysInWeek: Date[];
  getDayName: (day: number) => string;
  projects: ProjectRead[];
}

const WeekView: React.FC<WeekViewProps> = ({
  currentDate,
  setCurrentDate,
  weekNumber,
  daysInWeek,
  getDayName,
  projects,
}) => {
  // Group projects by day
  const projectsByDay: { [key: string]: ProjectRead[] } = {};

  daysInWeek.forEach((date) => {
    const dateKey = date.toDateString();
    projectsByDay[dateKey] = projects.filter(
      (project) =>
        new Date(project.start_time).toDateString() === dateKey
    );
  });

  return (
    <motion.div
      key="week"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="py-5 px-5 w-full h-full min-h-screen"
    >
      <h2 className="text-3xl font-bold text-center mb-4">
        Week {weekNumber} of {currentDate.getFullYear()}
      </h2>
      <div className="flex justify-between items-center mb-4">
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - 7
              )
            )
          }
        >
          Prev Week
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentDate(
              new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + 7
              )
            )
          }
        >
          Next Week
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-2">
        {daysInWeek.map((date) => (
          <div key={date.toString()} className="bg-neutral-900/40 p-4 rounded-md">
            <h3 className="text-xl font-bold">
              {getDayName(date.getDay())} {date.getDate()}
            </h3>
            <ul>
              {projectsByDay[date.toDateString()]?.map((project) => (
                <li key={project.id} className="mt-2">
                  <div className="bg-blue-600/70 p-2 rounded-md">
                    <h4 className="font-bold">{project.name}</h4>
                    <p>{project.description}</p>
                  </div>
                </li>
              )) || <p>No Events</p>}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default WeekView;
