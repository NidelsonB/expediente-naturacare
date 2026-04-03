
import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { BRANDING } from '../branding';
import { Patient, Visit } from '../types';

interface DashboardProps {
  patients: Patient[];
  visits: Visit[];
}

const Dashboard: React.FC<DashboardProps> = ({ patients, visits }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'dui'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const filteredPatients = useMemo(() => {
    if (!searchTerm) return [];
    
    const term = searchTerm.toLowerCase();
    return patients.filter(p => {
      if (searchMode === 'name') {
        return p.name.toLowerCase().includes(term);
      } else {
        return p.dui?.includes(searchTerm);
      }
    });
  }, [patients, searchTerm, searchMode]);

  const recentPatients = useMemo(() => {
    return [...patients]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [patients]);

  // Pagination logic
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return recentPatients.slice(startIndex, endIndex);
  }, [recentPatients, currentPage]);

  const totalPages = Math.ceil(recentPatients.length / ITEMS_PER_PAGE);

  // Reset to page 1 when search term changes
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const getLastVisit = (patientId: string) => {
    const patientVisits = visits
      .filter(v => v.patientId === patientId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return patientVisits[0] || null;
  };

  const formatDateShort = (isoString: string) => {
    return new Intl.DateTimeFormat('es-SV', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(isoString));
  };

  const PatientCard: React.FC<{ patient: Patient }> = ({ patient }) => {
    const lastVisit = getLastVisit(patient.id);
    return (
      <Link 
        to={`/patients/${patient.id}`}
        className="block bg-white border border-slate-200 p-6 rounded-3xl hover:border-emerald-400 hover:shadow-xl hover:shadow-emerald-50/50 transition-all group"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-2xl font-black text-slate-800 group-hover:text-emerald-700 transition-colors">
                {patient.name}
              </h3>
              {patient.chronicIllness && (
                <span className="px-3 py-1 bg-rose-50 text-rose-700 text-[10px] font-black rounded-full uppercase border border-rose-100 tracking-wider">
                  {patient.chronicIllness}
                </span>
              )}
              <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-widest border ${patient.dui ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                DUI: {patient.dui || 'No aplica'}
              </span>
            </div>
            <div className="flex flex-col space-y-1 text-slate-500 font-medium">
              <p className="text-sm">{patient.gender} • <span className="font-bold text-slate-700">{patient.age} años</span></p>
              <p className="text-xs flex items-center italic text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
                {patient.address || "Dirección no registrada"}
              </p>
            </div>
          </div>
          
          <div className="flex-1 md:max-w-md bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:bg-emerald-50/30 group-hover:border-emerald-100 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Resumen Médico</h4>
              {lastVisit && (
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                  {formatDateShort(lastVisit.date)}
                </span>
              )}
            </div>
            {lastVisit ? (
              <div className="space-y-1">
                <p className="text-xs text-slate-600 line-clamp-1"><span className="font-bold text-emerald-800">Tratamiento:</span> {lastVisit.treatment}</p>
                <p className="text-xs text-slate-600 line-clamp-1"><span className="font-bold text-emerald-800">Receta:</span> {lastVisit.medications}</p>
              </div>
            ) : (
              <p className="text-xs italic text-slate-400">Sin consultas registradas.</p>
            )}
          </div>

          <div className="hidden md:block">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm group-hover:shadow-emerald-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </div>
        </div>
      </Link>
    );
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expedientes</h1>
          <p className="text-slate-500 text-lg font-medium">{BRANDING.appSubtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/secretary"
            className="inline-flex items-center px-6 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all"
          >
            Registro Secretaría
          </Link>
          <Link 
            to="/patients/new"
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 text-lg"
          >
            <span className="mr-2 text-2xl">+</span> Nuevo Paciente
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder={searchMode === 'name' ? 'Buscar por nombre completo...' : 'Buscar por número de DUI...'}
              className="w-full pl-14 pr-4 py-5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-xl font-medium outline-none"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
          <div className="flex bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <button
              onClick={() => setSearchMode('name')}
              className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${searchMode === 'name' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Nombre
            </button>
            <button
              onClick={() => setSearchMode('dui')}
              className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${searchMode === 'dui' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
            >
              DUI
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-10">
        {searchTerm ? (
          <div>
            <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center">
              Resultados de Búsqueda
              <span className="ml-3 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full font-black">
                {filteredPatients.length}
              </span>
            </h2>
            {filteredPatients.length > 0 ? (
              <div className="grid grid-cols-1 gap-5">
                {filteredPatients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-lg font-bold italic">No se encontraron coincidencias.</p>
              </div>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center">
              Pacientes Recientes
              <div className="ml-3 h-1 flex-1 bg-emerald-50 rounded-full"></div>
              <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black text-xs">
                Total: {recentPatients.length}
              </span>
            </h2>
            {recentPatients.length > 0 ? (
              <>
                <div className="grid grid-cols-1 gap-5">
                  {paginatedPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))}
                </div>
                
                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-3 mt-8">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      ← Anterior
                    </button>
                    
                    <div className="flex items-center gap-2">
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${
                            currentPage === page
                              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200'
                              : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50'
                          }`}
                        >
                          {page}
                        </button>
                      ))}
                    </div>
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                    >
                      Siguiente →
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                <p className="text-slate-400 text-xl font-bold italic">Base de datos vacía.</p>
                <Link to="/patients/new" className="text-emerald-600 hover:text-emerald-700 font-black mt-4 inline-block underline underline-offset-8">Registrar el primer paciente</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
