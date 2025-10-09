'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Calendar as CalendarIcon } from 'lucide-react';
import { toast } from 'sonner';
import QueueFilters from '@/components/queue/QueueFilters';
import DoctorQueueCard from '@/components/queue/DoctorQueueCard';
import AddToQueueModal from '@/components/queue/AddToQueueModal';
import { queueApi } from '@/lib/api/queueApi';
import { QueueResponse } from '@/types/queue';
import Loader from '@/components/Loader';

export default function QueuePage() {
    const { user, isLoading: authLoading } = useAuth();
    const [queues, setQueues] = useState<QueueResponse>({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchQueues = async () => {
        try {
            setLoading(true);
            const dateStr = selectedDate.toLocaleDateString('en-CA');
            const data = await queueApi.getQueuesByDate(dateStr);
            setQueues(data);
        } catch (err) {
            toast.error('Failed to load queues');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!authLoading) {
            fetchQueues();
        }
    }, [authLoading, selectedDate]);

    // Compute stats
    const totalInQueue = Object.values(queues).reduce((sum, q) => sum + q.queues.length, 0);
    const waitingCount = Object.values(queues).reduce((sum, q) =>
        sum + q.queues.filter(item => item.status === 'WAITING').length, 0
    );
    const withDoctorCount = Object.values(queues).reduce((sum, q) =>
        sum + q.queues.filter(item => item.status === 'WITH_DOCTOR').length, 0
    );
    const completedCount = Object.values(queues).reduce((sum, q) =>
        sum + q.queues.filter(item => item.status === 'COMPLETED').length, 0
    );

    const handleAddSuccess = (newQueueItem: any) => {
        setQueues(prev => {
            const doctorId = newQueueItem.doctorId;
            const updated = { ...prev };

            if (!updated[doctorId]) {
                updated[doctorId] = {
                    doctor: newQueueItem.doctor,
                    waitingCount: 0,
                    queues: [],
                };
            }

            // Create a new doctor queue object with updated values
            updated[doctorId] = {
                ...updated[doctorId],
                queues: [...updated[doctorId].queues, newQueueItem],
                waitingCount: updated[doctorId].waitingCount + 1,
            };

            return updated;
        });
    };

    const handleUpdateQueueStatus = async (
        queueId: string,
        newStatus: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED',
        doctorId: string
    ) => {
        try {
            // 1. Call API → get FULL updated queue item with queueCount
            const updatedQueueItem = await queueApi.updateQueueStatus(queueId, newStatus);

            // 2. Update local state
            setQueues(prev => {
                const updated = { ...prev };
                const doctorQueue = updated[doctorId];

                if (doctorQueue) {
                    // Find and replace the queue item
                    const queueIndex = doctorQueue.queues.findIndex(q => q.id === queueId);
                    if (queueIndex !== -1) {
                        doctorQueue.queues[queueIndex] = updatedQueueItem;
                    }

                    // ✅ Use queueCount from API response!
                    doctorQueue.waitingCount = updatedQueueItem.queueCount;
                }

                return updated;
            });

            toast.success('Queue status updated');
        } catch (err: any) {
            toast.error('Failed to update queue status');
        }
    };

    if (authLoading || loading) {
        return <Loader text="Loading queues..." />;
    }

    return (
        <div className="container mx-auto px-4 py-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Queue Management</h1>
                    <p className="text-gray-500">Manage walk-in patients and track queue status</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="bg-purple-600 hover:bg-purple-700">
                    + Add to Queue
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-purple-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{totalInQueue}</p>
                            <p className="text-sm text-gray-500">Total in Queue</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{waitingCount}</p>
                            <p className="text-sm text-gray-500">Waiting</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{withDoctorCount}</p>
                            <p className="text-sm text-gray-500">With Doctor</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className='flex items-center gap-4'>
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <CalendarIcon className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{completedCount}</p>
                            <p className="text-sm text-gray-500">Completed Today</p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <QueueFilters
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
            />

            <div className="space-y-6">
                {Object.entries(queues).map(([doctorId, doctorQueue]) => (
                    <DoctorQueueCard
                        key={doctorId}
                        doctorQueue={doctorQueue}
                        searchTerm={searchTerm}
                        onUpdateStatus={(queueId, newStatus) =>
                            handleUpdateQueueStatus(queueId, newStatus, doctorId)
                        }
                    />
                ))}
            </div>

            <AddToQueueModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddSuccess={handleAddSuccess}
            />
        </div>
    );
}