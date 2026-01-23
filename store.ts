
import { Patient, Visit, User, AppState, Gender } from './types';

const STORAGE_KEY = 'medical_records_data_v1';

const INITIAL_STATE: AppState = {
  user: null,
  patients: [],
  visits: [],
};

export const db = {
  get: (): AppState => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : INITIAL_STATE;
  },
  save: (state: AppState) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
  }
};

// Seed initial user if not exists
const checkSeed = () => {
  const state = db.get();
  // For demo, we don't seed the active user, just ensure we have a structure.
  db.save(state);
};
checkSeed();
