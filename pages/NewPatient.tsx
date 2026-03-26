
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Gender } from '../types';

interface NewPatientProps {
  addPatientWithFirstVisit: (patient: any, visit: any) => string;
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

  // Live Preview Modal for forms
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [livePreviewData, setLivePreviewData] = useState<{ medications?: string, treatment?: string }>({});

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name.trim()) return setError('El nombre es requerido');
    if (!formData.address.trim()) return setError('La dirección es requerida');
    if (formData.dui.trim() && !isDuiUnique(formData.dui)) return setError('Este DUI ya existe');
    if (Number(formData.age) <= 0) return setError('Edad inválida');

    const cleanNotes = visitNotes.filter(n => n.trim() !== '');
    if (cleanNotes.length === 0) return setError('Ingrese el motivo de consulta');

    const id = addPatientWithFirstVisit(
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
  };

  const formatDateShort = (isoString: string) => {
    return new Intl.DateTimeFormat('es-SV', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }).format(new Date(isoString));
  };

  // Component that renders the prescription sheet UI
  const PrescriptionSheet = ({ medications, treatment, date, patientName, patientAge, patientDui }: { medications?: string, treatment?: string, date: string, patientName: string, patientAge: string, patientDui: string }) => (
    <div className="bg-white shadow-2xl mx-auto w-full max-w-[800px] min-h-[900px] flex flex-col p-10 text-slate-800 ring-1 ring-slate-200 pointer-events-none select-none">
      {/* Header NaturaCare */}
      <div className="flex justify-between items-start border-b-4 border-emerald-600 pb-6 mb-8">
        <div>
          <h1 className="m-0 text-3xl font-black text-emerald-600 tracking-tighter">NaturaCare</h1>
          <p className="m-0 mt-1 text-slate-500 font-bold text-[10px] uppercase tracking-[0.1em]">Medicina natural, medicina biologica, medicina regenerativa</p>
          <div className="mt-2 text-[9px] text-slate-400 font-bold uppercase leading-tight">
            <p>Carretera a San Marcos KM 5 1/2 #113,</p>
            <p>contiguo a planta de bombeo de ANDA</p>
            <p className="text-emerald-600">Tel: 2220-7977</p>
          </div>
        </div>
        <div className="text-right">
          <p className="m-0 text-xl font-black text-slate-900">ND. Selvin Lopez</p>
          <p className="m-0 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">FECHA: {date}</p>
        </div>
      </div>

      {/* Patient Info */}
      <div className="mb-8 bg-slate-50 p-5 rounded-xl border border-slate-100">
        <p className="m-0 text-lg font-black text-slate-900 uppercase">
          PACIENTE: {patientName || "---"}
        </p>
        <div className="mt-2 flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
           <span>DUI: {patientDui || "N/A"}</span>
           <span>Edad: {patientAge || "0"} años</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-8">
        <h2 className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 mb-5 font-black border-b border-slate-100 pb-2">Receta e Indicaciones</h2>
        
        {medications && (
          <div className="mb-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Receta / Medicamentos:</h3>
            <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
              {medications}
            </div>
          </div>
        )}

        {treatment && (
          <div className={`${medications ? 'mt-8 pt-8 border-t border-slate-100' : ''}`}>
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Indicaciones y Recomendaciones:</h3>
            <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
              {treatment}
            </div>
          </div>
        )}

        {!medications && !treatment && (
          <div className="text-slate-200 italic">Escribiendo contenido...</div>
        )}
      </div>

      {/* Footer Section */}
      <div className="flex justify-between items-end mt-auto pt-10 border-t border-slate-50">
        <div className="w-[45%]">
          <p className="m-0 text-[10px] font-black text-slate-400 uppercase tracking-widest">PRÓXIMA CITA:</p>
          <div className="w-full border-b-2 border-slate-200 mt-5 min-h-[20px]"></div>
        </div>
        <div className="w-[45%] text-center">
          <div className="w-full border-t-2 border-slate-900 mb-3"></div>
          <p className="m-0 font-black text-xs text-slate-900 uppercase tracking-tight">Firma y Sello Médico</p>
          <p className="m-0 mt-1 text-[10px] text-slate-400 font-bold uppercase tracking-widest">ND. Selvin Lopez - NaturaCare</p>
        </div>
      </div>

      <div className="text-center text-[8px] text-slate-200 uppercase tracking-[0.3em] mt-8">
        Documento Privado y Confidencial de NaturaCare
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fadeIn pb-16">
      {/* Modal for Live Preview */}
      {isLivePreviewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
            <div className="bg-emerald-600 px-8 py-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Vista Previa de Documento</h3>
              <button 
                onClick={() => setIsLivePreviewOpen(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all text-white font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-100 p-10">
              <PrescriptionSheet 
                medications={livePreviewData.medications} 
                treatment={livePreviewData.treatment}
                date={new Date().toLocaleDateString('es-SV')} 
                patientName={formData.name}
                patientAge={formData.age}
                patientDui={formData.dui}
              />
            </div>
            
            <div className="p-6 bg-white border-t border-slate-200 flex justify-end shrink-0">
               <button 
                 onClick={() => setIsLivePreviewOpen(false)}
                 className="px-10 py-3 bg-slate-800 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-slate-900 transition-all"
               >
                 Volver al Editor
               </button>
            </div>
          </div>
        </div>
      )}

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
                <label className="block text-xs font-black text-emerald-700 mb-2 uppercase tracking-widest">Indicaciones y Recomendaciones (LIVE PREVIEW →)</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-emerald-50/10 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Instrucciones adicionales para el paciente..."
                  value={visitTreatment}
                  onChange={(e) => setVisitTreatment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-700 mb-2 uppercase tracking-widest">Receta / Medicamentos (LIVE PREVIEW →)</label>
                <textarea 
                  rows={3}
                  className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none"
                  placeholder="Medicamentos y dosis..."
                  value={visitMedications}
                  onChange={(e) => setVisitMedications(e.target.value)}
                />
              </div>
            </div>

            {/* Live Preview Pane for New Patient */}
            <div className="mt-10 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col items-center">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                Vista Previa de Hoja Inicial
              </h4>
              <div className="w-full scale-75 md:scale-90 origin-top transform">
                <PrescriptionSheet 
                  medications={visitMedications} 
                  treatment={visitTreatment}
                  date={new Date().toLocaleDateString('es-SV')} 
                  patientName={formData.name}
                  patientAge={formData.age}
                  patientDui={formData.dui}
                />
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center justify-end space-x-8 pt-4">
          <Link to="/" className="text-slate-500 font-black uppercase text-sm tracking-widest hover:text-slate-800 transition-colors">Cancelar</Link>
          <button
            type="button"
            onClick={() => {
              setLivePreviewData({ medications: visitMedications, treatment: visitTreatment });
              setIsLivePreviewOpen(true);
            }}
            className="px-8 py-4 text-emerald-700 font-black uppercase text-xs tracking-widest hover:bg-emerald-50 rounded-xl transition-all"
          >
            Vista Previa
          </button>
          <button
            type="submit"
            className="px-14 py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-100 active:scale-95 text-xl tracking-tight"
          >
            Finalizar y Guardar
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPatient;
