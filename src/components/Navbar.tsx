import React from 'react';
import { Sparkles, BookOpen, PlusCircle, HelpCircle, GraduationCap } from 'lucide-react';

interface NavbarProps {
  onNewProblem: () => void;
  onOpenSamples: () => void;
  onOpenInfo: () => void;
  activeTopic?: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewProblem,
  onOpenSamples,
  onOpenInfo,
  activeTopic,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-stone-900 border-b border-stone-800 text-stone-100 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left branding */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center shadow-inner text-white font-bold text-lg">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-stone-100 text-base sm:text-lg tracking-tight">
                Tutor Socrático
              </span>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Método Socrático
              </span>
            </div>
            <p className="text-xs text-stone-400 font-sans hidden sm:block">
              {activeTopic ? `Tema: ${activeTopic}` : 'Guía compasiva paso a paso para cálculo y álgebra'}
            </p>
          </div>
        </div>

        {/* Right actions */}
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            id="btn-sample-problems"
            onClick={onOpenSamples}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 transition cursor-pointer"
            title="Explorar problemas de ejemplo"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
            <span>Ejemplos</span>
          </button>

          <button
            id="btn-new-session"
            onClick={onNewProblem}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium bg-amber-500 hover:bg-amber-600 text-stone-950 font-semibold shadow-sm transition cursor-pointer"
            title="Nuevo problema matemático"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden xs:inline">Nuevo Ejercicio</span>
            <span className="xs:hidden">Nuevo</span>
          </button>

          <button
            id="btn-about-info"
            onClick={onOpenInfo}
            className="p-2 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition cursor-pointer"
            title="Acerca de este tutor socrático"
          >
            <HelpCircle className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};
