import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useParams, Link } from 'react-router-dom';
import ErrorModal from '../components/ErrorModal';
import { db } from '../store';
import { Gender, Patient, Visit } from '../types';

interface PatientDetailProps {
  patients: Patient[];
  addVisit: (visit: any) => Promise<Visit>;
  updatePatient: (patientId: string, updates: Partial<Patient>) => Promise<void>;
  updateVisit: (visitId: string, updates: Partial<Visit>) => Promise<Visit>;
  doctorName: string;
}

const applyDateMask = (value: string): string => {
  const digits = value.replace(/\D/g, '').substring(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return digits.substring(0, 2) + '/' + digits.substring(2);
  return digits.substring(0, 2) + '/' + digits.substring(2, 4) + '/' + digits.substring(4);
};

function PatientDetail({ patients, addVisit, updatePatient, updateVisit, doctorName }: PatientDetailProps) {
  const formatPrintDate = (dateValue: string) => {
    return dateValue.trim();
  };

  const { id } = useParams<{ id: string }>();
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [patientFormData, setPatientFormData] = useState({
    name: '',
    dui: '',
    age: '',
    address: '',
    chronicIllness: '',
    gender: Gender.MASCULINO,
    medicalHistory: ''
  });
  const [patientDuiNotApplicable, setPatientDuiNotApplicable] = useState(false);
  const [patientEditLoading, setPatientEditLoading] = useState(false);
  const [patientEditError, setPatientEditError] = useState('');
  const [isNewVisitOpen, setIsNewVisitOpen] = useState(false);
  const [visitNotes, setVisitNotes] = useState<string[]>(['']);
  const [visitTreatment, setVisitTreatment] = useState('');
  const [visitMedications, setVisitMedications] = useState('');
  const [visitChronicIllness, setVisitChronicIllness] = useState('');
  const [visitMedicalHistory, setVisitMedicalHistory] = useState('');
  const [isCertificateOpen, setIsCertificateOpen] = useState(false);
  const [certificateText, setCertificateText] = useState('');
  const [prescriptionPrintDates, setPrescriptionPrintDates] = useState<Record<string, string>>({});
  const [prescriptionPrintDate, setPrescriptionPrintDate] = useState('');
  const [certificatePrintDate, setCertificatePrintDate] = useState('');
  const [editingVisitId, setEditingVisitId] = useState<string | null>(null);
  const [editingMedications, setEditingMedications] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [modalError, setModalError] = useState('');
  const [visits, setVisits] = useState<Visit[]>([]);
  const [visitsLoading, setVisitsLoading] = useState(true);
  const patientSectionRef = useRef<HTMLDivElement | null>(null);
  const visitSectionRef = useRef<HTMLDivElement | null>(null);
  const certificateSectionRef = useRef<HTMLDivElement | null>(null);
  const patientErrorRef = useRef<HTMLDivElement | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);
  const editErrorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (patientEditError) {
      patientErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [patientEditError]);

  useEffect(() => {
    if (error) {
      errorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [error]);

  useEffect(() => {
    if (editError) {
      editErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [editError]);

  useEffect(() => {
    if (!id) return;
    setVisitsLoading(true);
    db.getVisitsByPatient(id)
      .then(setVisits)
      .finally(() => setVisitsLoading(false));
  }, [id]);

  const focusField = (fieldId: string) => {
    window.setTimeout(() => {
      const element = document.getElementById(fieldId) as HTMLElement | null;
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element?.focus();
    }, 120);
  };

  const showVisitError = (message: string, fieldId?: string) => {
    setError(message);
    setModalError(message);

    if (fieldId) {
      focusField(fieldId);
    }
  };

  const showEditRecipeError = (message: string, fieldId?: string) => {
    setEditError(message);
    setModalError(message);

    if (fieldId) {
      focusField(fieldId);
    }
  };

  const patient = useMemo(() => patients.find(p => p.id === id), [patients, id]);
  
  const patientVisits = useMemo(() => {
    return [...visits].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [visits]);

  if (!patient) {
    return (
      <div className="text-center py-24">
        <h2 className="text-2xl font-black text-slate-800">Expediente no ubicado</h2>
        <Link to="/" className="text-emerald-600 mt-4 inline-block hover:underline font-black uppercase text-sm tracking-widest">Volver al buscador</Link>
      </div>
    );
  }

  const showPatientEditError = (message: string, fieldId?: string) => {
    setPatientEditError(message);
    setModalError(message);

    if (fieldId) {
      focusField(fieldId);
    }
  };

  const openPatientEditSection = () => {
    setPatientFormData({
      name: patient.name || '',
      dui: patient.dui || '',
      age: String(patient.age || ''),
      address: patient.address || '',
      chronicIllness: patient.chronicIllness || '',
      gender: patient.gender || Gender.MASCULINO,
      medicalHistory: patient.medicalHistory || ''
    });
    setPatientDuiNotApplicable(!patient.dui);
    setPatientEditError('');
    setError('');
    setEditError('');
    setModalError('');
    setIsNewVisitOpen(false);
    setIsCertificateOpen(false);
    setIsEditingPatient(true);

    setTimeout(() => {
      patientSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const cancelPatientEdit = () => {
    setIsEditingPatient(false);
    setPatientEditError('');
    setModalError('');
  };

  const handleSavePatient = async (e: FormEvent) => {
    e.preventDefault();
    setPatientEditError('');
    setModalError('');

    const normalizedDui = patientDuiNotApplicable ? '' : patientFormData.dui.trim();
    const normalizedAge = Number(patientFormData.age);
    const missingFields: string[] = [];
    let firstFieldId = '';

    if (!patientFormData.name.trim()) {
      missingFields.push('Nombre completo');
      firstFieldId ||= 'edit-patient-name';
    }

    if (!patientFormData.address.trim()) {
      missingFields.push('Dirección de domicilio');
      firstFieldId ||= 'edit-patient-address';
    }

    if (!Number.isFinite(normalizedAge) || normalizedAge <= 0 || normalizedAge > 150) {
      missingFields.push('Edad válida');
      firstFieldId ||= 'edit-patient-age';
    }

    if (missingFields.length > 0) {
      const message = missingFields.length === 1
        ? `Falta completar el campo:\n• ${missingFields[0]}`
        : `Faltan completar los siguientes campos:\n• ${missingFields.join('\n• ')}`;
      showPatientEditError(message, firstFieldId);
      return;
    }

    const isDuplicateDui = normalizedDui
      ? patients.some(existingPatient => existingPatient.id !== patient.id && existingPatient.dui === normalizedDui)
      : false;

    if (isDuplicateDui) {
      showPatientEditError('El DUI ingresado ya existe. Verifica el número o marca "No aplica".', 'edit-patient-dui');
      return;
    }

    setPatientEditLoading(true);
    try {
      await updatePatient(patient.id, {
        name: patientFormData.name.trim(),
        dui: normalizedDui || undefined,
        age: normalizedAge,
        address: patientFormData.address.trim(),
        chronicIllness: patientFormData.chronicIllness.trim(),
        gender: patientFormData.gender,
        medicalHistory: patientFormData.medicalHistory.trim()
      });
      setIsEditingPatient(false);
    } catch (err: any) {
      const message = err?.message || 'No se pudo actualizar la información del paciente';
      showPatientEditError(message);
    } finally {
      setPatientEditLoading(false);
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

  const handleSaveVisit = async (e: FormEvent) => {
    e.preventDefault();
    const cleanNotes = visitNotes.filter(n => n.trim() !== '');

    setError('');
    setModalError('');

    if (cleanNotes.length === 0 && !visitTreatment.trim()) {
      showVisitError('Falta completar el campo:\n• Motivo u observaciones de la consulta', 'note-input-0');
      return;
    }
    
    setLoading(true);
    try {
      const newVisit = await addVisit({
        patientId: patient.id,
        notes: cleanNotes,
        treatment: visitTreatment,
        medications: visitMedications
      });

      setVisits(prev => [newVisit, ...prev]);

      await updatePatient(patient.id, {
        chronicIllness: visitChronicIllness,
        medicalHistory: visitMedicalHistory
      });

      setVisitNotes(['']);
      setVisitTreatment('');
      setVisitMedications('');
      setVisitChronicIllness('');
      setVisitMedicalHistory('');
      setIsNewVisitOpen(false);
    } catch (err: any) {
      const message = err?.message || 'Error al guardar la visita';
      showVisitError(message);
    } finally {
      setLoading(false);
    }
  };

  const openVisitSection = () => {
    setVisitChronicIllness(patient.chronicIllness || '');
    setVisitMedicalHistory(patient.medicalHistory || '');
    setError('');
    setModalError('');
    setIsCertificateOpen(false);
    setIsNewVisitOpen(true);

    setTimeout(() => {
      visitSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const openCertificateSection = () => {
    setError('');
    setEditError('');
    setModalError('');
    setIsNewVisitOpen(false);
    setIsCertificateOpen(true);

    setTimeout(() => {
      certificateSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const formatDate = (isoString: string) => {
    return new Intl.DateTimeFormat('es-SV', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    }).format(new Date(isoString));
  };

  const doctorDisplayName = 'ND. Selvin Lopez';

  const escapeHtml = (value: string) =>
    value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const toHtmlParagraph = (value: string, fallback: string) => {
    const safe = escapeHtml(value.trim() || fallback);
    return safe.replace(/\n/g, '<br/>');
  };

  const previewDateText = formatPrintDate(certificatePrintDate);

  const handlePrint = (visit: Visit) => {
    const printDate = formatPrintDate(prescriptionPrintDates[visit.id] || '');
    if (!printDate) {
      setModalError('Ingresa la fecha manual de la receta antes de imprimir.');
      return;
    }

    const printContent = `
      <div style="font-family: 'Inter', sans-serif; width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; color: #1f2937; padding: 18mm 16mm; box-sizing: border-box; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm;">
          <div>
            <h1 style="margin: 0; font-size: 54px; line-height: 1; font-weight: 900; color: #10b981; letter-spacing: -1.8px;">NaturaCare</h1>
            <p style="margin: 7px 0 0; color: #64748b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.4px;">Medicina Natural, Medicina Biologica,</p>
            <p style="margin: 2px 0 0; color: #64748b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.4px;">Medicina Regenerativa</p>
            <p style="margin: 4px 0 0; color: #0ea5a1; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.4px;">Tel: 2220-7977</p>
            <p style="margin: 2px 0 0; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;">Carretera a San Marcos KM 5 1/2 #113, Contiguo a Planta de Bombeo de ANDA</p>
          </div>
          <div style="text-align: right; padding-top: 2mm;">
            <p style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2;">${escapeHtml(doctorDisplayName)}</p>
            <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase; letter-spacing: 1.6px;">Fecha: ${escapeHtml(printDate)}</p>
          </div>
        </div>

        <div style="border-top: 5px solid #10b981; margin-bottom: 4mm;"></div>

        <div style="margin-bottom: 3mm;">
          <p style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${escapeHtml(patient.name)}</p>
        </div>

        <div style="flex-grow: 1; margin-bottom: 14mm;">
          <p style="margin: 0 0 2mm; font-size: 12px; font-weight: 900; color: #94a3b8; text-transform: uppercase; letter-spacing: 1.5px;">Receta / Medicamentos:</p>
          <div style="font-size: 16px; line-height: 1.45; color: #0f172a; font-weight: 500; min-height: 120mm; white-space: pre-wrap;">${toHtmlParagraph(visit.medications, ' ')}</div>
        </div>

        <div style="border: 2px solid #10b981; border-radius: 8px; padding: 5mm 6mm; margin-bottom: 6mm;">
          <p style="margin: 0 0 2.5mm; font-size: 10px; font-weight: 900; color: #10b981; text-transform: uppercase; letter-spacing: 1.4px;">Recordatorio de Cita</p>
          <p style="margin: 0; font-size: 12px; color: #1f2937; font-weight: 500; line-height: 1.6;">Su cita queda programada para <span style="display: inline-block; min-width: 38mm; border-bottom: 1.5px solid #1f2937; margin: 0 1.5mm; vertical-align: bottom;"></span> debe de confirmar su asistencia a la cita un día antes al número <strong>2220-7977</strong> y si por alguna razón no podrá asistir también rogamos pueda hablar e informarlo.</p>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto;">
          <div style="width: 45%;">
            <p style="margin: 0; font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1.2px;">Próxima Cita:</p>
            <div style="width: 100%; border-bottom: 2px solid #e2e8f0; margin-top: 6mm; min-height: 8mm;"></div>
          </div>

          <div style="width: 45%; text-align: center;">
            <div style="width: 100%; border-top: 2px solid #1f2937; margin-bottom: 3mm;"></div>
            <p style="margin: 0; font-weight: 900; font-size: 12px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.7px;">Firma y Sello Médico</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(doctorDisplayName)}<br/>NaturaCare</p>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>NaturaCare_Receta_${patient.name.replace(/\s+/g, '_')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; font-family: 'Inter', sans-serif; background: #f1f5f9; }
              @page { size: A4; margin: 0; }
            </style>
          </head>
          <body>${printContent}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const handlePrintCertificate = () => {
    const printDate = formatPrintDate(certificatePrintDate);
    if (!printDate) {
      setModalError('Ingresa la fecha manual de la constancia antes de imprimir.');
      return;
    }

    const certificateHtml = `
      <div style="font-family: 'Inter', sans-serif; width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; color: #1f2937; padding: 18mm 16mm; box-sizing: border-box; display: flex; flex-direction: column;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10mm;">
          <div>
            <h1 style="margin: 0; font-size: 54px; line-height: 1; font-weight: 900; color: #10b981; letter-spacing: -1.8px;">NaturaCare</h1>
            <p style="margin: 7px 0 0; color: #64748b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.4px;">Medicina Natural, Medicina Biologica,</p>
            <p style="margin: 2px 0 0; color: #64748b; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 1.4px;">Medicina Regenerativa</p>
            <p style="margin: 4px 0 0; color: #0ea5a1; font-size: 14px; font-weight: 900; text-transform: uppercase; letter-spacing: 1.4px;">Tel: 2220-7977</p>
            <p style="margin: 2px 0 0; color: #94a3b8; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.7px;">Carretera a San Marcos KM 5 1/2 #113, Contiguo a Planta de Bombeo de ANDA</p>
          </div>
          <div style="text-align: right; padding-top: 2mm;">
            <p style="margin: 0; font-size: 22px; font-weight: 900; color: #0f172a; line-height: 1.2;">${escapeHtml(doctorDisplayName)}</p>
            <p style="margin: 10px 0 0; font-size: 11px; color: #94a3b8; font-weight: 900; text-transform: uppercase; letter-spacing: 1.6px;">Fecha: ${escapeHtml(printDate)}</p>
          </div>
        </div>

        <div style="border-top: 5px solid #10b981; margin-bottom: 4mm;"></div>

        <div style="margin-bottom: 3mm;">
          <p style="margin: 0; font-size: 20px; font-weight: 900; color: #0f172a; letter-spacing: -0.5px;">${escapeHtml(patient.name)}</p>
        </div>

        <div style="flex-grow: 1; margin-bottom: 14mm;">
          <div style="font-size: 16px; line-height: 1.45; color: #0f172a; font-weight: 500; min-height: 120mm; white-space: pre-wrap;">${toHtmlParagraph(certificateText, ' ')}</div>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: auto;">
          <div style="width: 45%;">
            <p style="margin: 0; font-size: 11px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 1.2px;">Próxima Cita:</p>
            <div style="width: 100%; border-bottom: 2px solid #e2e8f0; margin-top: 6mm; min-height: 8mm;"></div>
          </div>

          <div style="width: 45%; text-align: center;">
            <div style="width: 100%; border-top: 2px solid #1f2937; margin-bottom: 3mm;"></div>
            <p style="margin: 0; font-weight: 900; font-size: 12px; color: #1f2937; text-transform: uppercase; letter-spacing: 0.7px;">Firma y Sello Médico</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #94a3b8; font-weight: 800; text-transform: uppercase; letter-spacing: 1px;">${escapeHtml(doctorDisplayName)}<br/>NaturaCare</p>
          </div>
        </div>
      </div>
    `;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>NaturaCare_Constancia_${patient.name.replace(/\s+/g, '_')}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
            <style>
              body { margin: 0; font-family: 'Inter', sans-serif; background: #f1f5f9; }
              @page { size: A4; margin: 0; }
            </style>
          </head>
          <body>${certificateHtml}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    }
  };

  const startEditingRecipe = (visit: Visit) => {
    setEditingVisitId(visit.id);
    setEditingMedications(visit.medications || '');
    setEditError('');
    setModalError('');
  };

  const cancelEditingRecipe = () => {
    setEditingVisitId(null);
    setEditingMedications('');
    setEditError('');
    setModalError('');
  };

  const saveEditedRecipe = async (visitId: string) => {
    setEditLoading(true);
    setEditError('');
    setModalError('');

    if (!editingMedications.trim()) {
      showEditRecipeError('Falta completar el campo:\n• Receta e indicaciones', `edit-recipe-${visitId}`);
      setEditLoading(false);
      return;
    }

    try {
      const updatedVisit = await updateVisit(visitId, { medications: editingMedications });
      setVisits(prev => prev.map(v => v.id === visitId ? updatedVisit : v));
      setEditingVisitId(null);
      setEditingMedications('');
    } catch (err: any) {
      const message = err?.message || 'No se pudo actualizar la receta';
      showEditRecipeError(message);
    } finally {
      setEditLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24 print:hidden">
      {/* Patient Header Card */}
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
            <div className="flex flex-col items-start md:items-end gap-3">
              <div className="bg-white/10 px-5 py-3 rounded-2xl backdrop-blur-md border border-white/20">
                <span className="block text-[10px] font-black uppercase tracking-widest text-emerald-100 opacity-60 mb-1">DUI</span>
                <span className="text-2xl font-black font-mono tracking-tighter">{patient.dui || 'No aplica'}</span>
              </div>
              <button
                type="button"
                onClick={openPatientEditSection}
                className={`px-5 py-3 rounded-2xl border uppercase text-[10px] tracking-[0.2em] font-black transition-all ${isEditingPatient ? 'bg-white text-emerald-700 border-white shadow-lg' : 'bg-white/10 text-white border-white/20 hover:bg-white/20'}`}
              >
                Editar paciente
              </button>
            </div>
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

      {isEditingPatient && (
        <div ref={patientSectionRef} className="bg-white rounded-[2rem] shadow-2xl border-4 border-amber-400 overflow-hidden animate-slideUp">
          <div className="bg-amber-50 px-10 py-6 border-b border-amber-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-amber-900 uppercase tracking-widest">Editar Información del Paciente</h3>
            <button
              type="button"
              onClick={cancelPatientEdit}
              className="text-slate-400 hover:text-rose-600 font-black transition-colors uppercase text-xs"
            >
              Cancelar [×]
            </button>
          </div>

          <form onSubmit={handleSavePatient} className="p-10 space-y-8">
            {patientEditError && (
              <div ref={patientErrorRef} className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm">
                <p className="text-sm text-rose-700 font-black uppercase tracking-wide">Error: {patientEditError}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Nombre Completo</label>
                <input
                  id="edit-patient-name"
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-medium outline-none"
                  value={patientFormData.name}
                  onChange={(e) => setPatientFormData({ ...patientFormData, name: e.target.value })}
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">DUI (Opcional)</label>
                  <button
                    type="button"
                    onClick={() => {
                      const nextValue = !patientDuiNotApplicable;
                      setPatientDuiNotApplicable(nextValue);
                      setPatientEditError('');
                      if (nextValue) {
                        setPatientFormData({ ...patientFormData, dui: '' });
                      }
                    }}
                    className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${patientDuiNotApplicable ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200 hover:border-amber-300 hover:text-amber-700'}`}
                  >
                    {patientDuiNotApplicable ? 'No aplica ✓' : 'Marcar no aplica'}
                  </button>
                </div>
                <input
                  id="edit-patient-dui"
                  type="text"
                  disabled={patientDuiNotApplicable}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-medium outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
                  placeholder={patientDuiNotApplicable ? 'Paciente sin DUI o no desea brindarlo' : '00000000-0'}
                  value={patientDuiNotApplicable ? '' : patientFormData.dui}
                  onChange={(e) => setPatientFormData({ ...patientFormData, dui: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Edad</label>
                  <input
                    id="edit-patient-age"
                    type="number"
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-medium outline-none"
                    value={patientFormData.age}
                    onChange={(e) => setPatientFormData({ ...patientFormData, age: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Género</label>
                  <select
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-black outline-none appearance-none"
                    value={patientFormData.gender}
                    onChange={(e) => setPatientFormData({ ...patientFormData, gender: e.target.value as Gender })}
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
                  id="edit-patient-address"
                  type="text"
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-medium outline-none"
                  value={patientFormData.address}
                  onChange={(e) => setPatientFormData({ ...patientFormData, address: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-rose-600 mb-2 uppercase tracking-widest">Tipo / Enfermedad Crónica</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:bg-white focus:border-rose-500 transition-all text-lg font-bold text-rose-700 outline-none"
                  value={patientFormData.chronicIllness}
                  onChange={(e) => setPatientFormData({ ...patientFormData, chronicIllness: e.target.value })}
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Otros Antecedentes</label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-amber-500/10 focus:bg-white focus:border-amber-500 transition-all text-lg font-medium outline-none"
                  value={patientFormData.medicalHistory}
                  onChange={(e) => setPatientFormData({ ...patientFormData, medicalHistory: e.target.value })}
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={patientEditLoading}
                className="px-14 py-5 bg-amber-500 text-white font-black rounded-3xl hover:bg-amber-600 transition-all shadow-2xl shadow-amber-100 text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {patientEditLoading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Cambios</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-800 flex items-center tracking-tight uppercase">
          <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          Hojas de Visita
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={openVisitSection}
            className={`px-8 py-4 font-black rounded-2xl transition-all shadow-xl flex items-center uppercase text-sm tracking-widest ${isNewVisitOpen ? 'bg-emerald-600 text-white shadow-emerald-200' : 'bg-slate-800 text-white hover:bg-slate-900 shadow-slate-200'}`}
          >
            Nueva Consulta
          </button>
          <button
            type="button"
            onClick={openCertificateSection}
            className={`px-8 py-4 font-black rounded-2xl transition-all shadow-xl flex items-center uppercase text-sm tracking-widest ${isCertificateOpen ? 'bg-teal-600 text-white shadow-teal-200' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 shadow-slate-100'}`}
          >
            Constancia Médica
          </button>
        </div>
      </div>

      {/* New Visit Form Card */}
      {isNewVisitOpen && (
        <div ref={visitSectionRef} className="bg-white rounded-[2rem] shadow-2xl border-4 border-emerald-500 overflow-hidden animate-slideUp">
          <div className="bg-emerald-50 px-10 py-6 border-b border-emerald-100 flex justify-between items-center">
            <h3 className="text-xl font-black text-emerald-800 uppercase tracking-widest">Nueva Hoja NaturaCare</h3>
            <button 
              onClick={() => {
                setVisitNotes(['']);
                setVisitTreatment('');
                setVisitMedications('');
                setVisitChronicIllness('');
                setVisitMedicalHistory('');
                setError('');
                setIsNewVisitOpen(false);
              }}
              className="text-slate-400 hover:text-rose-600 font-black transition-colors uppercase text-xs"
            >
              Cancelar [×]
            </button>
          </div>
          <form onSubmit={handleSaveVisit} className="p-10 space-y-8">
            {error && (
              <div ref={errorRef} className="bg-rose-50 border-l-4 border-rose-500 p-5 rounded-2xl shadow-sm">
                <p className="text-sm text-rose-700 font-black uppercase tracking-wide">Error: {error}</p>
              </div>
            )}
            <div>
              <label className="block text-xs font-black text-slate-500 mb-4 uppercase tracking-widest">Motivo y Observaciones <span className="font-normal opacity-50 lowercase">(Enter para nueva línea)</span></label>
              <div className="space-y-3">
                {visitNotes.map((note, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center bg-emerald-100 text-emerald-700 rounded-xl text-xs font-black">{index + 1}</span>
                    <input
                      id={`note-input-${index}`}
                      type="text"
                      className="flex-1 px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                      placeholder="Ingrese observación..."
                      value={note}
                      onChange={(e) => handleNoteChange(index, e.target.value)}
                      onKeyDown={(e) => handleNoteKeyDown(index, e)}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
              <div>
                <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Observaciones y Tratamiento</label>
                <textarea 
                  rows={4}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Recomendaciones para el paciente..."
                  value={visitTreatment}
                  onChange={(e) => setVisitTreatment(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-emerald-700 mb-3 uppercase tracking-widest">Receta e Indicaciones</label>
                <textarea 
                  rows={4}
                  className="w-full px-5 py-4 bg-emerald-50/30 border border-emerald-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-bold outline-none"
                  placeholder="Medicamentos y horarios..."
                  value={visitMedications}
                  onChange={(e) => setVisitMedications(e.target.value)}
                />
              </div>
            </div>
            <div className="pt-2">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-black text-slate-500 uppercase tracking-widest">Live Preview de Impresión</h4>
                <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 uppercase tracking-widest">Receta</span>
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
                <div className="mx-auto bg-white w-full max-w-[760px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col gap-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h5 className="text-4xl font-black text-emerald-500 tracking-tight leading-none">NaturaCare</h5>
                      <p className="mt-2 text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Natural, Medicina Biologica,</p>
                      <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Regenerativa</p>
                      <p className="mt-1 text-[14px] text-teal-600 font-black uppercase tracking-[0.18em]">Tel: 2220-7977</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Carretera a San Marcos KM 5 1/2 #113, Contiguo a Planta de Bombeo de ANDA</p>
                    </div>
                    <div className="text-right pt-1">
                      <p className="text-3xl font-black text-slate-900 leading-tight">{doctorDisplayName}</p>
                      <p className="mt-3 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Fecha: {formatPrintDate(prescriptionPrintDate)}</p>
                    </div>
                  </div>

                  <div className="border-t-[5px] border-emerald-500 mt-8 mb-3"></div>

                  <p className="text-2xl font-black tracking-tight text-slate-900 mb-1">{patient.name || 'N/A'}</p>

                  <div className="mt-2">
                    <p className="text-xs font-black text-slate-400 uppercase tracking-[0.16em] mb-3">Receta / Medicamentos:</p>
                    <p className="text-base text-slate-900 leading-relaxed min-h-[120px] whitespace-pre-wrap">
                      {visitMedications.trim() || ' '}
                    </p>
                  </div>

                  <div className="border-2 border-emerald-300 rounded-xl px-5 py-4 mt-6 mb-2">
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.16em] mb-2">Recordatorio de Cita</p>
                    <p className="text-[11px] text-slate-800 font-medium leading-relaxed">
                      Su cita queda programada para{' '}
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
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.16em]">{doctorDisplayName}<br />NaturaCare</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div>
                <label className="block text-xs font-black text-rose-600 mb-3 uppercase tracking-widest">Enfermedad Crónica</label>
                <input
                  type="text"
                  className="w-full px-5 py-4 bg-rose-50/30 border border-rose-100 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:bg-white focus:border-rose-500 transition-all text-lg font-bold text-rose-700 outline-none"
                  placeholder="Ej: Hipertensión"
                  value={visitChronicIllness}
                  onChange={(e) => setVisitChronicIllness(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-500 mb-3 uppercase tracking-widest">Antecedentes Clínicos</label>
                <textarea
                  rows={3}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:bg-white focus:border-emerald-500 transition-all text-lg font-medium outline-none"
                  placeholder="Cirugías, alergias, hospitalizaciones..."
                  value={visitMedicalHistory}
                  onChange={(e) => setVisitMedicalHistory(e.target.value)}
                />
              </div>
            </div>
            <div className="flex justify-end pt-6">
              <button 
                type="submit"
                disabled={loading}
                className="px-14 py-5 bg-emerald-600 text-white font-black rounded-3xl hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-200 text-xl uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {loading ? (
                  <>
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Guardando...</span>
                  </>
                ) : (
                  <span>Guardar Consulta</span>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {isCertificateOpen && (
      <div ref={certificateSectionRef} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-teal-50 px-8 py-5 border-b border-teal-100 flex items-center justify-between">
          <h3 className="text-sm font-black text-teal-800 uppercase tracking-widest">Constancia Médica</h3>
          <span className="text-[10px] font-black text-teal-700 bg-white px-3 py-1 rounded-full border border-teal-200 uppercase tracking-widest">Live Preview</span>
        </div>

        <div className="p-8 grid grid-cols-1 xl:grid-cols-2 gap-8">
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-black text-slate-500 mb-2 uppercase tracking-widest">Texto de Constancia</label>
              <textarea
                rows={14}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:bg-white focus:border-teal-500 transition-all text-base font-medium outline-none"
                placeholder="Escribe aquí el contenido de la constancia..."
                value={certificateText}
                onChange={(e) => setCertificateText(e.target.value)}
              />
            </div>

            <div className="max-w-[220px]">
              <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.18em]">Fecha de constancia</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="DD/MM/AAAA"
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-sm font-bold text-slate-700 outline-none"
                value={certificatePrintDate}
                onChange={(e) => setCertificatePrintDate(applyDateMask(e.target.value))}
              />
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handlePrintCertificate}
                className="inline-flex items-center px-6 py-3 bg-teal-600 text-white font-black rounded-2xl hover:bg-teal-700 transition-all shadow-lg shadow-teal-100 uppercase text-xs tracking-widest"
              >
                Imprimir Constancia
              </button>
            </div>
          </div>

          <div className="bg-slate-100 border border-slate-200 rounded-3xl p-5 md:p-7">
            <div className="mx-auto bg-white w-full max-w-[760px] min-h-[980px] p-8 md:p-10 border border-slate-200 shadow-sm flex flex-col">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-4xl font-black text-emerald-500 tracking-tight leading-none">NaturaCare</h4>
                  <p className="mt-2 text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Natural, Medicina Biologica,</p>
                  <p className="text-[11px] text-slate-500 font-black uppercase tracking-[0.18em]">Medicina Regenerativa</p>
                  <p className="mt-1 text-[14px] text-teal-600 font-black uppercase tracking-[0.18em]">Tel: 2220-7977</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.1em]">Carretera a San Marcos KM 5 1/2 #113, Contiguo a Planta de Bombeo de ANDA</p>
                </div>
                <div className="text-right pt-1">
                  <p className="text-3xl font-black text-slate-900 leading-tight">{doctorDisplayName}</p>
                  <p className="mt-3 text-[11px] text-slate-400 font-black uppercase tracking-[0.2em]">Fecha: {previewDateText}</p>
                </div>
              </div>

              <div className="border-t-[5px] border-emerald-500 mt-8 mb-3"></div>

              <p className="text-2xl font-black tracking-tight text-slate-900 mb-1">{patient.name || 'N/A'}</p>

              <div className="mt-2 flex-1">
                <p className="text-base text-slate-900 leading-relaxed min-h-[390px] whitespace-pre-wrap">
                  {certificateText.trim() || ' '}
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
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.16em]">{doctorDisplayName}<br />NaturaCare</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Visits History Timeline */}
      <div className="space-y-8">
        {visitsLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : patientVisits.length > 0 ? (
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

                  <div className="mb-3">
                    <label className="block text-[10px] font-black text-slate-500 mb-2 uppercase tracking-[0.18em]">Fecha manual receta</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="DD/MM/AAAA"
                      className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-sm font-bold text-slate-700 outline-none"
                      value={prescriptionPrintDates[visit.id] || ''}
                      onChange={(e) => setPrescriptionPrintDates(prev => ({ ...prev, [visit.id]: applyDateMask(e.target.value) }))}
                    />
                  </div>
                  
                  <button 
                    onClick={() => handlePrint(visit)}
                    className="flex items-center text-xs font-black text-slate-500 hover:text-emerald-700 border-2 border-slate-100 px-6 py-3 rounded-2xl bg-slate-50 hover:bg-emerald-50 hover:border-emerald-200 transition-all uppercase tracking-widest"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir Receta
                  </button>

                  <button
                    type="button"
                    onClick={() => startEditingRecipe(visit)}
                    className="mt-3 flex items-center text-xs font-black text-slate-500 hover:text-teal-700 border-2 border-slate-100 px-6 py-3 rounded-2xl bg-white hover:bg-teal-50 hover:border-teal-200 transition-all uppercase tracking-widest"
                  >
                    Editar Receta
                  </button>
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
                      <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Observaciones</h4>
                      <p className="text-slate-700 font-medium whitespace-pre-wrap leading-relaxed">{visit.treatment || "Sin observaciones específicas."}</p>
                    </div>
                    <div>
                      <h4 className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-3">Indicaciones</h4>
                      {editingVisitId === visit.id ? (
                        <div className="space-y-3">
                          <textarea
                            id={`edit-recipe-${visit.id}`}
                            rows={5}
                            className="w-full px-4 py-3 bg-white border border-emerald-200 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all text-emerald-900 font-bold outline-none"
                            value={editingMedications}
                            onChange={(e) => setEditingMedications(e.target.value)}
                            placeholder="Editar receta e indicaciones..."
                          />
                          {editError && (
                            <p ref={editErrorRef} className="text-xs text-rose-700 font-black uppercase tracking-widest">{editError}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => saveEditedRecipe(visit.id)}
                              disabled={editLoading}
                              className="px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50"
                            >
                              {editLoading ? 'Guardando...' : 'Guardar receta'}
                            </button>
                            <button
                              type="button"
                              onClick={cancelEditingRecipe}
                              disabled={editLoading}
                              className="px-4 py-2 bg-white border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all disabled:opacity-50"
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="text-emerald-900 font-black whitespace-pre-wrap leading-relaxed">{visit.medications || "Sin prescripción indicada."}</p>
                      )}
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

      <ErrorModal
        isOpen={Boolean(modalError)}
        message={modalError}
        title="Revisa la información del cambio"
        onClose={() => setModalError('')}
      />
    </div>
  );
};

export default PatientDetail;
