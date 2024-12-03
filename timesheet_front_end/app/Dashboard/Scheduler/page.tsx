"use client"
import React, { useState } from 'react'
import { motion, AnimatePresence, animate, color } from 'framer-motion'
import { CalendarProvider, useCalendar } from '@/components/Providers/CalendarContext'
import { Button } from '@/components/ui/button'

export default function Scheduler() {
    return (
        <CalendarProvider weekStartsOn='monday'>
            <Calendar />
        </CalendarProvider>
    )
}

const Calendar = () => {
    const {
        Getters: { getDaysInMonth, getDaysInWeek, getWeekNumber, getDayName }
    } = useCalendar()

    const [view, setView] = useState<'day' | 'week' | 'month'>('day');
    const [currentDate, setCurrentDate] = useState<Date>(new Date());
    const weekNumber = getWeekNumber(currentDate);
    const daysInWeek = getDaysInWeek(weekNumber, currentDate.getFullYear());

    const renderCalendar = () => {
        switch (view) {
            case 'month':
                return <MonthView currentDate={currentDate} setCurrentDate={setCurrentDate} getDaysInMonth={getDaysInMonth} />;
            case 'week':
                return <WeekView currentDate={currentDate} setCurrentDate={setCurrentDate} weekNumber={weekNumber} daysInWeek={daysInWeek} getDayName={getDayName} />;
            case 'day':
                return <DayView currentDate={currentDate} setCurrentDate={setCurrentDate} />;
            default:
                return null;
        }
    };

    return (
        <div className='relative w-full h-full text-white'>
            <div className="absolute top-0 z-[-2] h-full w-full bg-neutral-950 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
            <div className=''>
                <Button onClick={() => setView('day')}>Day View</Button>
                <Button onClick={() => setView('week')}>Week View</Button>
                <Button onClick={() => setView('month')}>Month View</Button>
            </div>
            <AnimatePresence>
                {renderCalendar()}
            </AnimatePresence>
        </div>
    )
}

interface MonthViewProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    getDaysInMonth: (month: number, year: number) => { day: number }[];
}
const MonthView: React.FC<MonthViewProps> = ({ currentDate, setCurrentDate, getDaysInMonth }) => {
    const daysInMonth = getDaysInMonth(currentDate.getMonth(), currentDate.getFullYear());
    const dayNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Get the first day of the month to determine the starting position
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const daysInPrevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0).getDate();
    const prevMonthDays = Array.from({ length: firstDayOfMonth - 1 }, (_, i) => daysInPrevMonth - i).reverse();

    return (
        <motion.div
            key="month"
            initial={{ opacity: 0, height: '100%' }}
            animate={{ opacity: 1, height: '100%' }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className='py-5 p-5 space-y-2 h-full' // Changed h-screen to h-full
        >
            <h1 className='text-4xl font-bold'> {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}</h1>
            <div>
                <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}>
                    Prev Month
                </Button>
                <Button onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}>
                    Next Month
                </Button>
            </div>
            <div
                className='bg-neu tral-900/40
                grid grid-cols-7 gap-2
                backdrop-blur-2xl h-full text-white rounded-xl p-5 shadow-md'
            >
                {dayNames.map((dayName) => (
                    <div key={dayName}
                        className='p-5 text-start text-3xl font-black'
                    >
                        {dayName.slice(0, 3)}
                    </div>
                ))}
                {prevMonthDays.map((day) => (
                    <Card key={day}
                        className='p-5 w-full h-32 text-start text-2xl font-bold border border-gray-300/10 bg-neutral-900/50  text-white'
                    >
                        {day}
                    </Card>
                ))}
                {daysInMonth.map(({ day }) => (
                    <Card key={day}
                        className='p-5 w-full h-32 text-start text-2xl font-bold border border-gray-300/10 bg-neutral-800/50  text-white'
                    >
                        {day}
                    </Card>
                ))}
            </div>
        </motion.div>
    );
};

interface WeekViewProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
    weekNumber: number;
    daysInWeek: Date[];
    getDayName: (day: number) => string;
}

