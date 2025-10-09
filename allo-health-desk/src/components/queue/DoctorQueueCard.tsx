'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DoctorQueueCardProps {
    doctorQueue: any;
    searchTerm: string;
    onUpdateStatus: (queueId: string, newStatus: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED') => void;
}

export default function DoctorQueueCard({
    doctorQueue,
    searchTerm,
    onUpdateStatus,
}: DoctorQueueCardProps) {
    const [isExpanded, setIsExpanded] = useState(false);

    // Filter queues based on search term
    const filteredQueues = doctorQueue.queues.filter((queue: any) =>
        queue.patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        queue.queueNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // If no search term, show all; if search term, only show matching queues
    const shouldShow = searchTerm === '' || filteredQueues.length > 0;

    if (!shouldShow) return null;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WAITING': return 'bg-yellow-100 text-yellow-800';
            case 'WITH_DOCTOR': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'WAITING': return 'WAITING';
            case 'WITH_DOCTOR': return 'WITH DOCTOR';
            case 'COMPLETED': return 'COMPLETED';
            default: return status;
        }
    };

    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex justify-between items-center cursor-pointer" onClick={() => setIsExpanded(!isExpanded)}>
                <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={doctorQueue.doctor.profilePhoto || '/avatar-placeholder.png'} alt={doctorQueue.doctor.name} />
                        <AvatarFallback>{doctorQueue.doctor.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{doctorQueue.doctor.name}</CardTitle>
                        <div className="text-sm text-gray-500">{doctorQueue.doctor.specialization}</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="text-sm">
                        {doctorQueue.waitingCount} in Queue
                    </Badge>
                    {isExpanded ? (
                        <ChevronUp className="h-5 w-5 text-gray-500" />
                    ) : (
                        <ChevronDown className="h-5 w-5 text-gray-500" />
                    )}
                </div>
            </CardHeader>

            {isExpanded && (
                <CardContent className="space-y-4">
                    {filteredQueues.map((queue: any) => (
                        <div key={queue.id} className="border rounded-lg p-4 hover:bg-gray-50">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-medium text-lg text-purple-600">{queue.queueNumber}</div>
                                    <div className="font-medium mt-1">{queue.patient.name}</div>
                                    <div className="text-sm text-gray-500">
                                        {queue.patient.age} yrs • {queue.patient.gender}
                                    </div>
                                    {queue.notes && (
                                        <div className="text-xs text-gray-500 mt-1">Note: {queue.notes}</div>
                                    )}
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <div className='flex gap-2 items-center'>
                                        {queue.priority === 'URGENT' && (
                                            <Badge variant="destructive" className="text-sm rounded-xl">URGENT</Badge>
                                        )}
                                        <Select
                                            value={queue.status}
                                            onValueChange={(newStatus: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED') => {
                                                onUpdateStatus(queue.id, newStatus);
                                            }}
                                            disabled={queue.status === 'COMPLETED'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="WAITING">WAITING</SelectItem>
                                                <SelectItem value="WITH_DOCTOR">WITH DOCTOR</SelectItem>
                                                <SelectItem value="COMPLETED">COMPLETED</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className='flex gap-2 w-fit bg-gray-100 mt-2 px-2 py-1 rounded-full items-center'>
                                        <span className={`px-2 py-1 rounded text-xs font-semibold`}>
                                            {queue.type === 'WALK_IN' ? 'WALK-IN' : 'APPOINTMENT'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-2">
                                Assigned to: {queue.doctor.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                Added: {format(new Date(queue.createdAt), 'hh:mm a')}
                            </div>
                            {queue.startedAt && (
                                <div className="text-xs text-blue-500 mt-1">
                                    In consultation: {format(new Date(queue.startedAt), 'hh:mm a')}
                                </div>
                            )}
                            {queue.completedAt && (
                                <div className="text-xs text-green-500 mt-1">
                                    Completed: {format(new Date(queue.completedAt), 'hh:mm a')}
                                </div>
                            )
                            }
                        </div>
                    ))}
                </CardContent>
            )}
        </Card>
    );
}