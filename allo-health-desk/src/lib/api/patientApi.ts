import axios from '../axios';
import { Patient, CreatePatientDto } from '@/types/patient';

export const patientApi = {
    getAllPatients: async (): Promise<Patient[]> => {
        const res = await axios.get('/patient');
        return res.data;
    },

    createPatient: async (data: CreatePatientDto): Promise<Patient> => {
        const res = await axios.post('/patient', data);
        return res.data;
    },
};