import { Appointment, CreateAppointmentDto, UpdateAppointmentDto } from '@/types/appointment';
import axios from '../axios';

export const appointmentApi = {
    getAllAppointments: async (date?: string): Promise<Appointment[]> => {
        const res = await axios.get('/appointment', {
            params: { date },
        });
        return res.data;
    },

    createAppointment: async (data: CreateAppointmentDto): Promise<Appointment> => {
        const res = await axios.post('/appointment', data);
        return res.data;
    },

    updateAppointment: async (id: string, data: UpdateAppointmentDto): Promise<Appointment> => {
        const res = await axios.patch(`/appointment/${id}`, data);
        return res.data;
    },

    deleteAppointment: async (id: string): Promise<void> => {
        await axios.delete(`/appointment/${id}`);
    },
};