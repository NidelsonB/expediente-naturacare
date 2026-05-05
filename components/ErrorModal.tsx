
interface ErrorModalProps {
  isOpen: boolean;
  message: string;
  onClose: () => void;
  title?: string;
}

function ErrorModal({
  isOpen,
  message,
  onClose,
  title = 'No se pudo completar la acción'
}: ErrorModalProps) {
  if (!isOpen || !message) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="error-modal-title">
      <div className="w-full max-w-md rounded-[2rem] bg-white border border-rose-100 shadow-2xl overflow-hidden">
        <div className="bg-rose-50 border-b border-rose-100 px-6 py-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-rose-500">Error</p>
            <h3 id="error-modal-title" className="mt-1 text-xl font-black text-slate-900 tracking-tight">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-rose-600 text-xl font-black leading-none"
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm text-slate-700 font-semibold whitespace-pre-wrap leading-relaxed">{message}</p>
        </div>

        <div className="px-6 pb-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-rose-600 text-white rounded-xl font-black uppercase text-xs tracking-widest hover:bg-rose-700 transition-colors"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal;
