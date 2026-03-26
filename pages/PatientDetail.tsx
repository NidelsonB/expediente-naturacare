
import React, { useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Patient, Visit } from '../types';

interface PatientDetailProps {
  patients: Patient[];
  visits: Visit[];
  addVisit: (visit: any) => void;
  doctorName: string;
}

const PatientDetail: React.FC<PatientDetailProps> = ({ patients, visits, addVisit, doctorName }) => {
  const { id } = useParams<{ id: string }>();
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [visitNotes, setVisitNotes] = useState<string[]>(['']);
  const [visitTreatment, setVisitTreatment] = useState('');
  const [visitMedications, setVisitMedications] = useState('');
  
  const [isNewConstanciaOpen, setIsNewConstanciaOpen] = useState(false);
  const [constanciaContent, setConstanciaContent] = useState('');
  
  // Live Preview Modal for forms
  const [isLivePreviewOpen, setIsLivePreviewOpen] = useState(false);
  const [livePreviewData, setLivePreviewData] = useState<{ medications?: string, treatment?: string, content?: string, isConstancia: boolean }>({ isConstancia: false });
  
  // Modal Preview State (for already saved visits)
  const [previewVisit, setPreviewVisit] = useState<Visit | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Define openPreview to fix the missing function error
  const openPreview = (visit: Visit) => {
    setPreviewVisit(visit);
    setIsPreviewOpen(true);
  };

  const patient = useMemo(() => patients.find(p => p.id === id), [patients, id]);
  
  const patientVisits = useMemo(() => {
    return visits
      .filter(v => v.patientId === id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits, id]);

  if (!patient) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black text-slate-800">Expediente no ubicado</h2>
        <Link to="/" className="text-emerald-600 mt-4 inline-block hover:underline font-black uppercase text-sm tracking-widest">Volver al buscador</Link>
      </div>
    );
  }

  // Component that renders the prescription sheet UI
  const PrescriptionSheet = ({ medications, treatment, date, title = "Receta e Indicaciones" }: { medications?: string, treatment?: string, date: string, title?: string }) => (
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
          PACIENTE: {patient.name}
        </p>
        <div className="mt-2 flex gap-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
           <span>DUI: {patient.dui || "N/A"}</span>
           <span>Edad: {patient.age} años</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex-1 mb-8">
        {title && <h2 className="text-[10px] uppercase tracking-[0.2em] text-emerald-600 mb-5 font-black border-b border-slate-100 pb-2">{title}</h2>}
        
        {medications && (
          <div className="mb-8">
            {title && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Receta / Medicamentos:</h3>}
            <div className="text-base leading-relaxed whitespace-pre-wrap text-slate-800 font-medium">
              {medications}
            </div>
          </div>
        )}

        {treatment && (
          <div className={`${medications ? 'mt-8 pt-8 border-t border-slate-100' : ''}`}>
            {title && <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Indicaciones y Recomendaciones:</h3>}
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

  const handlePrint = (visit: Visit | any, isConstancia: boolean = false) => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const printDate = new Date(visit.date || new Date()).toLocaleDateString('es-SV');
      const medications = visit.medications || "";
      const treatment = visit.treatment || "";
      const content = isConstancia ? (visit.content || "") : "";
      
      const titleHtml = isConstancia ? "" : `<h2 class="section-title">Receta e Indicaciones</h2>`;
      
      const recipeSection = medications ? `
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Receta / Medicamentos</h3>
          <div class="recipe-content" style="min-height: auto;">${medications}</div>
        </div>
      ` : "";

      const treatmentSection = treatment ? `
        <div style="${medications ? 'border-top: 1px solid #e2e8f0; padding-top: 30px;' : ''}">
          <h3 style="font-size: 11px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px;">Indicaciones y Recomendaciones</h3>
          <div class="recipe-content" style="min-height: auto;">${treatment}</div>
        </div>
      ` : "";

      const html = `
        <html>
          <head>
            <title>NaturaCare_${isConstancia ? 'Constancia' : 'Receta'}_${patient.name.replace(/\s+/g, '_')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; max-width: 800px; margin: 0 auto; min-height: 95vh; display: flex; flex-direction: column; background: white; }
              @page { size: auto; margin: 0mm; }
              .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 4px solid #059669; padding-bottom: 30px; margin-bottom: 40px; }
              .p-info { margin-bottom: 40px; background: #f8fafc; padding: 20px; border-radius: 12px; border: 1px solid #e2e8f0; }
              .section-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #059669; margin-bottom: 25px; font-weight: 900; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px; }
              .recipe-content { font-size: 17px; line-height: 1.7; white-space: pre-wrap; color: #1e293b; font-weight: 500; }
              .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto; padding-top: 40px; }
              .signature-line { width: 100%; border-top: 2px solid #1e293b; margin-bottom: 12px; }
              .bottom-note { text-align: center; font-size: 10px; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px; margin-top: 30px; border-top: 1px solid #f1f5f9; padding-top: 10px; }
            </style>
          </head>
          <body>
             <div class="header">
                <div>
                  <h1 style="margin:0; font-size: 32px; font-weight: 900; color: #059669; letter-spacing: -1px;">NaturaCare</h1>
                  <p style="margin:5px 0 0; color: #4b5563; font-weight: 700; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Medicina natural, medicina biologica, medicina regenerativa</p>
                  <div style="margin-top: 10px; font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; line-height: 1.4;">
                    <p style="margin:0;">Carretera a San Marcos KM 5 1/2 #113,</p>
                    <p style="margin:0;">contiguo a planta de bombeo de ANDA</p>
                    <p style="margin:2px 0 0; color: #059669; font-weight: 800;">Tel: 2220-7977</p>
                  </div>
                </div>
                <div style="text-align: right;">
                  <p style="margin: 0; font-size: 22px; font-weight: 900; color: #1e293b;">ND. Selvin Lopez</p>
                  <p style="margin: 5px 0 0; font-size: 14px; color: #64748b; font-weight: 600;">FECHA: ${printDate}</p>
                </div>
             </div>
             <div class="p-info">
               <p style="margin: 0; font-size: 22px; font-weight: 800; color: #0f172a;">PACIENTE: ${patient.name}</p>
               <div style="margin-top: 10px; display: flex; gap: 20px; font-size: 13px; color: #64748b; font-weight: 600; text-transform: uppercase;">
                 <span>DUI: ${patient.dui || "N/A"}</span>
                 <span>Edad: ${patient.age} años</span>
               </div>
             </div>
             <div style="flex-grow: 1;">
               ${titleHtml}
               ${isConstancia ? `<div class="recipe-content" style="min-height: 450px;">${content}</div>` : `
                 <div style="min-height: 450px;">
                   ${recipeSection}
                   ${treatmentSection}
                 </div>
               `}
             </div>
             <div class="footer">
                <div style="width: 45%;">
                   <p style="margin:0; font-size: 16px; font-weight: 800; color: #1e293b; text-transform: uppercase; letter-spacing: 1px;">PRÓXIMA CITA:</p>
                   <div style="width: 100%; border-bottom: 2px solid #94a3b8; margin-top: 20px; min-height: 24px;"></div>
                </div>
                <div style="width: 45%; text-align: center;">
                   <div class="signature-line"></div>
                   <p style="margin: 0; font-weight: 900; font-size: 16px; color: #1e293b;">Firma y Sello Médico</p>
                   <p style="margin: 4px 0 0; font-size: 13px; color: #64748b; font-weight: 700; text-transform: uppercase;">ND. Selvin Lopez - NaturaCare</p>
                </div>
             </div>
             <div class="bottom-note">Documento Privado y Confidencial de NaturaCare - San Salvador</div>
          </body>
        </html>
      `;
      printWindow.document.write(html);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

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

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNotes = visitNotes.filter(n => n.trim() !== '');
    if (cleanNotes.length === 0 && !visitTreatment.trim()) return;
    
    addVisit({
      patientId: patient.id,
      notes: cleanNotes,
      treatment: visitTreatment,
      medications: visitMedications
    });

    setVisitNotes(['']);
    setVisitTreatment('');
    setVisitMedications('');
    setIsNewVisitOpen(false);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(isoString));
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 print:hidden">
      {/* Modal for viewing already saved prescriptions */}
      {isPreviewOpen && previewVisit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-3xl shadow-2xl flex flex-col">
            <div className="bg-emerald-600 px-8 py-4 flex justify-between items-center text-white shrink-0">
              <h3 className="font-black uppercase tracking-widest text-sm text-white">Vista Previa Guardada</h3>
              <button 
                onClick={() => setIsPreviewOpen(false)}
                className="w-10 h-10 bg-white/20 hover:bg-white/40 rounded-full flex items-center justify-center transition-all text-white font-bold"
              >
                ×
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto bg-slate-100 p-10">
              <PrescriptionSheet 
                medications={previewVisit.medications} 
                treatment={previewVisit.treatment}
                date={new Date(previewVisit.date).toLocaleDateString('es-SV')} 
              />
            </div>
            
            <div className="p-6 bg-white border-t border-slate-200 flex justify-between shrink-0">
               <button 
                 onClick={() => setIsPreviewOpen(false)}
                 className="px-8 py-3 text-slate-500 font-black uppercase text-xs tracking-widest hover:bg-slate-50 rounded-xl transition-all"
               >
                 Cerrar
               </button>
               <button 
                 onClick={() => {
                   handlePrint(previewVisit);
                   setIsPreviewOpen(false);
                 }}
                 className="px-10 py-3 bg-emerald-600 text-white font-black uppercase text-xs tracking-widest rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all"
               >
                 Imprimir
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Live Preview of current forms */}
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
                medications={livePreviewData.isConstancia ? livePreviewData.content : livePreviewData.medications} 
                treatment={livePreviewData.treatment}
                date={new Date().toLocaleDateString('es-SV')} 
                title={livePreviewData.isConstancia ? "" : "Receta e Indicaciones"}
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

      {/* Patient Profile Card */}
      <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-emerald-600 px-10 py-8 text-white">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-emerald-100 text-[10px] font-black uppercase tracking-[0.2em]">
                <Link to="/" className="hover:text-white transition-colors">Buscador</Link>
                <span className="opacity-40">/</span>
                <span className="text-white">Expediente NaturaCare</span>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <h1 className="text-5xl font-black tracking-tight">{patient.name}</h1>
                {patient.chronicIllness && (
                  <span className="px-4 py-1.5 bg-rose-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-rose-900/20">
                    {patient.chronicIllness}
                  </span>
                )}
              </div>
            </div>
            {patient.dui && (
              <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-60 mb-1">DUI Registrado</span>
                <span className="text-2xl font-black font-mono tracking-tighter">{patient.dui}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="p-10 grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Información</span>
            <p className="text-xl text-slate-800 font-medium">
              <span className="font-black text-emerald-600">{patient.age} años</span> • {patient.gender}
            </p>
          </div>
          <div className="space-y-1.5 md:col-span-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Residencia</span>
            <p className="text-lg text-slate-700 italic font-medium leading-tight">
              {patient.address}
            </p>
          </div>
          <div className="md:col-span-2 space-y-1.5">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Antecedentes Clínicos</span>
            <p className="text-lg text-slate-600 leading-relaxed font-medium">
              {patient.medicalHistory || "Sin antecedentes previos."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center tracking-tight uppercase">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          Hojas de Visita
        </h2>
        <div className="flex gap-4">
          {!isNewVisitOpen && !isNewConstanciaOpen && (
            <>
              <button 
                onClick={() => setIsNewConstanciaOpen(true)}
                className="px-8 py-4 bg-emerald-100 text-emerald-700 font-black rounded-2xl hover:bg-emerald-200 transition-all shadow-xl shadow-emerald-50 flex items-center uppercase text-sm tracking-widest"
              >
                Nueva Constancia
              </button>
              <button 
                onClick={() => setIsNewVisitOpen(true)}
                className="px-8 py-4 bg-slate-800 text-white font-black rounded-2xl hover:bg-slate-900 transition-all shadow-xl shadow-slate-200 flex items-center uppercase text-sm tracking-widest"
              >
                Nueva Consulta
              </button>
            </>
          )}
        </div>
      </div>

      {/* New Constancia Form */}
      {isNewConstanciaOpen && (
        <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-500 overflow-hidden animate-slideUp">
          <div className="bg-emerald-50 px-10 py-6 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-emerald-800 uppercase tracking-widest">Nueva Constancia / Referencia</h3>
            <button 
              onClick={() => setIsNewConstanciaOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-rose-600 font-black transition-colors uppercase text-xs"
            >
              Cancelar [×]
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            <div className="flex-1 p-10 space-y-8 border-r border-slate-100">
              <div>
                <label className="block text-xs font-black text-emerald-700 mb-3 uppercase tracking-widest">Contenido de la Constancia</label>
                <textarea 
                  rows={15}
                  className="w-full px-5 py-4 bg-emerald-50/20 border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none ring-offset-2"
                  placeholder="Escriba aquí el texto de la constancia o referencia..."
                  value={constanciaContent}
                  onChange={(e) => setConstanciaContent(e.target.value)}
                />
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => {
                    setLivePreviewData({ content: constanciaContent, isConstancia: true });
                    setIsLivePreviewOpen(true);
                  }}
                  className="px-8 py-4 text-emerald-700 font-black uppercase text-xs tracking-widest hover:bg-emerald-50 rounded-xl transition-all"
                >
                  Vista Previa
                </button>
                <button 
                  onClick={() => {
                    handlePrint({ content: constanciaContent, date: new Date().toISOString() }, true);
                    setConstanciaContent('');
                    setIsNewConstanciaOpen(false);
                  }}
                  className="px-14 py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-xl uppercase tracking-widest active:scale-95"
                >
                  Imprimir Constancia
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[450px] xl:w-[550px] bg-slate-50 p-8 flex flex-col items-center justify-start overflow-y-auto max-h-[1000px] lg:max-h-none">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                Vista Previa Real
              </h4>
              <div className="w-full scale-75 xl:scale-90 origin-top transform">
                <PrescriptionSheet 
                  medications={constanciaContent} 
                  date={new Date().toLocaleDateString('es-SV')} 
                  title=""
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Visit Form - Live Preview Split Layout */}
      {isNewVisitOpen && (
        <div className="bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-500 overflow-hidden animate-slideUp">
          <div className="bg-emerald-50 px-10 py-6 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-emerald-800 uppercase tracking-widest">Nueva Hoja NaturaCare</h3>
            <button 
              onClick={() => setIsNewVisitOpen(false)}
              className="px-4 py-2 text-slate-400 hover:text-rose-600 font-black transition-colors uppercase text-xs"
            >
              Cancelar [×]
            </button>
          </div>
          
          <div className="flex flex-col lg:flex-row">
            {/* Left Column: Editor */}
            <form onSubmit={handleSaveVisit} className="flex-1 p-10 space-y-8 border-r border-slate-100">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Motivo de Consulta <span className="font-normal opacity-50 lowercase">(Enter para nueva línea)</span></label>
                <div className="space-y-3">
                  {visitNotes.map((note, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">{index + 1}</span>
                      <input
                        id={`note-input-${index}`}
                        type="text"
                        className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                        placeholder="Hallazgo..."
                        value={note}
                        onChange={(e) => handleNoteChange(index, e.target.value)}
                        onKeyDown={(e) => handleNoteKeyDown(index, e)}
                      />
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-emerald-700 mb-3 uppercase tracking-widest">Indicaciones y Recomendaciones (LIVE PREVIEW →)</label>
                  <textarea 
                    rows={4}
                    className="w-full px-5 py-4 bg-emerald-50/10 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                    placeholder="Instrucciones adicionales para el paciente..."
                    value={visitTreatment}
                    onChange={(e) => setVisitTreatment(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-emerald-700 mb-3 uppercase tracking-widest">Receta / Medicamentos (LIVE PREVIEW →)</label>
                  <textarea 
                    rows={8}
                    className="w-full px-5 py-4 bg-emerald-50/20 border-2 border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none ring-offset-2"
                    placeholder="Medicamentos, dosis, frecuencia..."
                    value={visitMedications}
                    onChange={(e) => setVisitMedications(e.target.value)}
                  />
                  <p className="mt-2 text-[10px] font-bold text-slate-400 uppercase italic">Mira a la derecha para ver cómo queda la hoja real.</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t border-slate-50">
                <button 
                  type="button"
                  onClick={() => {
                    setLivePreviewData({ medications: visitMedications, treatment: visitTreatment, isConstancia: false });
                    setIsLivePreviewOpen(true);
                  }}
                  className="px-8 py-4 text-emerald-700 font-black uppercase text-xs tracking-widest hover:bg-emerald-50 rounded-xl transition-all"
                >
                  Vista Previa
                </button>
                <button 
                  type="submit"
                  className="px-14 py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-xl uppercase tracking-widest active:scale-95"
                >
                  Guardar Consulta
                </button>
              </div>
            </form>

            {/* Right Column: Live Preview */}
            <div className="w-full lg:w-[450px] xl:w-[550px] bg-slate-50 p-8 flex flex-col items-center justify-start overflow-y-auto max-h-[1000px] lg:max-h-none">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 flex items-center">
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse mr-2"></span>
                Vista Previa Real
              </h4>
              <div className="w-full scale-75 xl:scale-90 origin-top transform">
                <PrescriptionSheet 
                  medications={visitMedications} 
                  treatment={visitTreatment}
                  date={new Date().toLocaleDateString('es-SV')} 
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visits History Timeline */}
      <div className="space-y-8">
        {patientVisits.length > 0 ? (
          patientVisits.map((visit, index) => (
            <div key={visit.id} className="relative bg-white border border-slate-200 rounded-[2rem] p-10 shadow-sm group hover:border-emerald-300 transition-all">
              {index === 0 && (
                <div className="absolute -left-4 top-10 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-xl shadow-lg rotate-[-90deg] tracking-widest">
                  Actual
                </div>
              )}
              
              <div className="flex flex-col md:flex-row gap-12">
                <div className="md:w-1/4">
                  <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] block mb-2">Visita Medica</span>
                  <p className="text-xl font-black text-slate-800 mb-6 leading-tight">{formatDate(visit.date)}</p>
                  
                  <div className="flex flex-col gap-3">
                    <button 
                      onClick={() => openPreview(visit)}
                      className="flex items-center text-[10px] font-black text-slate-400 hover:text-emerald-700 border border-slate-100 px-5 py-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all uppercase tracking-widest"
                    >
                      Ver Detalle Hoja
                    </button>
                    <button 
                      onClick={() => handlePrint(visit)}
                      className="flex items-center text-xs font-black text-white bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-2xl shadow-lg shadow-emerald-50 transition-all uppercase tracking-widest"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 00-2 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                      </svg>
                      Imprimir
                    </button>
                  </div>
                </div>
                
                <div className="flex-1 space-y-8">
                  <div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Puntos Tratados</h4>
                    <ul className="space-y-4">
                      {visit.notes.map((note, i) => (
                        <li key={i} className="flex items-start">
                          <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mt-2 mr-5 flex-shrink-0 shadow-sm shadow-emerald-200"></span>
                          <span className="text-xl text-slate-700 leading-relaxed font-medium">{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50 p-8 rounded-[2rem] border border-slate-100 group-hover:bg-emerald-50/20 group-hover:border-emerald-100 transition-colors">
                    <div>
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones Internas</h4>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{visit.treatment || "Sin observaciones específicas."}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Receta Entregada</h4>
                      <p className="text-emerald-900 font-black whitespace-pre-wrap leading-relaxed">{visit.medications || "Sin prescripción indicada."}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white border-4 border-dashed border-slate-100 rounded-[3rem] p-24 text-center">
            <p className="text-slate-300 text-2xl font-black italic tracking-tight">Sin historial de visitas.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDetail;
