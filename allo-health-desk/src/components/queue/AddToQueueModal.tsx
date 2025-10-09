'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { patientApi } from '@/lib/api/patientApi';
import { doctorApi } from '@/lib/api/doctorApi';
import { queueApi } from '@/lib/api/queueApi';
import { Patient } from '@/types/patient';
import { Doctor } from '@/types/doctor';

interface AddToQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddSuccess: (queueItem: any) => void;
}

export default function AddToQueueModal({
  isOpen,
  onClose,
  onAddSuccess,
}: AddToQueueModalProps) {
  const [step, setStep] = useState<'select-patient' | 'add-details' | 'create-patient'>('select-patient');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [priority, setPriority] = useState<'NORMAL' | 'URGENT'>('NORMAL');
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
      setStep('add-details');
      toast.success('Patient created successfully');
    } catch (err) {
      toast.error('Failed to create patient');
    } finally {
      setCreatingPatient(false);
    }
  };

  const handleAddToQueue = async () => {
    if (!selectedPatient || !selectedDoctor) {
      toast.error('Please select patient and doctor');
      return;
    }

    try {
      setLoading(true);
      const newQueueItem = await queueApi.addToQueue({
        patientId: selectedPatient.id,
        doctorId: selectedDoctor.id,
        priority,
        notes,
      });
      onAddSuccess(newQueueItem);
      onClose();
      toast.success('Patient added to queue');
    } catch (error: any) {
      toast.error(error.response.data.message ||'Failed to add patient to queue');
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
              <Button variant="outline" onClick={() => setStep('create-patient')}>
                + Add New Patient
              </Button>
              <Button
                disabled={!selectedPatient}
                onClick={() => setStep('add-details')}
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
        );

      case 'add-details':
        return (
          <div className="space-y-4">
            <Label>Assign Doctor</Label>
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

            <Label>Priority Level</Label>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`normal-${Math.random()}`}
                  name="priority"
                  checked={priority === 'NORMAL'}
                  onChange={() => setPriority('NORMAL')}
                />
                <label htmlFor={`normal-${Math.random()}`}>Normal</label>
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="radio"
                  id={`urgent-${Math.random()}`}
                  name="priority"
                  checked={priority === 'URGENT'}
                  onChange={() => setPriority('URGENT')}
                />
                <label htmlFor={`urgent-${Math.random()}`}>Urgent</label>
              </div>
            </div>
            <div className="text-xs text-gray-500">Mark as urgent for immediate attention</div>

            <Label>Additional Notes (optional)</Label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="border rounded p-2 w-full min-h-[100px]"
              placeholder="Any special requirements or notes..."
            />

            <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setStep('select-patient')}>
                Back
              </Button>
              <Button
                disabled={!selectedDoctor}
                onClick={handleAddToQueue}
              >
                {loading ? 'Adding...' : 'Add to Queue'}
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Patient to Queue</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          {renderStep()}
        </div>
      </DialogContent>
    </Dialog>
  );
}