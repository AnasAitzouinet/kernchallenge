// DayView.tsx

"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import AddProjectForm from "@/components/AddProjectForm";
import { ProjectRead } from "@/types/time-tracking";

interface DayViewProps {
  currentDate: Date;
  setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
  projects: ProjectRead[];
}

const DayView: React.FC<DayViewProps> = ({ currentDate, setCurrentDate, projects }) => {
  const hours = Array.from({ length: 24 }, (_, index) => index);
  const [hoveredHour, setHoveredHour] = useState<number | null>(null);

  // Filter projects for the current day
  const filteredProjects = projects
    .filter(
      (project) =>
        new Date(project.start_time).toDateString() === currentDate.toDateString()
    )
    .map((project) => ({
      title: project.name,
      start: new Date(project.start_time),
      end: new Date(project.end_time || new Date()),
      description: project.description || "No Description",
      color: "rgba(35, 68, 68, 0.5)", // Or use project-specific colors
    }));

  // Define the height of each hour block (assuming h-16 corresponds to 64px)
  const hourHeight = 64;

  return (
    <motion.div
      key="day"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col justify-start items-center py-5 px-5 w-full h-full"
    >
      <h2 className="text-3xl font-bold text-center">{currentDate.toDateString()}</h2>
      <div className="flex justify-between items-center w-full my-4">
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() - 1))
          }
        >
          Prev Day
        </Button>
        <Button
          variant="secondary"
          onClick={() =>
            setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate() + 1))
          }
        >
          Next Day
        </Button>
      </div>
      <div className="relative w-full bg-neutral-900/20 backdrop-blur-2xl border border-gray-300/20 text-white my-5 rounded-xl overflow-hidden">
        {/* Render the hour blocks */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative h-16 border-b border-neutral-800"
            onMouseEnter={() => setHoveredHour(hour)}
            onMouseLeave={() => setHoveredHour(null)}
          >
            <div className="flex items-center px-4 h-full">
              <p className="z-10">{hour < 10 ? `0${hour}` : hour}:00</p>
              {hoveredHour === hour && (
                <div className="absolute inset-0 flex justify-center items-center bg-neutral-800/70 cursor-pointer">
                  <AddProjectForm>
                    <div className="flex items-center gap-x-2">
                      Add Project
                      <Plus />
                    </div>
                  </AddProjectForm>
                </div>
              )}
            </div>
          </div>
        ))}
        {/* Render the projects as absolutely positioned divs */}
        {filteredProjects.map((project, index) => {
          // Calculate the start and end times in hours (including minutes)
          const eventStart =
            project.start.getHours() + project.start.getMinutes() / 60;
          const eventEnd = project.end.getHours() + project.end.getMinutes() / 60;

          // Calculate the top position and height based on the event times
          const topPosition = eventStart * hourHeight;
          const eventHeight = (eventEnd - eventStart) * hourHeight;

          return (
            <div
              key={index}
              className={cn(
                "absolute left-20 right-2 border border-gray-300/10 px-4 py-2 m-2 rounded-md",
                "bg-blue-600/70"
              )}
              style={{
                top: topPosition,
                height: eventHeight - 16, // Adjust height to account for margins/padding
              }}
            >
              <h3 className="font-bold">{project.title}</h3>
              <p>{project.description}</p>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default DayView;
