import axios from '../axios';
import { Patient } from '@/types/patient';

export const patientApi = {
    getAllPatients: async (): Promise<Patient[]> => {
        const res = await axios.get('/patient');
        return res.data;
    },

    createPatient: async (data: any): Promise<Patient> => {
        const res = await axios.post('/patient', data);
        return res.data;
    },
};