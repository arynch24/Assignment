import axios from '../axios';
import { CreateQueueDto, QueueItem, QueueResponse, UpdatedQueueItem } from '../../types/queue';

export const queueApi = {
    getQueuesByDate: async (date: string): Promise<QueueResponse> => {
        const res = await axios.get('/queue', {
            params: { date },
        });
        return res.data;
    },

    // Update this method
    updateQueueStatus: async (
        queueId: string,
        status: 'WAITING' | 'WITH_DOCTOR' | 'COMPLETED'
    ): Promise<UpdatedQueueItem> => {
        const res = await axios.patch(`/queue/${queueId}/status`, { status });
        return res.data; // Returns full updated queue item with queueCount
    },

    addToQueue: async (data: CreateQueueDto): Promise<QueueItem> => {
        const res = await axios.post('/queue/walk-in', data);
        return res.data;
    },
};