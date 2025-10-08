'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { doctorApi } from '@/lib/api/doctorApi';
import type { Appointment } from '@/types/appointment';
import type { Doctor } from '@/types/doctor';

interface RescheduleAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointment: Appointment;
    onRescheduleSuccess: (updatedAppointment: Appointment) => void;
}

export default function RescheduleAppointmentModal({
    isOpen,
    onClose,
    appointment,
    onRescheduleSuccess,
}: RescheduleAppointmentModalProps) {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const doctorsRes = await doctorApi.getAllDoctors();
                setDoctors(doctorsRes);
                // Pre-select current doctor
                const currentDoctor = doctorsRes.find(d => d.id === appointment.doctor.id);
                setSelectedDoctor(currentDoctor || null);
            } catch (err) {
                toast.error('Failed to load doctors');
            }
        };
        if (isOpen) {
            fetchDoctors();
        }
    }, [isOpen, appointment?.doctor?.id]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchAvailability = async () => {
                try {
                    setLoading(true);
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const res = await doctorApi.getDoctorAvailability(selectedDoctor.id, dateStr);
                    setAvailableSlots(res.data.availableSlots || []);

                    // Pre-select current slot if available
                    const currentStartTime = appointment.appointmentDateTime.split('T')[1].slice(0, 5);
                    const currentSlot = res.data.availableSlots.find(
                        (slot: any) => slot.start === `${currentStartTime}:00`
                    );
                    setSelectedSlot(currentSlot || null);
                } catch (err) {
                    toast.error('Failed to load doctor availability');
                } finally {
                    setLoading(false);
                }
            };
            fetchAvailability();
        }
    }, [selectedDoctor, selectedDate, appointment?.appointmentDateTime]);

    const handleReschedule = async () => {
        if (!selectedDoctor || !selectedSlot) {
            toast.error('Please select doctor and slot');
            return;
        }

        try {
            setLoading(true);
            const appointmentDateTime = `${selectedDate.toISOString().split('T')[0]}T${selectedSlot.start}+05:30`;
            // Only send changed fields
            const updatedAppointment = await appointmentApi.updateAppointment(appointment.id, {
                doctorId: selectedDoctor.id,
                appointmentDateTime,
                status: 'RESCHEDULED',
            });

            onRescheduleSuccess(updatedAppointment);
            onClose();
            toast.success('Appointment rescheduled successfully');
        } catch (err) {
            toast.error('Failed to reschedule appointment');
        } finally {
            setLoading(false);
        }
    };

    if (appointment) {
        console.log(appointment)
    }

    if (!appointment) {
        return null;
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Reschedule Appointment</DialogTitle>
                    <p className="text-sm text-gray-500">
                        Patient: <span className="font-medium">{appointment.patient.name}</span>
                    </p>
                </DialogHeader>
                <div className="py-4 space-y-4">
                    <div>
                        <Label className='pb-2'>Select Doctor</Label>
                        <Select
                            value={selectedDoctor?.id || ''}
                            onValueChange={(value) => {
                                const doctor = doctors.find(d => d.id === value);
                                setSelectedDoctor(doctor || null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select doctor" />
                            </SelectTrigger>
                            <SelectContent>
                                {doctors.map(doctor => (
                                    <SelectItem key={doctor.id} value={doctor.id}>
                                        {doctor.name} ({doctor.specialization})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Input
                            type="date"
                            value={selectedDate.toISOString().split('T')[0]}
                            onChange={(e) => setSelectedDate(new Date(e.target.value))}
                            className="w-full"
                            label='Select Date'
                        />
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-6">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                        </div>
                    ) : (
                        <>
                            <Label>Select New Slot</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto">
                                {availableSlots.map((slot, index) => (
                                    <Button
                                        key={index}
                                        variant={selectedSlot === slot ? 'default' : 'outline'}
                                        onClick={() => setSelectedSlot(slot)}
                                        disabled={!slot.isAvailable}
                                        className="h-auto py-3 text-sm"
                                    >
                                        {slot.start} - {slot.end}
                                        {!slot.isAvailable && <span className="ml-1 text-red-500">Unavailable</span>}
                                    </Button>
                                ))}
                            </div>
                        </>
                    )}

                    <div className="flex gap-2 pt-4">
                        <Button variant="ghost" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button
                            disabled={!selectedDoctor || !selectedSlot || !selectedSlot.isAvailable}
                            onClick={handleReschedule}
                        >
                            {loading ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}