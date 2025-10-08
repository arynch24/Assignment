'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';

interface QueueFiltersProps {
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

export default function QueueFilters({
  selectedDate,
  onDateChange,
  searchTerm,
  onSearchChange,
}: QueueFiltersProps) {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full pl-10">
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && onDateChange(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="relative flex-1">
          <Input
            placeholder="Search patient name or queue number..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <Button variant="outline" size="icon" className="md:hidden">
          <CalendarIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}