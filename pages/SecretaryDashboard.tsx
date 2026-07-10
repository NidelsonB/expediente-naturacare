import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '../types';

interface SecretaryDashboardProps {
  patients: Patient[];
}

function SecretaryDashboard({ patients }: SecretaryDashboardProps) {
  const todayPatients = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

    return [...patients]
      .filter((patient) => {
        const createdAt = new Date(patient.createdAt);
        return createdAt >= startOfDay && createdAt < endOfDay;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [patients]);

  const formatTime = (isoString: string) => {
    return new Intl.DateTimeFormat('es-SV', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(isoString));
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-16">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Pacientes de Hoy</h1>
          <p className="text-slate-500 text-lg font-medium">Panel de Secretaría</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center px-6 py-4 bg-white border border-slate-200 text-slate-700 font-black rounded-2xl hover:bg-slate-50 transition-all"
          >
            Dashboard
          </Link>
          <Link
            to="/secretary"
            className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-100 active:scale-95"
          >
            + Nuevo Registro
          </Link>
        </div>
      </div>

      {todayPatients.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-slate-200">
          <p className="text-slate-400 text-xl font-bold italic">No hay pacientes registrados hoy.</p>
          <Link
            to="/secretary"
            className="text-emerald-600 hover:text-emerald-700 font-black mt-4 inline-block underline underline-offset-8"
          >
            Registrar nuevo paciente
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Nombre</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">DUI</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Edad</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Dirección</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Sucursal</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Hora</th>
                  <th className="text-left px-6 py-4 text-xs font-black text-slate-500 uppercase tracking-widest">Estado</th>
                </tr>
              </thead>
              <tbody>
                {todayPatients.map((patient) => (
                  <tr key={patient.id} className="border-b border-slate-100 hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 text-slate-800 font-black">{patient.name}</td>
                    <td className="px-6 py-4 text-slate-600 font-semibold">{patient.dui || 'No aplica'}</td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{patient.age}</td>
                    <td className="px-6 py-4 text-slate-600 font-medium">{patient.address}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 text-[10px] font-black rounded-full uppercase border tracking-wider ${patient.branch === 'San Miguel' ? 'bg-sky-50 text-sky-700 border-sky-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
                        {patient.branch || 'San Marcos'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-700 font-semibold">{formatTime(patient.createdAt)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 bg-amber-50 text-amber-700 text-[10px] font-black rounded-full uppercase border border-amber-200 tracking-wider">
                        Pendiente de doctor
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecretaryDashboard;
