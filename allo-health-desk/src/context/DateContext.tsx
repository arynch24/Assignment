'use client';

import { createContext, useContext, useState, useEffect } from 'react';

type DateContextType = {
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
};

const DateContext = createContext<DateContextType | undefined>(undefined);

export function DateProvider({ children }: { children: React.ReactNode }) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  useEffect(() => {
    // Optional: persist date in localStorage
    const saved = localStorage.getItem('selectedDate');
    if (saved) {
      setSelectedDate(new Date(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('selectedDate', selectedDate.toISOString());
  }, [selectedDate]);

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  );
}

export const useDate = () => {
  const context = useContext(DateContext);
  if (!context) throw new Error('useDate must be used within DateProvider');
  return context;
};