import React, { useState } from 'react';
import { Volume2, VolumeX, Copy, Check, User, Sparkles, HelpCircle } from 'lucide-react';
import { Message } from '../types';
import { MathMarkdown } from './MathMarkdown';
import { speakTutorText, stopSpeaking, isSpeakingActive } from '../utils/speech';

interface ChatMessageProps {
  message: Message;
  onSuggestionClick?: (suggestion: string) => void;
  onAskWhy?: () => void;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onSuggestionClick,
  onAskWhy,
}) => {
  const isTeacher = message.role === 'assistant';
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
    } else {
      setIsSpeaking(true);
      speakTutorText(
        message.content,
        () => setIsSpeaking(true),
        () => setIsSpeaking(false),
        () => setIsSpeaking(false)
      );
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`group relative flex flex-col my-4 transition-all duration-200 ${
        isTeacher ? 'items-start' : 'items-end'
      }`}
    >
      <div
        className={`flex items-start gap-3 max-w-[92%] sm:max-w-[85%] md:max-w-[80%] ${
          isTeacher ? 'flex-row' : 'flex-row-reverse'
        }`}
      >
        {/* Avatar */}
        <div
          className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
            isTeacher
              ? 'bg-gradient-to-br from-amber-500 to-amber-700 text-stone-950 font-bold border border-amber-400/40'
              : 'bg-stone-800 text-stone-200 border border-stone-700'
          }`}
        >
          {isTeacher ? <Sparkles className="w-5 h-5 text-amber-100" /> : <User className="w-5 h-5" />}
        </div>

        {/* Message Bubble Container */}
        <div className="flex flex-col space-y-1.5 flex-1 min-w-0">
          {/* Header info */}
          <div
            className={`flex items-center space-x-2 text-xs text-stone-400 px-1 ${
              isTeacher ? 'justify-start' : 'justify-end'
            }`}
          >
            <span className="font-medium text-stone-700">
              {isTeacher ? 'Maestro Sócrates (Tutor)' : 'Tú (Estudiante)'}
            </span>
            {message.actionType === 'why' && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-semibold text-[11px] border border-amber-200 flex items-center gap-1">
                <HelpCircle className="w-3 h-3" />
                Explicación Conceptual "¿Por qué?"
              </span>
            )}
            {message.actionType === 'hint' && (
              <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-900 font-semibold text-[11px] border border-blue-200">
                Pista Orientadora
              </span>
            )}
            {message.actionType === 'next_step' && (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 font-semibold text-[11px] border border-emerald-200">
                Siguiente Paso
              </span>
            )}
          </div>

          {/* Bubble content */}
          <div
            className={`relative rounded-2xl p-4 sm:p-5 shadow-sm transition-all ${
              isTeacher
                ? 'bg-white border border-stone-200/90 text-stone-800 rounded-tl-sm'
                : 'bg-amber-600 text-white rounded-tr-sm shadow-md'
            }`}
          >
            {/* Attached image preview if user uploaded one in this turn */}
            {message.image?.previewUrl && (
              <div className="mb-3 rounded-xl overflow-hidden border border-white/20 max-w-sm bg-black/10">
                <img
                  src={message.image.previewUrl}
                  alt="Foto del ejercicio matemático"
                  className="w-full h-auto max-h-64 object-contain"
                />
              </div>
            )}

            {/* Markdown & Math text */}
            {isTeacher ? (
              <MathMarkdown content={message.content} />
            ) : (
              <div className="text-[15px] leading-relaxed whitespace-pre-wrap font-sans text-white">
                {message.content}
              </div>
            )}

            {/* Teacher Controls (Listen voice, copy) */}
            {isTeacher && (
              <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleToggleSpeech}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isSpeaking
                        ? 'bg-amber-100 text-amber-800 font-medium animate-pulse'
                        : 'hover:bg-stone-100 text-stone-600'
                    }`}
                    title={isSpeaking ? 'Detener voz' : 'Escuchar explicación en voz alta'}
                  >
                    {isSpeaking ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    <span>{isSpeaking ? 'Detener' : 'Escuchar voz'}</span>
                  </button>

                  <button
                    onClick={handleCopy}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg hover:bg-stone-100 text-stone-600 transition cursor-pointer"
                    title="Copiar texto"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>

                {onAskWhy && (
                  <button
                    onClick={onAskWhy}
                    className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 font-medium transition cursor-pointer"
                    title="Preguntar por qué hicimos este paso"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                    <span>¿Por qué hicimos eso?</span>
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Teacher Suggested Responses Chips */}
          {isTeacher && message.suggestions && message.suggestions.length > 0 && onSuggestionClick && (
            <div className="pt-2 flex flex-wrap gap-1.5 px-1">
              <span className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider self-center mr-1">
                Puedes responder:
              </span>
              {message.suggestions.map((sug, idx) => (
                <button
                  key={idx}
                  onClick={() => onSuggestionClick(sug)}
                  className="text-xs px-2.5 py-1 rounded-full bg-stone-100 hover:bg-amber-100 text-stone-700 hover:text-amber-900 border border-stone-200 hover:border-amber-300 transition cursor-pointer text-left"
                >
                  {sug}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
