// Scheduler.tsx

"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarProvider, useCalendar } from "@/components/Providers/CalendarContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useProjectContext } from "@/components/Providers/ProjectContext";
import DayView from "@/components/DaysView";
import WeekView from "@/components/WeekView";
import MonthView from "@/components/MonthView";

const Scheduler = () => {
  return (
    <CalendarProvider weekStartsOn="monday">
      <Calendar />
    </CalendarProvider>
  );
};

export default Scheduler;

const Calendar = () => {
  const {
    Getters: { getDaysInMonth, getDaysInWeek, getWeekNumber, getDayName },
  } = useCalendar();
  const { projects } = useProjectContext();
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const weekNumber = getWeekNumber(currentDate);
  const daysInWeek = getDaysInWeek(weekNumber, currentDate.getFullYear());

  return (
    <div className="relative w-full h-full text-white">
      <div className="absolute top-0 z-[-2] h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
      <Tabs defaultValue="day" className="w-full flex items-center flex-col py-5">
        <TabsList className="bg-neutral-900">
          <TabsTrigger value="day">Day View</TabsTrigger>
          <TabsTrigger value="week">Week View</TabsTrigger>
          <TabsTrigger value="month">Month View</TabsTrigger>
        </TabsList>

        <AnimatePresence mode="wait">
          <div className="w-full h-full">
            <TabsContent value="day" className="w-full h-full">
              <DayView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                projects={projects}
              />
            </TabsContent>

            <TabsContent value="week" className="w-full h-full">
              <WeekView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                weekNumber={weekNumber}
                daysInWeek={daysInWeek}
                getDayName={getDayName}
                projects={projects}
              />
            </TabsContent>

            <TabsContent value="month" className="w-full h-full">
              <MonthView
                currentDate={currentDate}
                setCurrentDate={setCurrentDate}
                getDaysInMonth={getDaysInMonth}
                projects={projects}
              />
            </TabsContent>
          </div>
        </AnimatePresence>
      </Tabs>
    </div>
  );
};
