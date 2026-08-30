import React from 'react';
import { X, Heart, HelpCircle, CheckCircle2 } from 'lucide-react';

interface AboutInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutInfoModal: React.FC<AboutInfoModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white border border-stone-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100 bg-stone-50">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-stone-900">
              Sobre el Tutor Matemático Socrático
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-sm text-stone-700 leading-relaxed">
          <div className="p-3 bg-amber-50/80 border border-amber-200/80 rounded-xl">
            <p className="font-semibold text-amber-950 text-xs sm:text-sm mb-1">
              "No puedo enseñar nada a nadie, solo puedo hacerles pensar." — Sócrates
            </p>
            <p className="text-xs text-amber-900/80">
              Este tutor no es una calculadora de soluciones instantáneas. Es un maestro paciente diseñado para caminar a tu lado en el aprendizaje de cálculo y álgebra.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-sm">Paso 1 primero</span>
                <span className="text-xs text-stone-600">Al subir una foto o problema, el tutor identifica el ejercicio y te invita a dar únicamente el primer paso.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-sm">El botón mágico: "¿Por qué hicimos eso?"</span>
                <span className="text-xs text-stone-600">Si un paso parece sacado de la nada, presiona este botón y el tutor te explicará con analogías e intuición el concepto teórico detrás sin apresurarte.</span>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-stone-900 block text-sm">Validación compasiva</span>
                <span className="text-xs text-stone-600">Equivocarse es bienvenido. Cada intento tuyo es guiado con ternura para encontrar juntos la intuición matemática.</span>
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-stone-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-lg text-sm font-medium transition cursor-pointer"
          >
            Entendido, ¡vamos a aprender!
          </button>
        </div>
      </div>
    </div>
  );
};
