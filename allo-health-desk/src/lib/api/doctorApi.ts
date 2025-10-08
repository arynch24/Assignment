import axios from '../../lib/axios';
import { Doctor, DoctorWithSchedule, Schedule, Break } from '../../types/doctor';

export const doctorApi = {
    getAllDoctors: async (): Promise<Doctor[]> => {
        const res = await axios.get('/doctor');
        return res.data;
    },

    addDoctor: async (doctorData: Omit<DoctorWithSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> => {
        const res = await axios.post('/doctor', doctorData);
        return res.data;
    },

    updateDoctor: async (id: string, doctorData: Partial<Doctor>): Promise<Doctor> => {
        const res = await axios.patch(`/doctor/${id}`, doctorData);
        return res.data;
    },

    deleteDoctor: async (id: string): Promise<void> => {
        await axios.delete(`/doctor/${id}`);
    },

    getSchedulesWithBreaks: async (id: string): Promise<{ schedules: Schedule[]; breaks: Break[] }> => {
        const res = await axios.get(`/doctor/${id}/schedulewithbreaks`);
        const [schedules, breaks] = res.data;
        return { schedules, breaks };
    },

    updateSchedules: async (id: string, schedules: Schedule[]): Promise<void> => {
        await axios.patch(`/doctor/${id}/schedule`, schedules);
    },

    updateBreaks: async (id: string, breaks: Break[]): Promise<void> => {
        await axios.patch(`/doctor/${id}/breaks`, breaks);
    },

    getDoctorAvailability: async (id: string, date: string) => {
        const res = await axios.get(`/doctor/${id}/availability`, {
            params: { date },
        });
        return res.data;
    },
};