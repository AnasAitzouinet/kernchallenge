"use client"
import React, { createContext, useState, useEffect, useContext } from 'react';


interface CalendarContextProps {
    Getters: {
        // return array of days in month
        getDaysInMonth: (month: number, year: number) => { day: number }[]; // Updated return type
        getDaysInWeek: (week: number, year: number) => Date[];
        getWeekNumber: (date: Date) => number;
        getDayName: (date: number) => string;
    }
}

const CalendarContext = createContext<CalendarContextProps | undefined>(undefined);

export function CalendarProvider({ children, weekStartsOn }: { children: React.ReactNode , weekStartsOn: "sunday" | "monday" }) {
    const getDaysInMonth = (month: number, year: number) => {
        return Array.from(
          { length: new Date(year, month + 1, 0).getDate() },
          (_, index) => ({
            day: index + 1,
          })
        );
      };
    
      const getDaysInWeek = (week: number, year: number) => {
        // Determine if the week should start on Sunday (0) or Monday (1)
        const startDay = weekStartsOn === "sunday" ? 0 : 1;
    
        // Get January 1st of the year
        const janFirst = new Date(year, 0, 1);
    
        // Calculate how many days we are offsetting from January 1st
        const janFirstDayOfWeek = janFirst.getDay();
    
        // Calculate the start of the week by finding the correct day in the year
        const weekStart = new Date(janFirst);
        weekStart.setDate(
          janFirst.getDate() +
            (week - 1) * 7 +
            ((startDay - janFirstDayOfWeek + 7) % 7)
        );
    
        // Generate the week’s days
        const days = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(weekStart);
          day.setDate(day.getDate() + i);
          days.push(day);
        }
    
        return days;
      };
    
      const getWeekNumber = (date: Date) => {
        const d = new Date(
          Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
        );
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        const weekNo = Math.ceil(
          ((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
        );
        return weekNo;
      };
      const getDayName = (day: number) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        return days[day];
      };
    const Getters = {
        getDaysInMonth,
        getDaysInWeek,
        getWeekNumber,
        getDayName
    }

    return (
        <CalendarContext.Provider value={{ Getters }}>
            {children}
        </CalendarContext.Provider>
    )
}

export function useCalendar() {
    const context = useContext(CalendarContext);
    if (!context) {
        throw new Error('useCalendar must be used within a CalendarProvider');
    }
    return context;
}