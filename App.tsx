
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { db } from './store';
import { AppState, User, Patient, Visit } from './types';

// Pages
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import NewPatient from './pages/NewPatient';
import PatientDetail from './pages/PatientDetail';

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
              <p className="text-sm font-bold text-slate-900">Dr. {user.name}</p>
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
          &copy; {new Date().getFullYear()} NaturaCare - Dr. Selvin Lopez. Sistema de Gestión Médica.
        </div>
      </footer>
    </div>
  );
};

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(db.get());

  useEffect(() => {
    db.save(state);
  }, [state]);

  const handleLogin = (user: User) => {
    setState(prev => ({ ...prev, user }));
  };

  const handleLogout = () => {
    setState(prev => ({ ...prev, user: null }));
  };

  const addPatientWithFirstVisit = (patientData: Omit<Patient, 'id' | 'createdAt'>, visitData: Omit<Visit, 'id' | 'patientId' | 'date' | 'createdAt'>) => {
    const patientId = crypto.randomUUID();
    const now = new Date().toISOString();
    
    const newPatient: Patient = {
      ...patientData,
      id: patientId,
      createdAt: now
    };

    const firstVisit: Visit = {
      ...visitData,
      id: crypto.randomUUID(),
      patientId: patientId,
      date: now,
      createdAt: now
    };

    setState(prev => ({
      ...prev,
      patients: [...prev.patients, newPatient],
      visits: [...prev.visits, firstVisit]
    }));
    
    return patientId;
  };

  const addVisit = (visit: Omit<Visit, 'id' | 'date' | 'createdAt'>) => {
    const newVisit: Visit = {
      ...visit,
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    setState(prev => ({
      ...prev,
      visits: [...prev.visits, newVisit]
    }));
  };

  const isDuiUnique = (dui: string) => {
    if (!dui || !dui.trim()) return true;
    return !state.patients.some(p => p.dui === dui.trim());
  };

  return (
    <HashRouter>
      <Layout user={state.user} onLogout={handleLogout}>
        <Routes>
          <Route 
            path="/login" 
            element={state.user ? <Navigate to="/" /> : <LoginPage onLogin={handleLogin} />} 
          />
          <Route 
            path="/" 
            element={state.user ? <Dashboard patients={state.patients} visits={state.visits} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/patients/new" 
            element={state.user ? <NewPatient addPatientWithFirstVisit={addPatientWithFirstVisit} isDuiUnique={isDuiUnique} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/patients/:id" 
            element={state.user ? <PatientDetail patients={state.patients} visits={state.visits} addVisit={addVisit} doctorName={state.user?.name || ''} /> : <Navigate to="/login" />} 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
};

export default App;
