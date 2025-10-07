'use client';

import { useDate } from '@/context/DateContext';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

export default function DateFilter() {
    const { selectedDate, setSelectedDate } = useDate();

    return (
        <div className="flex items-center gap-2">
            <Popover>
            <CalendarIcon className="h-5 w-5 text-purple-600" />
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="p-2 font-medium">
                        {format(selectedDate, 'EEEE, MMM dd, yyyy')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                    <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={(date) => date && setSelectedDate(date)}
                        initialFocus
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}