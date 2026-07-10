import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../store';
import type { PatientWithLastVisit, PaginatedPatients } from '../types';

const slugify = (name: string) =>
  name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const ITEMS_PER_PAGE = 10;

const EMPTY_RESULT: PaginatedPatients = { patients: [], total: 0, page: 1, limit: ITEMS_PER_PAGE };

function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [searchMode, setSearchMode] = useState<'name' | 'dui'>('name');
  const [currentPage, setCurrentPage] = useState(1);
  const [result, setResult] = useState<PaginatedPatients>(EMPTY_RESULT);
  const [loading, setLoading] = useState(true);

  // Debounce search input 300ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Fetch whenever search/mode/page changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLoading(true);
    db.searchPatients({ search: debouncedSearch, mode: searchMode, page: currentPage, limit: ITEMS_PER_PAGE })
      .then(setResult)
      .catch(() => setResult(EMPTY_RESULT))
      .finally(() => setLoading(false));
  }, [debouncedSearch, searchMode, currentPage]);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const handleModeChange = (mode: 'name' | 'dui') => {
    setSearchMode(mode);
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(result.total / ITEMS_PER_PAGE);

  const formatDateShort = (isoString: string) =>
    new Intl.DateTimeFormat('es-SV', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(isoString));

  // Smart page window: always show first, last, and Â±2 around current
  const pageNumbers = (): (number | '...')[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (currentPage > 4) pages.push('...');
    for (let i = Math.max(2, currentPage - 2); i <= Math.min(totalPages - 1, currentPage + 2); i++) pages.push(i);
    if (currentPage < totalPages - 3) pages.push('...');
    pages.push(totalPages);
    return pages;
  };

  const PatientCard = ({ patient }: { patient: PatientWithLastVisit }) => (
    <Link
      to={`/patients/${slugify(patient.name)}/${patient.id}`}
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
            <span className={`px-3 py-1 text-[10px] font-black rounded-full uppercase border tracking-wider ${patient.branch === 'San Miguel' ? 'bg-sky-50 text-sky-700 border-sky-100' : 'bg-emerald-50 text-emerald-700 border-emerald-100'}`}>
              {patient.branch || 'San Marcos'}
            </span>
          </div>
          <div className="flex flex-col space-y-1 text-slate-500 font-medium">
            <p className="text-sm">{patient.gender} &bull; <span className="font-bold text-slate-700">{patient.age} años</span></p>
            <p className="text-xs flex items-center italic text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              {patient.address || 'Dirección no registrada'}
            </p>
          </div>
        </div>

        <div className="flex-1 md:max-w-md bg-slate-50 rounded-2xl p-4 border border-slate-100 group-hover:bg-emerald-50/30 group-hover:border-emerald-100 transition-colors">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Resumen Médico</h4>
            {patient.lastVisit && (
              <span className="text-[10px] font-black text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-200">
                {formatDateShort(patient.lastVisit.date)}
              </span>
            )}
          </div>
          {patient.lastVisit ? (
            <div className="space-y-1">
              <p className="text-xs text-slate-600 line-clamp-1"><span className="font-bold text-emerald-800">Tratamiento:</span> {patient.lastVisit.treatment}</p>
              <p className="text-xs text-slate-600 line-clamp-1"><span className="font-bold text-emerald-800">Receta:</span> {patient.lastVisit.medications}</p>
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

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Expedientes</h1>
          <p className="text-slate-500 text-lg font-medium">Buscador NaturaCare v1.0</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link to="/secretary" className="inline-flex items-center px-6 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all">
            Registro Secretaría
          </Link>
          <Link to="/patients/new" className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95 text-lg">
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
            <button onClick={() => handleModeChange('name')} className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${searchMode === 'name' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              Nombre
            </button>
            <button onClick={() => handleModeChange('dui')} className={`px-8 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${searchMode === 'dui' ? 'bg-white text-emerald-700 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}>
              DUI
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-10 pb-10">
        <div>
          <h2 className="text-xs font-black text-emerald-600 uppercase tracking-[0.2em] mb-6 flex items-center">
            {debouncedSearch ? 'Resultados de Búsqueda' : 'Pacientes Recientes'}
            <div className="ml-3 h-1 flex-1 bg-emerald-50 rounded-full"></div>
            <span className="ml-3 px-3 py-1 bg-slate-100 text-slate-600 rounded-full font-black text-xs">
              Total: {result.total}
            </span>
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 gap-5">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="bg-white border border-slate-100 p-6 rounded-3xl animate-pulse">
                  <div className="flex gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="h-6 bg-slate-100 rounded-xl w-1/3"></div>
                      <div className="h-4 bg-slate-100 rounded-xl w-1/4"></div>
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-4 space-y-2">
                      <div className="h-3 bg-slate-100 rounded w-3/4"></div>
                      <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : result.patients.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5">
                {result.patients.map(patient => (
                  <PatientCard key={patient.id} patient={patient} />
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8 flex-wrap">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="px-6 py-3 bg-white border-2 border-slate-200 rounded-xl font-black text-sm uppercase tracking-widest text-slate-700 hover:bg-slate-50 hover:border-emerald-300 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    ← Anterior
                  </button>

                  {pageNumbers().map((page, i) =>
                    page === '...' ? (
                      <span key={`ellipsis-${i}`} className="w-10 text-center text-slate-400 font-black">…</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-12 h-12 rounded-xl font-black text-sm transition-all ${currentPage === page ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-2 border-slate-200 text-slate-600 hover:border-emerald-300 hover:bg-slate-50'}`}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
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
              {debouncedSearch
                ? <p className="text-slate-400 text-lg font-bold italic">No se encontraron coincidencias.</p>
                : <>
                    <p className="text-slate-400 text-xl font-bold italic">Base de datos vacía.</p>
                    <Link to="/patients/new" className="text-emerald-600 hover:text-emerald-700 font-black mt-4 inline-block underline underline-offset-8">Registrar el primer paciente</Link>
                  </>
              }
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
