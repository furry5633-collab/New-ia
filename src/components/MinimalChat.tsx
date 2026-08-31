import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowUp,
  X,
  HelpCircle,
} from 'lucide-react';
import { Message, UserProfile } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { AttachmentMenu } from './AttachmentMenu';
import { AILogo } from './AILogo';
import { ProcessedImage } from '../utils/imageHelper';
import { speakTutorText, stopSpeaking } from '../utils/speech';
import { getUserAvatarUrl } from '../utils/avatar';

export interface MinimalChatProps {
  messages: Message[];
  currentUser: UserProfile | null;
  onSendMessage: (text: string, image?: ProcessedImage) => void;
  isLoading: boolean;
  onOpenCamera: () => void;
  onSelectImage: (image: ProcessedImage) => void;
  attachedImage: ProcessedImage | null;
  onClearAttachedImage: () => void;
}

export const MinimalChat: React.FC<MinimalChatProps> = ({
  messages,
  currentUser,
  onSendMessage,
  isLoading,
  onOpenCamera,
  onSelectImage,
  attachedImage,
  onClearAttachedImage,
}) => {
  const [inputText, setInputText] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const userAvatar =
    currentUser?.avatarUrl || getUserAvatarUrl(currentUser?.email, currentUser?.name);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [inputText]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;

    onSendMessage(inputText.trim(), attachedImage || undefined);
    setInputText('');
    onClearAttachedImage();
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleSpeechToggle = (msgId: string, content: string) => {
    if (speakingId === msgId) {
      stopSpeaking();
      setSpeakingId(null);
    } else {
      setSpeakingId(msgId);
      speakTutorText(
        content,
        () => setSpeakingId(msgId),
        () => setSpeakingId(null),
        () => setSpeakingId(null)
      );
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleQuickPrompt = (prompt: string) => {
    setInputText(prompt);
    textareaRef.current?.focus();
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-stone-950 text-stone-100 relative">
      {/* Scrollable messages container */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center max-w-md mx-auto my-auto py-12 px-4 space-y-4 animate-in fade-in duration-300">
            <div className="w-14 h-14 rounded-2xl bg-stone-900 border border-stone-800 flex items-center justify-center shadow-lg">
              <AILogo className="w-9 h-9" />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-stone-100 tracking-tight">
              ¿Qué problema matemático resolveremos hoy?
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans">
              Escribe cualquier ejercicio o presiona el botón <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono text-xs">+</kbd> para adjuntar una foto o tomarla con tu cámara.
            </p>

            {/* Quick Starters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-4">
              <button
                onClick={() => handleQuickPrompt('Quiero resolver la integral por partes: \\int x e^{2x} dx')}
                className="p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left text-xs text-stone-300 hover:text-white transition cursor-pointer"
              >
                <span className="font-semibold block text-amber-400 mb-0.5">Cálculo Integral</span>
                <span>Resolver {"\\int x e^{2x} dx"}</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('¿Cómo calculo la derivada de f(x) = \\ln(\\cos(x^2))?')}
                className="p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left text-xs text-stone-300 hover:text-white transition cursor-pointer"
              >
                <span className="font-semibold block text-amber-400 mb-0.5">Regla de la Cadena</span>
                <span>Derivar {"f(x) = \\ln(\\cos(x^2))"}</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('Resuelve completando el cuadrado: 2x^2 - 8x + 3 = 0')}
                className="p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left text-xs text-stone-300 hover:text-white transition cursor-pointer"
              >
                <span className="font-semibold block text-amber-400 mb-0.5">Álgebra</span>
                <span>2x² - 8x + 3 = 0</span>
              </button>
              <button
                onClick={() => handleQuickPrompt('Evaluar el límite: \\lim_{x \\to 0} \\frac{\\sin(5x)}{x}')}
                className="p-3.5 rounded-xl bg-stone-900 hover:bg-stone-850 border border-stone-800 text-left text-xs text-stone-300 hover:text-white transition cursor-pointer"
              >
                <span className="font-semibold block text-amber-400 mb-0.5">Límites</span>
                <span>Límite {"\\lim_{x \\to 0} \\frac{\\sin(5x)}{x}"}</span>
              </button>
            </div>
          </div>
        ) : (
          messages.map((msg) => {
            const isTutor = msg.role === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-3.5 max-w-3xl mx-auto ${
                  isTutor ? 'justify-start' : 'justify-end'
                }`}
              >
                {/* AI Abstract Logo when AI speaks */}
                {isTutor && (
                  <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                    <AILogo className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`flex flex-col space-y-1.5 ${
                    isTutor ? 'max-w-[90%] sm:max-w-[85%]' : 'max-w-[85%] items-end'
                  }`}
                >
                  <div
                    className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      isTutor
                        ? 'bg-stone-900 border border-stone-850 text-stone-100 shadow-xs'
                        : 'bg-stone-800 text-stone-100 rounded-tr-xs'
                    }`}
                  >
                    {msg.image?.previewUrl && (
                      <div className="mb-2.5 rounded-xl overflow-hidden border border-stone-700 max-w-xs bg-black/40">
                        <img
                          src={msg.image.previewUrl}
                          alt="Foto del ejercicio"
                          className="w-full h-auto max-h-56 object-contain"
                        />
                      </div>
                    )}

                    {isTutor ? (
                      <div className="prose prose-invert prose-stone max-w-none text-stone-200">
                        <MathMarkdown content={msg.content} />
                      </div>
                    ) : (
                      <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
                    )}
                  </div>

                  {/* Actions for tutor message */}
                  {isTutor && (
                    <div className="flex items-center space-x-2 px-1 text-xs text-stone-400">
                      <button
                        onClick={() => handleSpeechToggle(msg.id, msg.content)}
                        className={`flex items-center space-x-1 px-2 py-1 rounded-md transition cursor-pointer ${
                          speakingId === msg.id
                            ? 'bg-amber-400/20 text-amber-300'
                            : 'hover:bg-stone-850 text-stone-400 hover:text-stone-200'
                        }`}
                        title={speakingId === msg.id ? 'Detener voz' : 'Escuchar en voz alta'}
                      >
                        {speakingId === msg.id ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{speakingId === msg.id ? 'Detener' : 'Voz'}</span>
                      </button>

                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-stone-850 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                        title="Copiar texto"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span className="text-[11px]">{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                      </button>

                      <button
                        onClick={() => handleQuickPrompt('¿Por qué hicimos eso? Por favor explícame la justificación matemática de este paso.')}
                        className="flex items-center space-x-1 px-2 py-1 rounded-md bg-stone-900 hover:bg-stone-850 border border-stone-800 text-amber-300 text-[11px] font-medium transition cursor-pointer ml-auto"
                      >
                        <HelpCircle className="w-3 h-3 text-amber-400" />
                        <span>¿Por qué hicimos eso?</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* User Avatar from Email */}
                {!isTutor && (
                  <div className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden bg-stone-800 shadow-xs">
                    <img
                      src={userAvatar}
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
              </div>
            );
          })
        )}

        {/* Loading / Generating State */}
        {isLoading && (
          <div className="flex gap-3.5 max-w-3xl mx-auto justify-start animate-in fade-in">
            <div className="w-8 h-8 rounded-xl bg-stone-900 border border-stone-800 flex items-center justify-center shrink-0 shadow-xs">
              <AILogo className="w-5 h-5 animate-pulse" />
            </div>
            <div className="bg-stone-900 border border-stone-850 rounded-2xl px-4 py-3 text-xs text-stone-400 flex items-center space-x-2">
              <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>Analizando el primer paso lógico...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Input Area - Minimalist ChatGPT Style */}
      <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-900 sticky bottom-0">
        <div className="max-w-3xl mx-auto relative">
          {/* Attachment Preview Chip */}
          {attachedImage && (
            <div className="mb-2 p-1.5 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between max-w-xs animate-in fade-in">
              <div className="flex items-center space-x-2">
                <img
                  src={attachedImage.previewUrl}
                  alt="Adjunto"
                  className="w-9 h-9 object-cover rounded-lg border border-stone-700"
                />
                <span className="text-xs text-stone-300 font-medium truncate">
                  Foto adjuntada
                </span>
              </div>
              <button
                onClick={onClearAttachedImage}
                className="p-1 text-stone-400 hover:text-stone-200 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Plus Menu Popup */}
          <AttachmentMenu
            isOpen={isMenuOpen}
            onClose={() => setIsMenuOpen(false)}
            onSelectImage={onSelectImage}
            onOpenCamera={onOpenCamera}
            onQuickPrompt={handleQuickPrompt}
          />

          {/* Main ChatGPT Input Bar */}
          <form
            onSubmit={handleSend}
            className="relative flex items-end rounded-2xl bg-stone-900 border border-stone-800 focus-within:border-stone-700 shadow-lg px-2 py-1.5 transition"
          >
            {/* Plus Button */}
            <button
              type="button"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer shrink-0"
              title="Adjuntar foto o acciones rápidas"
            >
              <Plus className="w-5 h-5" />
            </button>

            {/* Textarea */}
            <textarea
              ref={textareaRef}
              rows={1}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Escribe un mensaje..."
              className="w-full px-3 py-2 bg-transparent text-stone-100 placeholder-stone-500 text-sm focus:outline-hidden resize-none max-h-44 min-h-[36px]"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputText.trim() && !attachedImage)}
              className="p-2 rounded-xl bg-stone-100 hover:bg-white text-stone-950 disabled:bg-stone-800 disabled:text-stone-600 transition shrink-0 cursor-pointer disabled:cursor-not-allowed"
              title="Enviar"
            >
              <ArrowUp className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          <p className="text-[11px] text-stone-500 text-center mt-2 font-sans">
            Math AI • Guiado paso a paso para cálculo, álgebra y matemáticas
          </p>
        </div>
      </div>
    </div>
  );
};
