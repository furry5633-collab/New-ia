import React from 'react';
import { Plus } from 'lucide-react';
import { UserProfile } from '../types';
import { AILogo } from './AILogo';
import { getUserAvatarUrl } from '../utils/avatar';

interface MinimalHeaderProps {
  onNewChat: () => void;
  onOpenAuth: () => void;
  currentUser: UserProfile | null;
}

export const MinimalHeader: React.FC<MinimalHeaderProps> = ({
  onNewChat,
  onOpenAuth,
  currentUser,
}) => {
  const avatarUrl =
    currentUser?.avatarUrl || getUserAvatarUrl(currentUser?.email, currentUser?.name);

  return (
    <header className="h-14 bg-stone-950 border-b border-stone-900 px-4 sm:px-6 flex items-center justify-between text-stone-200 z-20 shrink-0 select-none">
      {/* Brand logo & title */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-inner">
          <AILogo className="w-5 h-5" />
        </div>
        <div className="flex items-center">
          <span className="font-semibold text-sm sm:text-base text-stone-100 tracking-tight">
            Math AI
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onNewChat}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 text-xs font-medium transition cursor-pointer shadow-xs"
          title="Nuevo chat"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Nuevo Chat</span>
        </button>

        <button
          onClick={onOpenAuth}
          className="flex items-center space-x-2 px-2.5 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-stone-100 border border-stone-800 text-xs font-medium transition cursor-pointer shadow-xs"
          title="Configurar perfil"
        >
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-5 h-5 rounded-full object-cover border border-stone-700 bg-stone-800"
            onError={(e) => {
              (e.target as HTMLElement).style.display = 'none';
            }}
          />
          <span className="max-w-[100px] truncate text-stone-200 font-medium">
            {currentUser ? currentUser.name : 'Invitado'}
          </span>
        </button>
      </div>
    </header>
  );
};
