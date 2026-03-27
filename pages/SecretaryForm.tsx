import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Gender, Patient } from '../types';

interface SecretaryFormProps {
  addPatientOnly: (patientData: Omit<Patient, 'id' | 'createdAt'>) => Promise<string>;
  isDuiUnique: (dui: string) => boolean;
}

const SecretaryForm: React.FC<SecretaryFormProps> = ({ addPatientOnly, isDuiUnique }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dui: '',
    age: '',
    address: '',
    phone: '',
    gender: Gender.MASCULINO
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setFormData({
      name: '',
      dui: '',
      age: '',
      address: '',
      phone: '',
      gender: Gender.MASCULINO
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const normalizedDui = formData.dui.trim();
    const normalizedName = formData.name.trim();
    const normalizedAddress = formData.address.trim();
    const age = Number(formData.age);

    if (!normalizedName) return setError('El nombre es requerido');
    if (!normalizedAddress) return setError('La dirección es requerida');
    if (!Number.isFinite(age) || age <= 0 || age > 150) return setError('La edad debe estar entre 1 y 150 años');
    if (normalizedDui && !isDuiUnique(normalizedDui)) return setError('Este DUI ya existe');

    setLoading(true);
    try {
      await addPatientOnly({
        name: normalizedName,
        age,
        address: normalizedAddress,
        gender: formData.gender,
        chronicIllness: '',
        medicalHistory: '',
        ...(normalizedDui ? { dui: normalizedDui } : {}),
        ...(formData.phone.trim() ? { phone: formData.phone.trim() } : {})
      });

      resetForm();
      setSuccess('Paciente registrado correctamente. Pendiente de doctor.');
      setTimeout(() => {
        navigate('/secretary/today');
      }, 900);
    } catch (err: any) {
      setError(err?.message || 'Error al registrar paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-16">
      <div className="mb-8">
        <Link to="/" className="text-emerald-600 font-black hover:underline flex items-center mb-2 uppercase text-xs tracking-widest">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
          </svg>
          Regresar al dashboard
        </Link>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Registro Secretaría</h1>
        <p className="text-slate-500 font-medium">Alta administrativa de paciente</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-rose-700 font-black uppercase tracking-wide">Error: {error}</p>
          </div>
        )}

        {success && (
          <div className="bg-emerald-50 border-l-4 border-emerald-500 p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-emerald-700 font-black uppercase tracking-wide">{success}</p>
          </div>
        )}

        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Datos básicos del paciente</h2>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Secretaría</span>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Nombre completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ej: María Elena Rivera"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">DUI (Opcional)</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="00000000-0"
                  value={formData.dui}
                  onChange={(e) => setFormData({ ...formData, dui: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Edad</label>
                <input
                  type="number"
                  required
                  min={1}
                  max={150}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Teléfono (Opcional)</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ej: 7777-8888"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Género</label>
                <select
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-black outline-none appearance-none"
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value as Gender })}
                >
                  <option value={Gender.MASCULINO}>Masculino</option>
                  <option value={Gender.FEMENINO}>Femenino</option>
                  <option value={Gender.OTRO}>Otro</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Dirección</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ciudad, departamento y referencia"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end space-x-8 pt-2">
          <Link to="/secretary/today" className="text-slate-500 font-black uppercase text-sm tracking-widest hover:text-slate-800 transition-colors">Ver pacientes de hoy</Link>
          <button
            type="submit"
            disabled={loading}
            className="px-14 py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 active:scale-95 text-xl tracking-tight disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Guardando...</span>
              </>
            ) : (
              <span>Registrar Paciente</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SecretaryForm;
