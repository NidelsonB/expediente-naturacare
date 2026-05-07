
import { Patient, Visit, PaginatedPatients } from './types';
import { api } from './api';

const removeUndefinedFields = <T extends Record<string, any>>(data: T): Partial<T> => {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== undefined)
  ) as Partial<T>;
};

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
    return await api.post<Patient>('patients', removeUndefinedFields({
      ...patient,
      id: crypto.randomUUID(),
      createdAt: now
    }));
  },

  async updatePatient(id: string, patient: Partial<Patient>): Promise<Patient> {
    return await api.put<Patient>('patients', id, removeUndefinedFields(patient));
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
      return await api.getVisitsByPatient(patientId);
    } catch (error) {
      console.error('Error fetching visits by patient:', error);
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
  },

  async searchPatients(params: {
    search?: string;
    mode?: 'name' | 'dui';
    page?: number;
    limit?: number;
  }): Promise<PaginatedPatients> {
    return api.searchPatients(params);
  },

  async isDuiUnique(dui: string, excludeId?: string): Promise<boolean> {
    if (!dui?.trim()) return true;
    const query = new URLSearchParams({ dui: dui.trim() });
    if (excludeId) query.set('excludeId', excludeId);
    const API_URL = import.meta.env.MODE === 'production' ? '/api' : 'http://localhost:3001/api';
    const res = await fetch(`${API_URL}/patients/check-dui?${query}`);
    const data = await res.json() as { unique: boolean };
    return data.unique;
  }
};
