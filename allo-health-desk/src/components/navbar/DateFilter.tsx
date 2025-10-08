'use client';

import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Popover, PopoverTrigger } from '@/components/ui/popover';

export default function DateFilter() {

    return (
        <div className="flex items-center gap-2">
            <Popover>
                <CalendarIcon className="h-5 w-5 text-purple-600" />
                <PopoverTrigger asChild>
                    <Button variant="ghost" className="p-2 font-medium">
                        {format(new Date(), 'EEEE, MMM dd, yyyy')}
                    </Button>
                </PopoverTrigger>
            </Popover>
        </div>
    );
}