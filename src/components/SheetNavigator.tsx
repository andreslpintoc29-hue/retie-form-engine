'use client';

import React from 'react';
import { useInspectionStore } from '@/store/useInspectionStore';
import { FormSheet } from '@/types/schema';
import { FileText, CheckCircle, AlertCircle, Clock, BarChart3, XCircle } from 'lucide-react';

interface SheetNavigatorProps {
  sheets: FormSheet[];
  onSelectSheet: (index: number) => void;
  selectedIndex: number;
}

export const SheetNavigator: React.FC<SheetNavigatorProps> = ({ 
  sheets, 
  onSelectSheet,
  selectedIndex 
}) => {
  const { calculateCompliance, respuestas } = useInspectionStore();

  const getSheetStatus = (sheet: FormSheet) => {
    const sheetAnswers = respuestas[sheet.nombre];
    if (!sheetAnswers || Object.keys(sheetAnswers).length === 0) {
      return { status: 'empty', label: 'Sin iniciar', icon: Clock, color: 'text-slate-400' };
    }

    const compliance = calculateCompliance(sheet.nombre);
    
    if (compliance.estado === 'aprobado') {
      return { status: 'approved', label: `${compliance.porcentaje}%`, icon: CheckCircle, color: 'text-green-400' };
    } else if (compliance.estado === 'rechazado') {
      return { status: 'rejected', label: `${compliance.porcentaje}%`, icon: XCircle, color: 'text-red-400' };
    } else {
      return { status: 'pending', label: 'En progreso', icon: AlertCircle, color: 'text-yellow-400' };
    }
  };

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-slate-400 mb-3">MÓDULOS DE INSPECCIÓN</div>
      {sheets.map((sheet, index) => {
        const { status, label, icon: Icon, color } = getSheetStatus(sheet);
        const isSelected = index === selectedIndex;

        return (
          <button
            key={sheet.nombre}
            onClick={() => onSelectSheet(index)}
            className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left ${
              isSelected
                ? 'bg-retie-accent/20 border border-retie-accent'
                : 'bg-slate-800/50 border border-slate-700/50 hover:bg-slate-700/50'
            }`}
          >
            <div className={`p-2 rounded-lg ${isSelected ? 'bg-retie-accent/30' : 'bg-slate-700'}`}>
              <FileText size={20} className={isSelected ? 'text-retie-accent' : 'text-slate-400'} />
            </div>
            <div className="flex-1 min-w-0">
              <div className={`font-medium truncate ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                {sheet.titulo}
              </div>
              <div className="text-xs text-slate-500">{sheet.codigo}</div>
            </div>
            <div className={`flex items-center gap-1 ${color}`}>
              <Icon size={14} />
              <span className="text-xs font-medium">{label}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default SheetNavigator;