import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gender } from '../types';

interface NewPatientProps {
  addPatientWithFirstVisit: (patient: any, visit: any) => Promise<string>;
  isDuiUnique: (dui: string) => boolean;
}

const NewPatient: React.FC<NewPatientProps> = ({ addPatientWithFirstVisit, isDuiUnique }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    dui: '',
    age: '',
    address: '',
    chronicIllness: '',
    gender: Gender.MASCULINO,
    medicalHistory: ''
  });
  
  const [visitNotes, setVisitNotes] = useState<string[]>(['']);
  const [visitTreatment, setVisitTreatment] = useState('');
  const [visitMedications, setVisitMedications] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...visitNotes];
    newNotes[index] = value;
    setVisitNotes(newNotes);
  };

  const handleNoteKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const newNotes = [...visitNotes];
      newNotes.splice(index + 1, 0, '');
      setVisitNotes(newNotes);
      setTimeout(() => {
        const nextInput = document.getElementById(`note-input-${index + 1}`);
        nextInput?.focus();
      }, 0);
    } else if (e.key === 'Backspace' && visitNotes[index] === '' && visitNotes.length > 1) {
      e.preventDefault();
      const newNotes = [...visitNotes];
      newNotes.splice(index, 1);
      setVisitNotes(newNotes);
      setTimeout(() => {
        const prevInput = document.getElementById(`note-input-${index - 1}`);
        prevInput?.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('El nombre es requerido');
    if (!formData.address.trim()) return setError('La dirección es requerida');
    if (formData.dui.trim() && !isDuiUnique(formData.dui)) return setError('Este DUI ya existe');
    if (Number(formData.age) <= 0) return setError('Edad inválida');

    const cleanNotes = visitNotes.filter(n => n.trim() !== '');
    if (cleanNotes.length === 0) return setError('Ingrese el motivo de consulta');

    setLoading(true);
    try {
      const id = await addPatientWithFirstVisit(
        {
          ...formData,
          age: Number(formData.age),
          dui: formData.dui.trim() || undefined
        },
        {
          notes: cleanNotes,
          treatment: visitTreatment,
          medications: visitMedications
        }
      );
      
      navigate(`/patients/${id}`);
    } catch (err: any) {
      setError(err.message || 'Error al guardar el paciente');
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
          Regresar al buscador
        </Link>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight">Nuevo Registro</h1>
        <p className="text-slate-500 font-medium">Expediente Clínico NaturaCare</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm">
            <p className="text-sm text-rose-700 font-black uppercase tracking-wide">Error: {error}</p>
          </div>
        )}

        {/* Section 1: Personal Info */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-200 flex items-center justify-between">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">1. Perfil del Paciente</h2>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Obligatorio</span>
          </div>
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Nombre Completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ej: Juan Antonio Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">DUI (Opcional)</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="00000000-0"
                  value={formData.dui}
                  onChange={(e) => setFormData({...formData, dui: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Edad</label>
                  <input
                    type="number"
                    required
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Género</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-black outline-none appearance-none"
                    value={formData.gender}
                    onChange={(e) => setFormData({...formData, gender: e.target.value as Gender})}
                  >
                    <option value={Gender.MASCULINO}>Masculino</option>
                    <option value={Gender.FEMENINO}>Femenino</option>
                    <option value={Gender.OTRO}>Otro</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Dirección de Domicilio</label>
                <input
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ciudad, departamento y referencia..."
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-rose-600 mb-2 uppercase tracking-widest">Tipo / Enfermedad Crónica</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:bg-white focus:border-rose-500 transition-all text-lg font-bold text-rose-700 outline-none"
                  placeholder="Ej: Diabético tipo II, Hipertenso, etc."
                  value={formData.chronicIllness}
                  onChange={(e) => setFormData({...formData, chronicIllness: e.target.value})}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Otros Antecedentes</label>
                <textarea
                  rows={2}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Cirugías, alergias, hospitalizaciones..."
                  value={formData.medicalHistory}
                  onChange={(e) => setFormData({...formData, medicalHistory: e.target.value})}
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: First Visit */}
        <section className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-8 py-5 border-b border-slate-200">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">2. Motivo de Consulta Inicial</h2>
          </div>
          <div className="p-8 space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Puntos Clave <span className="font-normal lowercase text-slate-400 opacity-60">(ENTER para nueva línea)</span></label>
              <div className="space-y-3">
                {visitNotes.map((note, index) => (
                  <div key={index} className="flex items-center space-x-3 group">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">{index + 1}</span>
                    <input
                      id={`note-input-${index}`}
                      type="text"
                      className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                      placeholder="Describa hallazgo o síntoma..."
                      value={note}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      onKeyDown={(e) => handleNoteKeyDown(index, e)}
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Observaciones Generales</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Recomendaciones y tratamiento..."
                  value={visitTreatment}
                  onChange={(e) => setVisitTreatment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-700 mb-2 uppercase tracking-widest">Receta e Indicaciones</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none"
                  placeholder="Medicamentos y dosis..."
                  value={visitMedications}
                  onChange={(e) => setVisitMedications(e.target.value)}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end space-x-8 pt-4">
          <Link to="/" className="text-slate-500 font-black uppercase text-sm tracking-widest hover:text-slate-800 transition-colors">Cancelar</Link>
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
              <span>Finalizar y Guardar</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatient;
