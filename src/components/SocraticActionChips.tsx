import React from 'react';
import { HelpCircle, ArrowRight, Lightbulb, Compass, BookCheck } from 'lucide-react';

interface SocraticActionChipsProps {
  onTriggerAction: (action: 'why' | 'next_step' | 'hint' | 'concept' | 'verify') => void;
  disabled?: boolean;
}

export const SocraticActionChips: React.FC<SocraticActionChipsProps> = ({
  onTriggerAction,
  disabled = false,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto py-2 px-1 scrollbar-none">
      {/* "¿Por qué hicimos eso?" - Prominent Highlighted Button */}
      <button
        id="btn-socratic-why"
        onClick={() => onTriggerAction('why')}
        disabled={disabled}
        className="shrink-0 flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 shadow-sm transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer group"
        title="Pide al tutor explicar la intuición y justificación de este paso específico"
      >
        <HelpCircle className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
        <span>¿Por qué hicimos eso?</span>
      </button>

      {/* "¿Cuál es el siguiente paso?" */}
      <button
        id="btn-socratic-next"
        onClick={() => onTriggerAction('next_step')}
        disabled={disabled}
        className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <ArrowRight className="w-3.5 h-3.5 text-stone-600" />
        <span>Siguiente paso</span>
      </button>

      {/* "Dame una pista" */}
      <button
        id="btn-socratic-hint"
        onClick={() => onTriggerAction('hint')}
        disabled={disabled}
        className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
        <span>Dame una pista</span>
      </button>

      {/* "¿Qué teorema o fórmula es?" */}
      <button
        id="btn-socratic-concept"
        onClick={() => onTriggerAction('concept')}
        disabled={disabled}
        className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <Compass className="w-3.5 h-3.5 text-blue-600" />
        <span>Concepto teórico</span>
      </button>

      {/* "Quiero comprobar mi avance" */}
      <button
        id="btn-socratic-verify"
        onClick={() => onTriggerAction('verify')}
        disabled={disabled}
        className="shrink-0 flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white hover:bg-stone-100 text-stone-800 border border-stone-300 shadow-xs transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
      >
        <BookCheck className="w-3.5 h-3.5 text-emerald-600" />
        <span>Revisar mi cálculo</span>
      </button>
    </div>
  );
};
