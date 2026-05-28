import React, { FC } from 'react';
import { processEvidenceImage } from '@/utils/evidenceImageProcessor';

interface EvidenceUploaderProps {
  inspectionId: string;
  formId: string;
  questionId: string;
  caption: string;
  evidencias: any[];
  onSaveEvidencias: (updated: any[]) => Promise<void> | void;
}

export const EvidenceUploader: FC<EvidenceUploaderProps> = ({
  inspectionId,
  formId,
  questionId,
  caption,
  evidencias,
  onSaveEvidencias,
}) => {
  const filtered = (evidencias || []).filter(
    (e) => e.formId === formId && String(e.questionId) === String(questionId)
  );

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const processed = await processEvidenceImage({
        file,
        inspectionId,
        formId,
        questionId,
        caption,
      });

      const updated = [...(evidencias || []), processed];
      await onSaveEvidencias(updated);
    } catch (err) {
      console.error('Error uploading evidence:', err);
      alert('Error al procesar la imagen.');
    } finally {
      e.target.value = '';
    }
  };

  const handleRemove = async (id: string) => {
    const updated = (evidencias || []).filter((e) => e.id !== id);
    await onSaveEvidencias(updated);
  };

  // Generar IDs únicos para los inputs usando formId y questionId sanitizados
  const safeQuestionId = String(questionId).replace(/\s+/g, '_');
  const inputCamId = `camara-${formId}-${safeQuestionId}`;
  const inputGalId = `galeria-${formId}-${safeQuestionId}`;

  return (
    <div className="mt-3 space-y-2 border-t border-slate-700/50 pt-2 w-full text-left">
      <label className="block text-xs font-semibold text-slate-400">📸 Evidencias / Fotos:</label>
      
      {filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          {filtered.map((ev) => (
            <div key={ev.id} className="relative bg-slate-900 p-2 rounded border border-slate-700">
              <img src={ev.dataUrl || ev.foto} alt={ev.fileName} className="w-full h-20 object-cover rounded" />
              <div className="text-[9px] text-slate-400 mt-1 truncate" title={ev.fileName}>{ev.fileName}</div>
              <button
                type="button"
                onClick={() => handleRemove(ev.id)}
                className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs font-bold transition-colors"
                title="Eliminar foto"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <input
          id={inputCamId}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          className="hidden"
        />
        <input
          id={inputGalId}
          type="file"
          accept="image/*"
          onChange={handleUpload}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => document.getElementById(inputCamId)?.click()}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
        >
          📸 Cámara
        </button>
        <button
          type="button"
          onClick={() => document.getElementById(inputGalId)?.click()}
          className="px-3 py-1.5 bg-slate-750 hover:bg-slate-700 text-slate-200 rounded text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm active:scale-95"
        >
          📁 Galería
        </button>
      </div>
    </div>
  );
};
