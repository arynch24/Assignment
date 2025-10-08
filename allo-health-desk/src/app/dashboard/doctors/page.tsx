'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Plus, Edit, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import DoctorList from '@/components/doctors/DoctorList';
import AddDoctorModal from '@/components/doctors/AddDoctorModal';
import DoctorFilters from '@/components/doctors/DoctorFilter';
import { Doctor } from '@/types/doctor';
import { doctorApi } from '@/lib/api/doctorApi';

export default function DoctorsPage() {
    const { user, isLoading: authLoading } = useAuth();
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await doctorApi.getAllDoctors();
            setDoctors(data);
        } catch (err) {
            toast.error('Failed to load doctors');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchDoctors();
        }
    }, [authLoading]);

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this doctor?')) {
            try {
                await doctorApi.deleteDoctor(id);
                setDoctors(doctors.filter(d => d.id !== id));
                toast.success('Doctor deleted successfully');
            } catch (err) {
                toast.error('Failed to delete doctor');
            }
        }
    };

    if (authLoading || loading) {
        return <div className="flex justify-center py-10">Loading...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Doctor Management</h1>
                    <p className="text-gray-500">Manage doctor profiles and availability</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    <Plus className="mr-2 h-4 w-4" /> Add Doctor
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <Search className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{doctors.length}</p>
                            <p className="text-sm text-gray-500">Total Doctors</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            {/* <p className="text-2xl font-bold">
              {doctors.filter(d => d.schedule?.some(s => s.isWorking)).length}
              </p> */}
                            <p className="text-sm text-gray-500">Available Today</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Edit className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">
                                {new Set(doctors.map(d => d.specialization)).size}
                            </p>
                            <p className="text-sm text-gray-500">Specializations</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <DoctorFilters doctors={doctors} onFilterChange={setDoctors} />

            <DoctorList
                doctors={doctors}
                onDelete={handleDelete}
                onEdit={(doctor) => {
                    // Open modal with pre-filled data
                    // We'll handle this in AddDoctorModal
                }}
            />

            <AddDoctorModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddSuccess={(newDoctor) => {
                    setDoctors([...doctors, newDoctor]);
                    toast.success('Doctor added successfully');
                }}
            />
        </div>
    );
}