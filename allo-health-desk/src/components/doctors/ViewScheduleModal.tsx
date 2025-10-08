'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Edit, Save, Loader2 } from 'lucide-react';
import { doctorApi } from '@/lib/api/doctorApi';
import type { Schedule, Break } from '@/types/doctor';

interface ViewScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId: string;
    onUpdateSchedule: (schedules: Schedule[]) => Promise<void>;
    onUpdateBreaks: (breaks: Break[]) => Promise<void>;
}

export default function ViewScheduleModal({
    isOpen,
    onClose,
    doctorId,
    onUpdateSchedule,
    onUpdateBreaks,
}: ViewScheduleModalProps) {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [breaks, setBreaks] = useState<Break[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch schedule + breaks when modal opens
    useEffect(() => {
        if (isOpen && doctorId) {
            const fetchSchedule = async () => {
                try {
                    setLoading(true);
                    const data = await doctorApi.getSchedulesWithBreaks(doctorId);
                    setSchedules(data.schedules);
                    setBreaks(data.breaks);
                } catch (err) {
                    toast.error('Failed to load schedule');
                    console.error(err);
                } finally {
                    setLoading(false);
                }
            };
            fetchSchedule();
        }
    }, [doctorId, isOpen]);

    const handleScheduleChange = (
        index: number,
        field: keyof Schedule,
        value: Schedule[typeof field]
    ) => {
        setSchedules(prev => {
            const newSchedules = [...prev];
            newSchedules[index] = { ...newSchedules[index], [field]: value };
            return newSchedules;
        });
    };

    const handleBreakChange = (
        index: number,
        field: keyof Break,
        value: Break[typeof field]
    ) => {
        setBreaks(prev => {
            const newBreaks = [...prev];
            newBreaks[index] = { ...newBreaks[index], [field]: value };
            return newBreaks;
        });
    };

    const saveChanges = async () => {
        try {
            setSaving(true);
            await onUpdateSchedule(schedules);
            await onUpdateBreaks(breaks);
            setIsEditing(false);
            toast.success('Schedule and breaks updated');
        } catch (err) {
            toast.error('Failed to save changes');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Dialog open={isOpen} onOpenChange={onClose}>
                <DialogContent>
                    <DialogTitle>View Schedule</DialogTitle>
                    <div className="flex justify-center py-6">
                        <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                    </div>
                </DialogContent>
            </Dialog>
        );
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>View Schedule</DialogTitle>
                    <p className="text-sm text-gray-500">Manage working hours and breaks</p>
                </DialogHeader>

                <div className="space-y-6">
                    <div className="flex justify-between items-center">
                        <h3 className="font-semibold">Working Hours</h3>
                        {!isEditing ? (
                            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" /> Edit
                            </Button>
                        ) : (
                            <Button size="sm" onClick={saveChanges} disabled={saving}>
                                {saving ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="mr-2 h-4 w-4" /> Save Changes
                                    </>
                                )}
                            </Button>
                        )}
                    </div>

                    {/* Schedules Table */}
                    <div className="border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Day</TableHead>
                                    <TableHead>Start Time</TableHead>
                                    <TableHead>End Time</TableHead>
                                    <TableHead>Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {schedules.map((sched, index) => (
                                    <TableRow key={sched.id || index}>
                                        <TableCell>
                                            {isEditing ? (
                                                <select
                                                    value={sched.dayOfWeek}
                                                    onChange={(e) => handleScheduleChange(index, 'dayOfWeek', e.target.value as any)}
                                                    className="border rounded px-2 py-1 w-full"
                                                >
                                                    {(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const).map(day => (
                                                        <option key={day} value={day}>{day}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                sched.dayOfWeek
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={sched.startTime.slice(0, 5)}
                                                    onChange={(e) => handleScheduleChange(index, 'startTime', `${e.target.value}:00`)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                sched.startTime.slice(0, 5)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <input
                                                    type="time"
                                                    value={sched.endTime.slice(0, 5)}
                                                    onChange={(e) => handleScheduleChange(index, 'endTime', `${e.target.value}:00`)}
                                                    className="border rounded px-2 py-1 w-full"
                                                />
                                            ) : (
                                                sched.endTime.slice(0, 5)
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            {isEditing ? (
                                                <select
                                                    value={sched.isWorking.toString()}
                                                    onChange={(e) => handleScheduleChange(index, 'isWorking', e.target.value === 'true')}
                                                    className="border rounded px-2 py-1 w-full"
                                                >
                                                    <option value="true">Working</option>
                                                    <option value="false">Off</option>
                                                </select>
                                            ) : (
                                                sched.isWorking ? 'Working' : 'Off'
                                            )}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Breaks Table */}
                    <div>
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="font-semibold">Breaks</h3>
                        </div>
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Day</TableHead>
                                        <TableHead>Start Time</TableHead>
                                        <TableHead>End Time</TableHead>
                                        <TableHead>Type</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {breaks.map((brk, index) => (
                                        <TableRow key={brk.id || index}>
                                            <TableCell>
                                                {isEditing ? (
                                                    <select
                                                        value={brk.dayOfWeek}
                                                        onChange={(e) => handleBreakChange(index, 'dayOfWeek', e.target.value as any)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    >
                                                        {(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const).map(day => (
                                                            <option key={day} value={day}>{day}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    brk.dayOfWeek
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <input
                                                        type="time"
                                                        value={brk.startTime.slice(0, 5)}
                                                        onChange={(e) => handleBreakChange(index, 'startTime', `${e.target.value}:00`)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    brk.startTime.slice(0, 5)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <input
                                                        type="time"
                                                        value={brk.endTime.slice(0, 5)}
                                                        onChange={(e) => handleBreakChange(index, 'endTime', `${e.target.value}:00`)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    />
                                                ) : (
                                                    brk.endTime.slice(0, 5)
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {isEditing ? (
                                                    <select
                                                        value={brk.breakType}
                                                        onChange={(e) => handleBreakChange(index, 'breakType', e.target.value as any)}
                                                        className="border rounded px-2 py-1 w-full"
                                                    >
                                                        <option value="LUNCH">Lunch</option>
                                                        <option value="BREAK">Break</option>
                                                        <option value="MEETING">Meeting</option>
                                                    </select>
                                                ) : (
                                                    brk.breakType
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}