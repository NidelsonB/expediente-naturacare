
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { db } from './store';
import { User, Patient, Visit } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewPatient from './pages/NewPatient';
import PatientDetail from './pages/PatientDetail';
import SecretaryForm from './pages/SecretaryForm';
import SecretaryDashboard from './pages/SecretaryDashboard';

const Layout: React.FC<{ children: React.ReactNode, user: User | null, onLogout: () => void }> = ({ children, user, onLogout }) => {
  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 print:bg-white">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-bold group-hover:bg-emerald-700 transition-colors">
              N
            </div>
            <span className="font-extrabold text-slate-800 text-xl tracking-tight">NaturaCare</span>
          </Link>
          <div className="flex items-center space-x-6">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-bold text-slate-900">ND. {user.name}</p>
              <p className="text-xs text-emerald-600 font-semibold uppercase tracking-widest">NaturaCare</p>
            </div>
            <button 
              onClick={onLogout}
              className="text-sm font-semibold text-slate-500 hover:text-red-600 transition-colors px-3 py-1 border border-slate-200 hover:border-red-100 rounded-md bg-white hover:bg-red-50"
            >
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8 print:p-0 print:max-w-none">
        {children}
      </main>
      <footer className="bg-white border-t border-slate-200 py-6 mt-auto print:hidden">
        <div className="max-w-6xl mx-auto px-4 text-center text-slate-400 text-sm font-medium">
          &copy; {new Date().getFullYear()} NaturaCare - ND. Selvin Lopez. Sistema de Gestión Médica.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('naturacare_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [patients, setPatients] = useState<Patient[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from API
  useEffect(() => {
    if (user) {
      loadData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [patientsData, visitsData] = await Promise.all([
        db.getPatients(),
        db.getVisits()
      ]);
      setPatients(patientsData);
      setVisits(visitsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('naturacare_user', JSON.stringify(newUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('naturacare_user');
  };

  const addPatientWithFirstVisit = async (
    patientData: Omit<Patient, 'id' | 'createdAt'>, 
    visitData: Omit<Visit, 'id' | 'patientId' | 'date' | 'createdAt'>
  ): Promise<string> => {
    try {
      const newPatient = await db.createPatient(patientData);
      const firstVisit = await db.createVisit({
        ...visitData,
        patientId: newPatient.id
      });
      
      setPatients(prev => [...prev, newPatient]);
      setVisits(prev => [...prev, firstVisit]);
      
      return newPatient.id;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  };

  const addPatientOnly = async (patientData: Omit<Patient, 'id' | 'createdAt'>): Promise<string> => {
    try {
      const newPatient = await db.createPatient(patientData);
      setPatients(prev => [...prev, newPatient]);
      return newPatient.id;
    } catch (error) {
      console.error('Error creating patient without first visit:', error);
      throw error;
    }
  };

  const addVisit = async (visit: Omit<Visit, 'id' | 'date' | 'createdAt'>) => {
    try {
      const newVisit = await db.createVisit(visit);
      setVisits(prev => [...prev, newVisit]);
    } catch (error) {
      console.error('Error creating visit:', error);
      throw error;
    }
  };

  const updatePatient = async (patientId: string, updates: Partial<Patient>) => {
    try {
      const updatedPatient = await db.updatePatient(patientId, updates);
      setPatients(prev => prev.map(patient => patient.id === patientId ? updatedPatient : patient));
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

    const updateVisit = async (visitId: string, updates: Partial<Visit>) => {
      try {
        const updatedVisit = await db.updateVisit(visitId, updates);
        setVisits(prev => prev.map(visit => visit.id === visitId ? updatedVisit : visit));
      } catch (error) {
        console.error('Error updating visit:', error);
        throw error;
      }
    };

  const isDuiUnique = (dui: string) => {
    if (!dui || !dui.trim()) return true;
    return !patients.some(p => p.dui === dui.trim());
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 font-bold text-lg">Cargando datos de PostgreSQL...</p>
        </div>
      </div>
    );
  }

  return (
    <HashRouter>
      <Layout user={user} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={user ? <Dashboard patients={patients} visits={visits} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/patients/new" 
            element={user ? <NewPatient addPatientWithFirstVisit={addPatientWithFirstVisit} isDuiUnique={isDuiUnique} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/patients/:id" 
              element={user ? <PatientDetail patients={patients} visits={visits} addVisit={addVisit} updatePatient={updatePatient} updateVisit={updateVisit} doctorName={user?.name || ''} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/secretary" 
            element={user ? <SecretaryForm addPatientOnly={addPatientOnly} isDuiUnique={isDuiUnique} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/secretary/today" 
            element={user ? <SecretaryDashboard patients={patients} /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