const WeekView: React.FC<WeekViewProps> = ({ currentDate, setCurrentDate, weekNumber, daysInWeek, getDayName }) => {
    return (
        <motion.div
            key="week"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
        >
            <h2>Week View - Week {weekNumber} of {currentDate.getFullYear()}</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr>
                        <th style={{ border: '1px solid #ccc', padding: '10px' }}>Hours</th>
                        {daysInWeek.map((date) => (
                            <th key={date.toString()} style={{ border: '1px solid #ccc', padding: '10px' }}>
                                {getDayName(date.getDay())} {date.getDate()}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {Array.from({ length: 24 }, (_, hour) => (
                        <tr key={hour}>
                            <td style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                                {hour}:00
                            </td>
                            {daysInWeek.map((date) => (
                                <td key={date.toString()} style={{ border: '1px solid #ccc', padding: '10px', textAlign: 'center' }}>
                                    <div>No Events</div>
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </table>
            <div>
                <Button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 7)))}>
                    Prev Week
                </Button>
                <Button onClick={() => setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 7)))}>
                    Next Week
                </Button>
            </div>
        </motion.div>
    );
};

import AddProjectForm from '@/components/AddProjectForm'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface DayViewProps {
    currentDate: Date;
    setCurrentDate: React.Dispatch<React.SetStateAction<Date>>;
}
const DayView: React.FC<DayViewProps> = ({ currentDate, setCurrentDate }) => {
        const hours = Array.from({ length: 24 }, (_, index) => index);
        const [hoveredHour, setHoveredHour] = useState<number | null>(null);
        const events = [
          {
            title: 'Meeting with client',
            description: 'Discuss project requirements and timelines',
            start: new Date(2022, 2, 1, 4, 0),
            end: new Date(2022, 2, 1, 12, 0),
            color: 'rgb(239 68 68 / 0.5)',
          },
          {
            title: 'Meeting another client',
            description: 'Discuss project requirements and timelines',
            start: new Date(2022, 2, 1, 12, 0),
            end: new Date(2022, 2, 1, 11, 0),
            color: 'rgb(35 68 68 / 0.5)',
          },
          // Add more events as needed
        ];
      
        // Define the height of each hour block (assuming h-16 corresponds to 64px)
        const hourHeight = 64;
      
        return (
          <motion.div
            key="day"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-col justify-start items-center py-5 p-5"
          >
            <h2 className="text-3xl font-bold text-center">
              {currentDate.toDateString()}
            </h2>
            <div
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
            >
              <Button
                variant={'secondary'}
                onClick={() =>
                  setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() - 1)))
                }
              >
                Prev Day
              </Button>
              <Button
                variant={'secondary'}
                onClick={() =>
                  setCurrentDate(new Date(currentDate.setDate(currentDate.getDate() + 1)))
                }
              >
                Next Day
              </Button>
            </div>
            <div className="flex justify-start w-full bg-neutral-900/20 backdrop-blur-2xl border border-gray-300/20 shadow-white text-white my-5 rounded-xl overflow-hidden">
              {/* Add relative positioning to the container */}
              <div className="w-full relative">
                {/* Render the hour blocks */}
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="relative h-16 border-b border-neutral-800"
                    onMouseEnter={() => setHoveredHour(hour)}
                    onMouseLeave={() => setHoveredHour(null)}
                  >
                    <div className="flex items-center px-4 h-full">
                      {hour < 10 ? `0${hour}` : hour}:00
                      {hoveredHour === hour && (
                        <motion.div
                          initial={{ opacity: 0, width: '100%' }}
                          animate={{ opacity: 1, width: '100%' }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5 }}
                          className="absolute top-0 left-0 w-full h-full text-white flex justify-center items-center text-md capitalize cursor-pointer hover:bg-neutral-800"
                        >
                          <AddProjectForm>Add Project</AddProjectForm>
                        </motion.div>
                      )}
                    </div>
                  </div>
                ))}
                {/* Render the events as absolutely positioned divs */}
                {events.map((event, index) => {
                  // Calculate the start and end times in hours (including minutes)
                  const eventStart =
                    event.start.getHours() + event.start.getMinutes() / 60;
                  const eventEnd =
                    event.end.getHours() + event.end.getMinutes() / 60;
      
                  // Calculate the top position and height based on the event times
                  const topPosition = eventStart * hourHeight;
                  const eventHeight = (eventEnd - eventStart) * hourHeight;
      
                  return (
                    <div
                      key={index}
                      className={cn("absolute left-20 right-0 border   border-gray-300/10 px-4 py-2 m-2 rounded-md")}
                      style={{ top: topPosition, height: eventHeight - 16 , backgroundColor:event.color  }} // Adjust height to account for margins/padding
                    >
                      <h3 className="font-bold">{event.title}</h3>
                      <p>{event.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        );
      };
