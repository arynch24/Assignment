'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { appointmentApi } from '@/lib/api/appointmentApi';
import { patientApi } from '@/lib/api/patientApi';
import { doctorApi } from '@/lib/api/doctorApi';
import { Patient } from '@/types/patient';
import { Doctor } from '@/types/doctor';

interface BookAppointmentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onBookSuccess: (appointment: any) => void;
}

export default function BookAppointmentModal({
    isOpen,
    onClose,
    onBookSuccess,
}: BookAppointmentModalProps) {
    const [step, setStep] = useState<'select-patient' | 'create-patient' | 'select-doctor' | 'select-slot'>('select-patient');
    const [patients, setPatients] = useState<Patient[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
    const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [availableSlots, setAvailableSlots] = useState<any[]>([]);
    const [selectedSlot, setSelectedSlot] = useState<any>(null);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);
    const [creatingPatient, setCreatingPatient] = useState(false);

    useEffect(() => {
        const fetchPatientsAndDoctors = async () => {
            try {
                const [patientsRes, doctorsRes] = await Promise.all([
                    patientApi.getAllPatients(),
                    doctorApi.getAllDoctors(),
                ]);
                setPatients(patientsRes);
                setDoctors(doctorsRes);
            } catch (err) {
                toast.error('Failed to load patients or doctors');
            }
        };
        if (isOpen) {
            fetchPatientsAndDoctors();
        }
    }, [isOpen]);

    useEffect(() => {
        if (selectedDoctor && selectedDate) {
            const fetchAvailability = async () => {
                try {
                    setLoading(true);
                    const dateStr = selectedDate.toISOString().split('T')[0];
                    const res = await doctorApi.getDoctorAvailability(selectedDoctor.id, dateStr);
                    setAvailableSlots(res.data.availableSlots || []);
                } catch (err) {
                    toast.error('Failed to load doctor availability');
                } finally {
                    setLoading(false);
                }
            };
            fetchAvailability();
        }
    }, [selectedDoctor, selectedDate]);

    const handleCreatePatient = async () => {
        if (!selectedPatient?.name || !selectedPatient?.age || !selectedPatient?.gender || !selectedPatient?.phone) {
            toast.error('Please fill all required fields');
            return;
        }

        try {
            setCreatingPatient(true);
            const newPatient = await patientApi.createPatient({
                name: selectedPatient.name,
                age: selectedPatient.age,
                gender: selectedPatient.gender,
                phone: selectedPatient.phone,
                email: selectedPatient.email,
                address: selectedPatient.address,
                bloodGroup: selectedPatient.bloodGroup,
                medicalNotes: selectedPatient.medicalNotes,
                profilePhoto: selectedPatient.profilePhoto,
            });
            setPatients([...patients, newPatient]);
            setSelectedPatient(newPatient);
            setStep('select-doctor');
            toast.success('Patient created successfully');
        } catch (err) {
            toast.error('Failed to create patient');
        } finally {
            setCreatingPatient(false);
        }
    };

    const handleBookAppointment = async () => {
        if (!selectedPatient || !selectedDoctor || !selectedSlot) {
            toast.error('Please select patient, doctor, and slot');
            return;
        }

        try {
            setLoading(true);
            const appointmentDateTime = `${selectedDate.toISOString().split('T')[0]}T${selectedSlot.start}+05:30`;
            const newAppointment = await appointmentApi.createAppointment({
                patientId: selectedPatient.id,
                doctorId: selectedDoctor.id,
                appointmentDateTime,
                duration: 30,
                notes,
            });
            onBookSuccess(newAppointment);
            setStep('select-patient');
            setSelectedPatient(null);
            setSelectedDoctor(null);
            onClose();
            toast.success('Appointment booked successfully');
        } catch (err) {
            toast.error('Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 'select-patient':
                return (
                    <div className="space-y-4">
                        <Label>Select Patient</Label>
                        <Select
                            value={selectedPatient?.id || ''}
                            onValueChange={(value) => {
                                const patient = patients.find(p => p.id === value);
                                setSelectedPatient(patient || null);
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select existing patient" />
                            </SelectTrigger>
                            <SelectContent>
                                {patients.map(patient => (
                                    <SelectItem key={patient.id} value={patient.id}>
                                        {patient.name} ({patient.age} yrs)
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => {
                                setSelectedPatient(null);
                                setSelectedDoctor(null);
                                setStep('create-patient');
                            }}
                            >
                                + Create New Patient
                            </Button>
                            <Button
                                disabled={!selectedPatient}
                                onClick={() => setStep('select-doctor')}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                );

            case 'create-patient':
                return (
                    <div className="space-y-4">
                        <Label>Create New Patient</Label>
                        <Input
                            placeholder="Name"
                            value={selectedPatient?.name || ''}
                            onChange={(e) => setSelectedPatient(prev => ({ ...prev!, name: e.target.value }))}
                        />
                        <Input
                            placeholder="Age"
                            type="number"
                            value={selectedPatient?.age || ''}
                            onChange={(e) => setSelectedPatient(prev => ({ ...prev!, age: parseInt(e.target.value) || 0 }))}
                        />
                        <Select
                            value={selectedPatient?.gender || ''}
                            onValueChange={(value) => setSelectedPatient(prev => ({ ...prev!, gender: value as any }))}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Gender" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="MALE">Male</SelectItem>
                                <SelectItem value="FEMALE">Female</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                        <Input
                            placeholder="Phone"
                            value={selectedPatient?.phone || ''}
                            onChange={(e) => setSelectedPatient(prev => ({ ...prev!, phone: e.target.value }))}
                        />
                        <Input
                            placeholder="Email (optional)"
                            value={selectedPatient?.email || ''}
                            onChange={(e) => setSelectedPatient(prev => ({ ...prev!, email: e.target.value }))}
                        />
                        <div className='flex gap-2'>
                            <Button
                                disabled={creatingPatient}
                                onClick={handleCreatePatient}
                            >
                                {creatingPatient ? 'Creating...' : 'Create Patient'}
                            </Button>
                            <Button variant="ghost" onClick={() => setStep('select-patient')}>
                                Back
                            </Button>
                        </div>
                    </div>
                );

            case 'select-doctor':
                return (
                    <div className="space-y-4">
                        <Label>Select Doctor</Label>
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
                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setStep('select-patient')}>
                                Back
                            </Button>
                            <Button
                                disabled={!selectedDoctor}
                                onClick={() => setStep('select-slot')}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                );

            case 'select-slot':
                return (
                    <div className="space-y-4 ">
                        <Label>Select Date</Label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                                <input
                                    type="date"
                                    value={selectedDate.toISOString().split('T')[0]}
                                    onChange={(e) => setSelectedDate(new Date(e.target.value))}
                                    className="border rounded px-10 py-2 w-full"
                                />
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex justify-center py-6">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                            </div>
                        ) : (
                            <>
                                {
                                    availableSlots.length === 0 ? (
                                        <div className=" bg-gray-50/30 border-1 p-4 rounded-sm text-center">
                                            <p className="text-red-500">No available slots for the selected date. Please choose another date.</p>
                                        </div>
                                    ) :
                                        <>
                                            <Label>Select Slot</Label>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 h-64 overflow-y-auto mb-4">
                                                {availableSlots.map((slot, index) => (
                                                    <Button
                                                        key={index}
                                                        variant={selectedSlot === slot ? 'default' : 'outline'}
                                                        onClick={() => setSelectedSlot(slot)}
                                                        disabled={!slot.isAvailable}
                                                        className="h-auto py-3"
                                                    >
                                                        <div className="text-sm">
                                                            {slot.start} - {slot.end}
                                                            {!slot.isAvailable && <span className="ml-1 text-red-500">Unavailable</span>}
                                                        </div>
                                                    </Button>
                                                ))}
                                            </div>
                                        </>
                                }
                            </>
                        )}

                        <Label>Notes (optional)</Label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="border rounded p-2 w-full min-h-[100px]"
                            placeholder="Enter any additional notes for the appointment"
                        />

                        <div className="flex gap-2">
                            <Button variant="ghost" onClick={() => setStep('select-doctor')}>
                                Back
                            </Button>
                            <Button
                                disabled={!selectedSlot || !selectedSlot.isAvailable}
                                onClick={handleBookAppointment}
                            >
                                {loading ? 'Booking...' : 'Book Appointment'}
                            </Button>
                        </div>
                    </div>
                );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="min-w-[600px] ">
                <DialogHeader>
                    <DialogTitle>Book New Appointment</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                    {renderStep()}
                </div>
            </DialogContent>
        </Dialog>
    );
}