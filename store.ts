
import { Patient, Visit } from './types';
import { api } from './api';

// API-based database operations
export const db = {
  // Patients
  async getPatients(): Promise<Patient[]> {
    try {
      return await api.get<Patient[]>('patients');
    } catch (error) {
      console.error('Error fetching patients:', error);
      return [];
    }
  },

  async getPatient(id: string): Promise<Patient | null> {
    try {
      const patients = await api.get<Patient[]>('patients', id);
      return patients[0] || null;
    } catch (error) {
      console.error('Error fetching patient:', error);
      return null;
    }
  },

  async createPatient(patient: Omit<Patient, 'id' | 'createdAt'>): Promise<Patient> {
    const now = new Date().toISOString();
    return await api.post<Patient>('patients', {
      ...patient,
      id: crypto.randomUUID(),
      createdAt: now
    });
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return await api.put<Patient>('patients', id, patient);
  },

  async deletePatient(id: string): Promise<void> {
    await api.delete('patients', id);
  },

  // Visits
  async getVisits(): Promise<Visit[]> {
    try {
      return await api.get<Visit[]>('visits');
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  },

  async getVisitsByPatient(patientId: string): Promise<Visit[]> {
    try {
      const visits = await api.get<Visit[]>('visits');
      return visits.filter(v => v.patientId === patientId);
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  },

  async createVisit(visit: Omit<Visit, 'id' | 'date' | 'createdAt'>): Promise<Visit> {
    const now = new Date().toISOString();
    return await api.post<Visit>('visits', {
      ...visit,
      id: crypto.randomUUID(),
      date: now,
      createdAt: now
    });
  },

  async updateVisit(id: string, visit: Partial<Visit>): Promise<Visit> {
    return await api.put<Visit>('visits', id, visit);
  },

  async deleteVisit(id: string): Promise<void> {
    await api.delete('visits', id);
  },

  // Health check
  async healthCheck() {
    return await api.healthCheck();
  }
};
