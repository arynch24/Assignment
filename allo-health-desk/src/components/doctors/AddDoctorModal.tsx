'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Minus } from 'lucide-react';
import { Schedule, Break } from '@/types/doctor';
import { doctorApi } from '@/lib/api/doctorApi';

interface AddDoctorModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddSuccess?: (doctor: any) => void;
    editingDoctor?: any;
}

const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];

export default function AddDoctorModal({
    isOpen,
    onClose,
    onAddSuccess,
    editingDoctor,
}: AddDoctorModalProps) {
    const [formData, setFormData] = useState({
        name: '',
        specialization: '',
        gender: 'MALE',
        location: '',
        phone: '',
        email: '',
        experience: 0,
        qualifications: '',
        // profilePhoto: '',
        consultationDuration: 30,
        maxAppointmentsPerDay: 16,
        schedule: [
            { dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'TUESDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'WEDNESDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'THURSDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'FRIDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'SATURDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
            { dayOfWeek: 'SUNDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
        ],
        breaks: [
            { dayOfWeek: 'MONDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
            { dayOfWeek: 'TUESDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
            { dayOfWeek: 'WEDNESDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
            { dayOfWeek: 'THURSDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
            { dayOfWeek: 'FRIDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
        ],
    });

    useEffect(() => {
        if (editingDoctor) {
            setFormData({
                name: editingDoctor.name || '',
                specialization: editingDoctor.specialization || '',
                gender: editingDoctor.gender || 'MALE',
                location: editingDoctor.location || '',
                phone: editingDoctor.phone || '',
                email: editingDoctor.email || '',
                experience: editingDoctor.experience || 0,
                qualifications: editingDoctor.qualifications || '',
                // profilePhoto: editingDoctor.profilePhoto || '',
                consultationDuration: editingDoctor.consultationDuration || 30,
                maxAppointmentsPerDay: editingDoctor.maxAppointmentsPerDay || 16,
                schedule: editingDoctor.schedule || [],
                breaks: editingDoctor.breaks || [],
            });
        } else {
            setFormData({
                name: '',
                specialization: '',
                gender: 'MALE',
                location: '',
                phone: '',
                email: '',
                experience: 0,
                qualifications: '',
                // profilePhoto: '',
                consultationDuration: 30,
                maxAppointmentsPerDay: 16,
                schedule: [
                    { dayOfWeek: 'MONDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
                    { dayOfWeek: 'TUESDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
                    { dayOfWeek: 'WEDNESDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
                    { dayOfWeek: 'THURSDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
                    { dayOfWeek: 'FRIDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: true },
                    { dayOfWeek: 'SATURDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: false },
                    { dayOfWeek: 'SUNDAY', startTime: '09:00:00', endTime: '17:00:00', isWorking: false },
                ],
                breaks: [
                    { dayOfWeek: 'MONDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
                    { dayOfWeek: 'TUESDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
                    { dayOfWeek: 'WEDNESDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
                    { dayOfWeek: 'THURSDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
                    { dayOfWeek: 'FRIDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
                ],
            });
        }
    }, [editingDoctor]);

    const handleScheduleChange = (
        index: number,
        field: keyof Schedule,
        value: Schedule[typeof field]
    ) => {
        setFormData(prev => {
            const newSchedule = [...prev.schedule];
            newSchedule[index] = {
                ...newSchedule[index],
                [field]: value,
            };
            return { ...prev, schedule: newSchedule };
        });
    };

    const handleBreakChange = (
        index: number,
        field: keyof Break,
        value: Break[typeof field]
    ) => {
        setFormData(prev => {
            const newBreaks = [...prev.breaks];
            newBreaks[index] = {
                ...newBreaks[index],
                [field]: value,
            };
            return { ...prev, breaks: newBreaks };
        });
    };

    const addBreak = () => {
        setFormData({
            ...formData,
            breaks: [
                ...formData.breaks,
                { dayOfWeek: 'MONDAY', startTime: '13:00:00', endTime: '14:00:00', breakType: 'LUNCH' },
            ],
        });
    };

    const removeBreak = (index: number) => {
        const newBreaks = formData.breaks.filter((_, i) => i !== index);
        setFormData({ ...formData, breaks: newBreaks });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingDoctor) {
                // Update doctor details only (not schedule/breaks here — handled separately in ViewScheduleModal)
                const { schedule, breaks, ...rest } = formData;
                const updatedDoctor = await doctorApi.updateDoctor(editingDoctor.id, rest as any);
                toast.success('Doctor updated');
                onAddSuccess?.(updatedDoctor);
            } else {
                const newDoctor = await doctorApi.addDoctor(formData as any);
                toast.success('Doctor added');
                onAddSuccess?.(newDoctor);
            }
            onClose();
        } catch (err) {
            toast.error('Failed to save doctor');
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className='min-w-[680px] max-h-[90vh] overflow-y-auto'>
                <DialogHeader>
                    <DialogTitle>{editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Name</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Specialization</Label>
                            <Input
                                value={formData.specialization}
                                onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Gender</Label>
                            <Select
                                value={formData.gender}
                                onValueChange={(value) => setFormData({ ...formData, gender: value as any })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="MALE">Male</SelectItem>
                                    <SelectItem value="FEMALE">Female</SelectItem>
                                    <SelectItem value="OTHER">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Experience (years)</Label>
                            <Input
                                type="number"
                                value={formData.experience}
                                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                                min="0"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Consultation Duration (minutes)</Label>
                            <Input
                                type="number"
                                value={formData.consultationDuration}
                                onChange={(e) => setFormData({ ...formData, consultationDuration: parseInt(e.target.value) || 30 })}
                                min="15"
                                step="15"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Max Appointments Per Day</Label>
                            <Input
                                type="number"
                                value={formData.maxAppointmentsPerDay}
                                onChange={(e) => setFormData({ ...formData, maxAppointmentsPerDay: parseInt(e.target.value) || 16 })}
                                min="1"
                            />
                        </div>
                    </div>

                    {!editingDoctor && (
                        <div>
                            <div className="space-y-4">
                                <Label>Schedule</Label>
                                {formData.schedule.map((sched, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <Select
                                            value={sched.dayOfWeek}
                                            onValueChange={(value) => handleScheduleChange(index, 'dayOfWeek', value)}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {daysOfWeek.map(day => (
                                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="time"
                                            value={sched.startTime.slice(0, 5)}
                                            onChange={(e) => handleScheduleChange(index, 'startTime', `${e.target.value}:00`)}
                                            className="w-[120px]"
                                        />
                                        <Input
                                            type="time"
                                            value={sched.endTime.slice(0, 5)}
                                            onChange={(e) => handleScheduleChange(index, 'endTime', `${e.target.value}:00`)}
                                            className="w-[120px]"
                                        />
                                        <Select
                                            value={sched.isWorking.toString()}
                                            onValueChange={(value) => handleScheduleChange(index, 'isWorking', value === 'true')}
                                        >
                                            <SelectTrigger className="w-[100px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="true">Working</SelectItem>
                                                <SelectItem value="false">Off</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <Label>Breaks</Label>
                                    <Button type="button" variant="ghost" size="sm" onClick={addBreak}>
                                        <Plus className="h-4 w-4 mr-1" /> Add Break
                                    </Button>
                                </div>
                                {formData.breaks.map((brk, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <Select
                                            value={brk.dayOfWeek}
                                            onValueChange={(value) => handleBreakChange(index, 'dayOfWeek', value)}
                                        >
                                            <SelectTrigger className="w-[150px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {daysOfWeek.map(day => (
                                                    <SelectItem key={day} value={day}>{day}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Input
                                            type="time"
                                            value={brk.startTime.slice(0, 5)}
                                            onChange={(e) => handleBreakChange(index, 'startTime', `${e.target.value}:00`)}
                                            className="w-[120px]"
                                        />
                                        <Input
                                            type="time"
                                            value={brk.endTime.slice(0, 5)}
                                            onChange={(e) => handleBreakChange(index, 'endTime', `${e.target.value}:00`)}
                                            className="w-[120px]"
                                        />
                                        <Select
                                            value={brk.breakType}
                                            onValueChange={(value) => handleBreakChange(index, 'breakType', value)}
                                        >
                                            <SelectTrigger className="w-[120px]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LUNCH">Lunch</SelectItem>
                                                <SelectItem value="BREAK">Break</SelectItem>
                                                <SelectItem value="MEETING">Meeting</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="ghost" size="sm" onClick={() => removeBreak(index)}>
                                            <Minus className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" className="bg-purple-600 hover:bg-purple-700">
                            {editingDoctor ? 'Update Doctor' : 'Add Doctor'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}