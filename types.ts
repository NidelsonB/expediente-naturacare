
export enum Gender {
  MASCULINO = 'Masculino',
  FEMENINO = 'Femenino',
  OTRO = 'Otro'
}

export interface Visit {
  id: string;
  patientId: string;
  date: string; // ISO String
  notes: string[];
  treatment: string;
  medications: string;
  createdAt: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: Gender;
  age: number;
  dui?: string; // Optional
  address: string;
  chronicIllness: string; // New field for Diabetic, Hypertensive, etc.
  medicalHistory: string;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AppState {
  user: User | null;
  patients: Patient[];
  visits: Visit[];
}
