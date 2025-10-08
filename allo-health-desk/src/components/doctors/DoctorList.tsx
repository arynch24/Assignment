'use client';

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Edit, Trash2, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import ViewScheduleModal from './ViewScheduleModal';
import { useState } from 'react';
import { doctorApi } from '@/lib/api/doctorApi';

interface DoctorListProps {
    doctors: any[];
    onDelete: (id: string) => void;
    onEdit: (doctor: any) => void;
}

export default function DoctorList({ doctors, onDelete, onEdit }: DoctorListProps) {
    const [selectedDoctorId, setSelectedDoctorId] = useState<any>(null);
    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

    const getWorkingHours = (schedule: any[]) => {
        if (!schedule || schedule.length === 0) return 'Not set';

        const workingDays = schedule.filter(s => s.isWorking);
        if (workingDays.length === 0) return 'Off Today';

        const hours = workingDays.map(s => {
            const start = s.startTime.slice(0, 5);
            const end = s.endTime.slice(0, 5);
            return `${start} - ${end}`;
        }).join(', ');

        return hours;
    };

    const getTodayAvailability = (schedule: any[]) => {
        if (!schedule || schedule.length === 0) return false;

        const today = new Date().toLocaleString('en-US', { weekday: 'long' }).toUpperCase();
        const todaySchedule = schedule.find(s => s.dayOfWeek === today);
        return todaySchedule?.isWorking || false;
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map(doctor => (
                <Card key={doctor.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Avatar className="h-12 w-12">
                            <AvatarImage src={doctor.profilePhoto || '/avatar-placeholder.png'} alt={doctor.name} />
                            <AvatarFallback>{doctor.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                            <CardTitle className="text-lg">{doctor.name}</CardTitle>
                            <Badge variant="secondary" className="mt-1">
                                {doctor.specialization}
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doctor.gender}</span>
                            <span>•</span>
                            <span>{doctor.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <span>{doctor.experience} years experience</span>
                        </div>
                        <div>
                            <p className="text-xs font-medium text-gray-500">WORKING HOURS</p>
                            <p className="text-sm">{getWorkingHours(doctor.schedule)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getTodayAvailability(doctor.schedule) ? (
                                <Badge className="text-xs">Available Today</Badge>
                            ) : (
                                <Badge variant="secondary" className="text-xs">Off Today</Badge>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                                setSelectedDoctorId(doctor.id);
                                setIsScheduleModalOpen(true);
                            }}
                        >
                            <Calendar className="mr-2 h-4 w-4" /> View Schedule
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onEdit(doctor)}>
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onDelete(doctor.id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                    </CardFooter>
                </Card>
            ))}

            {selectedDoctorId && (
                <ViewScheduleModal
                    isOpen={isScheduleModalOpen}
                    onClose={() => setIsScheduleModalOpen(false)}
                    doctorId={selectedDoctorId}
                    onUpdateSchedule={async (schedules) => {
                        try {
                            await doctorApi.updateSchedules(selectedDoctorId, schedules);
                            toast.success('Schedule updated');
                        } catch (err) {
                            toast.error('Failed to update schedule');
                        }
                    }}
                    onUpdateBreaks={async (breaks) => {
                        try {
                            await doctorApi.updateBreaks(selectedDoctorId, breaks);
                            toast.success('Breaks updated');
                        } catch (err) {
                            toast.error('Failed to update breaks');
                        }
                    }}
                />
            )}
        </div>
    );
}