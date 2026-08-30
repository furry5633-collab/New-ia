import React, { useRef } from 'react';
import { Camera, Image as ImageIcon, HelpCircle, Sparkles } from 'lucide-react';
import { fileToProcessedImage, ProcessedImage } from '../utils/imageHelper';

interface AttachmentMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectImage: (image: ProcessedImage) => void;
  onOpenCamera: () => void;
  onQuickPrompt: (text: string) => void;
}

export const AttachmentMenu: React.FC<AttachmentMenuProps> = ({
  isOpen,
  onClose,
  onSelectImage,
  onOpenCamera,
  onQuickPrompt,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const processed = await fileToProcessedImage(file);
      onSelectImage(processed);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Error al procesar la imagen.');
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute bottom-14 left-2 z-40 w-64 bg-stone-900 border border-stone-800 rounded-2xl shadow-xl p-1.5 text-stone-200 animate-in fade-in slide-in-from-bottom-2 duration-150">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFile}
        />

        <button
          type="button"
          onClick={() => {
            fileInputRef.current?.click();
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-stone-800 text-left text-xs sm:text-sm font-medium transition cursor-pointer text-stone-200"
        >
          <ImageIcon className="w-4 h-4 text-emerald-400" />
          <span>Subir foto de ejercicio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenCamera();
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-stone-800 text-left text-xs sm:text-sm font-medium transition cursor-pointer text-stone-200"
        >
          <Camera className="w-4 h-4 text-blue-400" />
          <span>Hacer foto</span>
        </button>

        <div className="border-t border-stone-800 my-1" />

        <button
          type="button"
          onClick={() => {
            onQuickPrompt('¿Por qué hicimos eso? Por favor explícame la intuición conceptual detrás de este paso.');
            onClose();
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-stone-800 text-left text-xs sm:text-sm font-medium transition cursor-pointer text-amber-300"
        >
          <HelpCircle className="w-4 h-4 text-amber-400" />
          <span>Preguntar "¿Por qué?"</span>
        </button>

        <button
          type="button"
          onClick={() => {
            onQuickPrompt('Quiero resolver una integral por partes: \\int x e^{2x} dx');
            onClose();
          }}
          className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl hover:bg-stone-800 text-left text-xs sm:text-sm font-medium transition cursor-pointer text-stone-300"
        >
          <Sparkles className="w-4 h-4 text-purple-400" />
          <span>Ejemplo de Cálculo</span>
        </button>
      </div>
    </>
  );
};
