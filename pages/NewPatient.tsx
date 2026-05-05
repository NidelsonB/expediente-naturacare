import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';
import { Gender } from '../types';

interface NewPatientProps {
  addPatientWithFirstVisit: (patient: any, visit: any) => Promise<string>;
  isDuiUnique: (dui: string) => boolean;
}

const applyDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').substring(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.substring(0, 2) + '/' + digits.substring(2);
  return digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4);
};

function NewPatient({ addPatientWithFirstVisit, isDuiUnique }: NewPatientProps) {
  const formatPrintDate = (dateValue: string) => {
    return dateValue.trim();
  };

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
  const [prescriptionPrintDate, setPrescriptionPrintDate] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [duiNotApplicable, setDuiNotApplicable] = useState(false);
  const [modalError, setModalError] = useState('');
  const errorRef = useRef<HTMLDivElement | null>(null);

  const cleanNotes = visitNotes.filter(n => n.trim() !== '');

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  const focusField = (fieldId: string) => {
    window.setTimeout(() => {
      const element = document.getElementById(fieldId) as HTMLElement | null;
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus();
    }, 120);
  };

  const showValidationErrors = (fields: string[], firstFieldId: string) => {
    const message = fields.length === 1
      ? `Falta completar el campo:\n• ${fields[0]}`
      : `Faltan completar los siguientes campos:\n• ${fields.join('\n• ')}`;

    setError(fields.length === 1 ? `Falta completar: ${fields[0]}` : `Campos pendientes: ${fields.join(', ')}`);
    setModalError(message);
    focusField(firstFieldId);
  };

  const showFormError = (message: string, fieldId?: string) => {
    setError(message);
    setModalError(message);

    if (fieldId) {
      focusField(fieldId);
    }
  };

  const handleNoteChange = (index: number, value: string) => {
    const newNotes = [...visitNotes];
    newNotes[index] = value;
    setVisitNotes(newNotes);
  };

  const handleNoteKeyDown = (index: number, e: KeyboardEvent) => {
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

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setModalError('');

    const normalizedDui = duiNotApplicable ? '' : formData.dui.trim();
    const age = Number(formData.age);
    const missingFields: string[] = [];
    let firstFieldId = '';

    if (!formData.name.trim()) {
      missingFields.push('Nombre completo');
      firstFieldId ||= 'patient-name';
    }

    if (!formData.address.trim()) {
      missingFields.push('Dirección de domicilio');
      firstFieldId ||= 'patient-address';
    }

    if (!Number.isFinite(age) || age <= 0 || age > 150) {
      missingFields.push('Edad válida');
      firstFieldId ||= 'patient-age';
    }

    if (cleanNotes.length === 0) {
      missingFields.push('Motivo de consulta');
      firstFieldId ||= 'note-input-0';
    }

    if (missingFields.length > 0) {
      showValidationErrors(missingFields, firstFieldId);
      return;
    }

    if (normalizedDui && !isDuiUnique(normalizedDui)) {
      showFormError('El DUI ingresado ya existe. Verifica el número o marca "No aplica".', 'patient-dui');
      return;
    }

    setLoading(true);
    try {
      const id = await addPatientWithFirstVisit(
        {
          ...formData,
          age,
          dui: normalizedDui || undefined
        },
        {
          notes: cleanNotes,
          treatment: visitTreatment,
          medications: visitMedications
        }
      );
      
      navigate(`/patients/${id}`);
    } catch (err: any) {
      const message = err?.message || 'Error al guardar el paciente';
      showFormError(message);
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
          <div ref={errorRef} className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm">
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
                  id="patient-name"
                  type="text"
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Ej: Juan Antonio Pérez"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">DUI (Opcional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = !duiNotApplicable;
                      setDuiNotApplicable(nextValue);
                      setError('');
                      if (nextValue) {
                        setFormData({ ...formData, dui: '' });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${duiNotApplicable ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300 hover:text-emerald-700'}`}
                  >
                    {duiNotApplicable ? 'No aplica ✓' : 'Marcar no aplica'}
                  </button>
                </div>
                <input
                  id="patient-dui"
                  type="text"
                  disabled={duiNotApplicable}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  placeholder={duiNotApplicable ? 'Paciente sin DUI o no desea brindarlo' : '00000000-0'}
                  value={duiNotApplicable ? '' : formData.dui}
                  onChange={(e) => setFormData({...formData, dui: e.target.value})}
                />
                {duiNotApplicable && (
                  <p className="mt-2 text-xs font-bold text-emerald-700">Este paciente se guardará sin DUI.</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Edad</label>
                  <input
                    id="patient-age"
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
                  id="patient-address"
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

            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Preview de Impresión</h3>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Formato Receta</span>
              </div>
              <div className="mb-4 flex justify-end">
                <div className="w-full max-w-[220px]">
                  <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.18em]">Fecha de impresión</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="DD/MM/AAAA"
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700 outline-none"
                    value={prescriptionPrintDate}
                    onChange={(e) => setPrescriptionPrintDate(applyDateMask(e.target.value))}
                  />
                </div>
              </div>
              <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 md:p-7">
                <div className="mx-auto bg-white w-full max-w-[760px] min-h-[980px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-5xl font-black text-emerald-500 tracking-tight leading-none">NaturaCare</h4>
                      <p className="mt-2 text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Natural, Medicina Biologica,</p>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Regenerativa</p>
                      <p className="mt-1 text-[11px] text-teal-600 font-black uppercase tracking-[0.18em]">Tel: 2220-7977</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Carretera a San Marcos KM 5 1/2 #113, Contiguo a Planta de Bombeo de ANDA</p>
                    </div>
                    <div className="text-right pt-1">
                      <p className="text-4xl font-black text-slate-900 leading-tight">ND. Selvin Lopez</p>
                      <p className="mt-3 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Fecha: {formatPrintDate(prescriptionPrintDate)}</p>
                    </div>
                  </div>

                  <div className="border-t-[5px] border-emerald-500 mt-8 mb-10"></div>

                  <p className="text-[50px] font-black tracking-tight text-slate-900">PACIENTE: {formData.name.trim() || 'NOMBRE PENDIENTE'}</p>
                  <div className="mt-3 flex items-center gap-8 text-[12px] text-slate-400 font-black uppercase tracking-[0.15em]">
                    <span>DUI: {duiNotApplicable ? 'No aplica' : formData.dui.trim() || 'N/A'}</span>
                    <span>Edad: {formData.age ? `${formData.age} años` : 'N/A'}</span>
                  </div>

                  <div className="mt-6">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-3">Receta / Medicamentos:</p>
                    <p className="text-4xl text-slate-900 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                      {visitMedications.trim() || ' '}
                    </p>
                  </div>

                  <div className="border-2 border-emerald-300 rounded-xl px-5 py-4 mt-6 mb-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.16em] mb-2">Recordatorio de Cita</p>
                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                      Si cita queda programada para{' '}
                      <span className="inline-block w-24 border-b border-slate-700 mx-1 align-bottom"></span>{' '}
                      debe de confirmar su asistencia a la cita un día antes al número{' '}
                      <span className="font-black">2220-7977</span>{' '}y si por alguna razón no podrá asistir también rogamos pueda hablar e informarlo.
                    </p>
                  </div>

                  <div className="mt-auto pt-10 flex items-end justify-between gap-10">
                    <div className="w-[42%]">
                      <p className="text-[11px] font-black text-slate-300 uppercase tracking-[0.16em]">Próxima Cita:</p>
                      <div className="border-b-2 border-slate-200 mt-6"></div>
                    </div>
                    <div className="w-[42%] text-center">
                      <div className="border-t-2 border-slate-700"></div>
                      <p className="mt-2 text-xs font-black text-slate-700 uppercase tracking-[0.14em]">Firma y sello médico</p>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.16em]">ND. Selvin Lopez<br />NaturaCare</p>
                    </div>
                  </div>
                </div>
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

      <ErrorModal
        isOpen={Boolean(modalError)}
        message={modalError}
        title="Revisa la información del formulario"
        onClose={() => setModalError('')}
      />
    </div>
  );
};

export default NewPatient;
