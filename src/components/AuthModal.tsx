import React, { useState } from 'react';
import { X, User, LogIn, Sparkles } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; isGuest: boolean; email?: string } | null;
  onLogin: (user: { name: string; isGuest: boolean; email?: string }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
}) => {
  const [name, setName] = useState(currentUser?.name === 'Invitado' ? '' : currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');

  if (!isOpen) return null;

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onLogin({
      name: name.trim(),
      email: email.trim() || undefined,
      isGuest: false,
    });
    onClose();
  };

  const handleContinueGuest = () => {
    onLogin({
      name: 'Invitado',
      isGuest: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-6 text-stone-100">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center text-amber-400 mb-3 shadow-inner">
            <User className="w-6 h-6" />
          </div>
          <h2 className="text-lg font-semibold text-stone-100">
            {currentUser?.isGuest ? 'Iniciar Sesión' : 'Tu Cuenta'}
          </h2>
          <p className="text-xs text-stone-400 mt-1">
            Personaliza tu nombre o continúa en modo invitado.
          </p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-3.5">
          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Tu Nombre
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Sofía, Carlos"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 text-stone-100 text-sm focus:outline-hidden transition"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-300 mb-1">
              Correo <span className="text-stone-500 font-normal">(opcional)</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@ejemplo.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-700 focus:border-amber-400 text-stone-100 text-sm focus:outline-hidden transition"
            />
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-white text-stone-950 font-semibold text-sm transition cursor-pointer disabled:opacity-50 mt-2 flex items-center justify-center space-x-2"
          >
            <LogIn className="w-4 h-4" />
            <span>Guardar e Iniciar Sesión</span>
          </button>
        </form>

        <div className="relative my-4 flex items-center justify-center">
          <div className="border-t border-stone-800 w-full" />
          <span className="bg-stone-900 px-3 text-[11px] text-stone-500 uppercase font-mono">o</span>
        </div>

        <button
          type="button"
          onClick={handleContinueGuest}
          className="w-full py-2.5 rounded-xl bg-stone-800 hover:bg-stone-750 text-stone-300 hover:text-stone-100 border border-stone-700 text-sm font-medium transition cursor-pointer"
        >
          Continuar como Invitado
        </button>
      </div>
    </div>
  );
};
