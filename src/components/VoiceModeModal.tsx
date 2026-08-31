import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';
import {
  X,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Square,
  Sparkles,
  RotateCcw,
  Send,
} from 'lucide-react';
import mathAiLogo from '../assets/images/math_ai_logo_1788166806106.jpg';
import { MathMarkdown } from './MathMarkdown';

interface VoiceModeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSendQuery: (text: string, signal?: AbortSignal) => Promise<string>;
  userName?: string;
}

type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

export const VoiceModeModal: React.FC<VoiceModeModalProps> = ({
  isOpen,
  onClose,
  onSendQuery,
  userName = 'Estudiante',
}) => {
  const [voiceState, setVoiceState] = useState<VoiceState>('listening');
  const [transcript, setTranscript] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('');
  const [isAudioMuted, setIsAudioMuted] = useState<boolean>(false);
  const [isMicMuted, setIsMicMuted] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const recognitionRef = useRef<any>(null);
  const isMountedRef = useRef<boolean>(true);
  const silenceTimerRef = useRef<any>(null);
  const latestTranscriptRef = useRef<string>('');
  const voiceStateRef = useRef<VoiceState>('listening');
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sync ref with state
  useEffect(() => {
    voiceStateRef.current = voiceState;
  }, [voiceState]);

  // Motion physics for slime stretch effect
  const dragX = useMotionValue(0);
  const dragY = useMotionValue(0);

  // Dynamic scale stretching based on drag distance
  const stretchScaleX = useTransform(dragX, [-140, 0, 140], [1.3, 1, 1.3]);
  const stretchScaleY = useTransform(dragY, [-140, 0, 140], [1.3, 1, 1.3]);
  const slimeRotate = useTransform(dragX, [-140, 140], [-15, 15]);

  // Clean voice synthesis helper
  const speakText = (text: string) => {
    if (!('speechSynthesis' in window) || isAudioMuted) {
      setVoiceState('idle');
      return;
    }

    window.speechSynthesis.cancel();

    // Natural Spanish pronunciation for mathematics and text
    const clean = text
      .replace(/\$\$[\s\S]*?\$\$/g, (match) => {
        return ' ' + match
          .replace(/\$\$/g, '')
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
          .replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1')
          .replace(/\\sqrt\[3\]\{([^}]+)\}/g, 'raíz cúbica de $1')
          .replace(/\\cdot/g, ' por ')
          .replace(/\\times/g, ' por ')
          .replace(/\\pm/g, ' más o menos ')
          .replace(/\\leq?/g, ' menor o igual que ')
          .replace(/\\geq?/g, ' mayor o igual que ')
          .replace(/\\neq/g, ' distinto de ')
          .replace(/\\approx/g, ' aproximadamente ')
          .replace(/\\int/g, ' integral ')
          .replace(/\^2/g, ' al cuadrado ')
          .replace(/\^3/g, ' al cubo ')
          .replace(/\^\{([^}]+)\}/g, ' elevado a $1 ')
          .replace(/\^([0-9a-zA-Z])/g, ' elevado a $1 ')
          .replace(/=/g, ' es igual a ')
          + ' ';
      })
      .replace(/\$([^\$]+)\$/g, (_, mathPart) => {
        return ' ' + mathPart
          .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
          .replace(/\\sqrt\{([^}]+)\}/g, 'raíz de $1')
          .replace(/\\cdot/g, ' por ')
          .replace(/\\times/g, ' por ')
          .replace(/\\pm/g, ' más o menos ')
          .replace(/\^2/g, ' al cuadrado ')
          .replace(/\^3/g, ' al cubo ')
          .replace(/=/g, ' es igual a ')
          + ' ';
      })
      .replace(/[#*`_~>]/g, '')
      .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
      .replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1')
      .replace(/\\cdot/g, ' por ')
      .replace(/\\times/g, ' por ')
      .replace(/\\pm/g, ' más o menos ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!clean) {
      setVoiceState('idle');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = 'es-ES';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    // Pick a natural sounding Spanish voice if available
    const voices = window.speechSynthesis.getVoices();
    const spanishVoice = voices.find(
      (v) =>
        v.lang.startsWith('es') &&
        (v.name.includes('Natural') ||
          v.name.includes('Google') ||
          v.name.includes('Mónica') ||
          v.name.includes('Jorge') ||
          v.name.includes('Paulina') ||
          v.name.includes('Lucia'))
    ) || voices.find((v) => v.lang.startsWith('es'));

    if (spanishVoice) {
      utterance.voice = spanishVoice;
    }

    utterance.onstart = () => {
      if (isMountedRef.current) setVoiceState('speaking');
    };

    utterance.onend = () => {
      if (isMountedRef.current) {
        setVoiceState('idle');
      }
    };

    utterance.onerror = () => {
      if (isMountedRef.current) setVoiceState('idle');
    };

    window.speechSynthesis.speak(utterance);
  };

  // Clear any existing silence countdown
  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  // Process question with AI
  const processVoiceQuestion = async (queryText: string) => {
    const cleanQuery = queryText.trim();
    if (!cleanQuery) return;

    clearSilenceTimer();

    // Stop recognition immediately
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    // Abort previous in-flight requests if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setVoiceState('processing');
    setAiResponse('');
    setErrorMessage('');

    try {
      const response = await onSendQuery(cleanQuery, controller.signal);

      if (controller.signal.aborted) {
        return;
      }

      if (isMountedRef.current) {
        if (response && response.trim().length > 0) {
          setAiResponse(response);
          setVoiceState('speaking');
          speakText(response);
        } else {
          setVoiceState('idle');
        }
      }
    } catch (err: any) {
      const isAborted =
        controller.signal.aborted ||
        err?.name === 'AbortError' ||
        (typeof err?.message === 'string' && err.message.toLowerCase().includes('abort'));

      if (isAborted) {
        // Interrupted cleanly by user: do not show any error
        if (isMountedRef.current) {
          setVoiceState('idle');
          setErrorMessage('');
        }
        return;
      }

      if (isMountedRef.current) {
        setErrorMessage(err?.message || 'Hubo un error al procesar tu consulta.');
        setVoiceState('idle');
      }
    } finally {
      if (abortControllerRef.current === controller) {
        abortControllerRef.current = null;
      }
    }
  };

  // Start speech recognition with 1.4s automatic silence detection
  const startListening = () => {
    clearSilenceTimer();
    window.speechSynthesis?.cancel();
    setAiResponse('');
    setTranscript('');
    latestTranscriptRef.current = '';
    setErrorMessage('');

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage('Tu navegador no soporta reconocimiento de voz por micrófono.');
      setVoiceState('idle');
      return;
    }

    try {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }

      const recognition = new SpeechRecognition();
      recognition.lang = 'es-ES';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        if (isMountedRef.current) {
          setVoiceState('listening');
          setIsMicMuted(false);
        }
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          const text = res[0]?.transcript || '';
          if (res.isFinal) {
            finalTranscript += text + ' ';
          } else {
            // For interim results, assign directly to prevent duplicating intermediate snapshots
            interimTranscript = text;
          }
        }

        const combined = (finalTranscript + ' ' + interimTranscript)
          .replace(/\s+/g, ' ')
          .trim();

        if (!combined) return;

        if (isMountedRef.current) {
          setTranscript(combined);
        }
        latestTranscriptRef.current = combined;

        // Reset the 1.4s silence timer on every new speech chunk
        clearSilenceTimer();
        if (combined.length > 0 && voiceStateRef.current === 'listening') {
          silenceTimerRef.current = setTimeout(() => {
            if (isMountedRef.current && voiceStateRef.current === 'listening') {
              const textToSend = latestTranscriptRef.current;
              if (textToSend.length > 0) {
                processVoiceQuestion(textToSend);
              }
            }
          }, 1400); // Exact 1.4 seconds of silence
        }
      };

      recognition.onspeechend = () => {
        // When speech ends, ensure 1.4s silence timer handles the transition
        if (latestTranscriptRef.current.length > 0 && voiceStateRef.current === 'listening') {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              if (isMountedRef.current && voiceStateRef.current === 'listening') {
                const textToSend = latestTranscriptRef.current;
                if (textToSend.length > 0) {
                  processVoiceQuestion(textToSend);
                }
              }
            }, 1400);
          }
        }
      };

      recognition.onend = () => {
        // If recognition closed while listening:
        if (isMountedRef.current && voiceStateRef.current === 'listening') {
          if (latestTranscriptRef.current.length > 0) {
            // If user has spoken something and mic stopped, process the question
            processVoiceQuestion(latestTranscriptRef.current);
          } else if (!isMicMuted) {
            // If user hasn't spoken yet, restart recognition cleanly
            try {
              if (recognitionRef.current) {
                recognitionRef.current = null;
              }
              if (isMountedRef.current && voiceStateRef.current === 'listening') {
                startListening();
              }
            } catch {
              setVoiceState('idle');
            }
          } else {
            setVoiceState('idle');
          }
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        if (event.error === 'not-allowed') {
          setErrorMessage('Permiso de micrófono denegado. Permite el acceso al micrófono en tu navegador.');
          setIsMicMuted(true);
          setVoiceState('idle');
        } else if (event.error === 'no-speech') {
          // Normal timeout with no speech, continue listening
        } else if (event.error !== 'aborted') {
          if (isMountedRef.current && voiceStateRef.current === 'listening' && !latestTranscriptRef.current) {
            setVoiceState('idle');
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      console.warn('Speech error:', err);
      setVoiceState('idle');
    }
  };

  // Immediate Interruption Control: Stops active request / speech without leaving errors
  const stopCurrentAction = () => {
    clearSilenceTimer();

    // Abort active fetch request immediately
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }

    // Cancel speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    // Stop microphone recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        // ignore
      }
    }

    // Reset state cleanly without any error
    setErrorMessage('');
    setVoiceState('idle');
  };

  // Toggle mic
  const toggleMic = () => {
    if (voiceState === 'listening') {
      stopCurrentAction();
      setIsMicMuted(true);
    } else {
      setIsMicMuted(false);
      startListening();
    }
  };

  // Toggle audio output
  const toggleAudioOutput = () => {
    if (!isAudioMuted) {
      window.speechSynthesis?.cancel();
      setIsAudioMuted(true);
      if (voiceState === 'speaking') {
        setVoiceState('idle');
      }
    } else {
      setIsAudioMuted(false);
      if (aiResponse) {
        speakText(aiResponse);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;
    if (isOpen) {
      startListening();
    } else {
      stopCurrentAction();
    }

    return () => {
      isMountedRef.current = false;
      clearSilenceTimer();
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
        abortControllerRef.current = null;
      }
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-stone-950/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-8 select-none overflow-hidden"
      >
        {/* Ambient Background Gradients */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-[32rem] h-[32rem] bg-orange-600/10 rounded-full blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.05)_0,transparent_70%)]" />
        </div>

        {/* TOP BAR */}
        <div className="relative z-10 flex items-center justify-between max-w-4xl mx-auto w-full">
          <div className="flex items-center space-x-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold uppercase tracking-wider text-stone-300">
              Modo Voz • Math AI
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={toggleAudioOutput}
              className={`p-2.5 rounded-full border transition cursor-pointer ${
                isAudioMuted
                  ? 'bg-red-500/10 border-red-500/30 text-red-400'
                  : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white'
              }`}
              title={isAudioMuted ? 'Activar voz del tutor' : 'Silenciar voz del tutor'}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                stopCurrentAction();
                onClose();
              }}
              className="p-2.5 rounded-full bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition cursor-pointer"
              title="Cerrar modo de voz"
            >
              <X className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* CENTER STAGE: SLIME LOGO & ANIMATED RESOLUTION LIGHT BAR */}
        <div className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-2xl mx-auto w-full px-4 text-center my-4">
          <div className="relative flex items-center justify-center min-h-[260px] sm:min-h-[300px]">
            {/* AMBIENT PULSING RINGS WHEN LISTENING OR SPEAKING */}
            {voiceState === 'listening' && (
              <motion.div
                animate={{
                  scale: [1, 1.25, 1.45, 1],
                  opacity: [0.6, 0.3, 0, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 2.2,
                  ease: 'easeInOut',
                }}
                className="absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-amber-500/40 bg-amber-500/5 pointer-events-none"
              />
            )}

            {voiceState === 'speaking' && (
              <>
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.7, 0.2, 0.7],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.5,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-56 h-56 sm:w-72 sm:h-72 rounded-full border border-orange-500/50 bg-gradient-to-r from-amber-500/10 to-orange-500/10 pointer-events-none"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.8, 0.4, 0.8],
                  }}
                  transition={{
                    repeat: Infinity,
                    duration: 0.8,
                    ease: 'easeInOut',
                  }}
                  className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border-2 border-amber-400/60 pointer-events-none"
                />
              </>
            )}

            {/* RESOLUTION STATE: ANIMATED LIGHT BAR WITH SLIDING GLOW */}
            <AnimatePresence mode="wait">
              {voiceState === 'processing' ? (
                <motion.div
                  key="processing-beam"
                  initial={{ opacity: 0, scale: 0.85, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.85, y: -10 }}
                  transition={{ duration: 0.25 }}
                  className="flex flex-col items-center justify-center space-y-7"
                >
                  {/* Glowing flowing luminous track / light bar */}
                  <div className="relative w-72 sm:w-96 h-4 bg-stone-900/95 rounded-full overflow-hidden border border-amber-500/40 shadow-[0_0_35px_rgba(245,158,11,0.35)] p-0.5">
                    {/* Sliding luminous gradient color beam */}
                    <motion.div
                      animate={{
                        x: ['-100%', '220%'],
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.1,
                        ease: 'easeInOut',
                      }}
                      className="w-1/2 h-full rounded-full bg-gradient-to-r from-amber-400 via-orange-500 to-amber-300 shadow-[0_0_20px_#f59e0b]"
                    />
                  </div>

                  {/* Sparkling status indicator */}
                  <div className="flex items-center space-x-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-semibold tracking-wider text-amber-300 uppercase shadow-sm">
                    <Sparkles className="w-4 h-4 animate-spin text-amber-400" />
                    <span>Resolviendo problema matemático...</span>
                  </div>
                </motion.div>
              ) : (
                /* INTERACTIVE SLIME LOGO CIRCLE */
                <motion.div
                  key="interactive-slime-logo"
                  drag
                  dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                  dragElastic={0.5}
                  dragTransition={{ bounceStiffness: 450, bounceDamping: 14 }}
                  style={{
                    x: dragX,
                    y: dragY,
                    scaleX: stretchScaleX,
                    scaleY: stretchScaleY,
                    rotate: slimeRotate,
                  }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ cursor: 'grabbing', scale: 0.95 }}
                  className="relative w-40 h-40 sm:w-48 sm:h-48 rounded-full cursor-grab active:cursor-grabbing select-none shadow-2xl flex items-center justify-center p-2.5 bg-gradient-to-br from-stone-900 via-stone-950 to-stone-900 border-2 border-amber-500/40 hover:border-amber-400 group transition-colors"
                >
                  {/* Liquid Slime Glow Overlay */}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-amber-400/20 via-orange-500/10 to-transparent pointer-events-none" />

                  {/* Logo Image in Circular Slime Frame */}
                  <div className="w-full h-full rounded-full overflow-hidden border border-stone-800 shadow-inner bg-stone-950 flex items-center justify-center pointer-events-none">
                    <img
                      src={mathAiLogo}
                      alt="Math AI Tutor Logo"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </div>

                  {/* Small hint label when dragging */}
                  <div className="absolute -bottom-7 opacity-0 group-hover:opacity-60 transition text-[10px] text-stone-400 tracking-wider font-sans whitespace-nowrap pointer-events-none">
                    Arrastra o estira como un slime ✨
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* STATUS LABEL & LIVE TRANSCRIPT */}
          <div className="mt-6 space-y-2 w-full max-w-lg">
            <div className="text-sm font-semibold text-stone-200 flex items-center justify-center gap-2">
              {voiceState === 'listening' && (
                <span className="text-amber-400 flex items-center gap-1.5 animate-pulse">
                  <Mic className="w-4 h-4" />
                  Te escucho, {userName}...
                </span>
              )}
              {voiceState === 'processing' && (
                <span className="text-amber-300">Pensando y estructurando la explicación...</span>
              )}
              {voiceState === 'speaking' && (
                <span className="text-orange-400 flex items-center gap-1.5">
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  Math AI explicando:
                </span>
              )}
              {voiceState === 'idle' && (
                <span className="text-stone-400">Pulsa el micrófono para hablar</span>
              )}
            </div>

            {/* LIVE USER TRANSCRIPT */}
            {transcript && voiceState === 'listening' && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-stone-900/80 border border-stone-800 rounded-xl text-stone-100 text-sm italic font-sans"
              >
                "{transcript}"
              </motion.div>
            )}

            {/* ERROR MESSAGE (ONLY IF NOT AN INTENTIONAL STOP) */}
            {errorMessage && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-300 text-xs rounded-xl">
                {errorMessage}
              </div>
            )}

            {/* AI LIVE EXPLANATION VIEW WITH MATH FORMULAS */}
            {aiResponse && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-h-52 sm:max-h-60 overflow-y-auto p-4 bg-stone-900/90 border border-stone-800/90 rounded-2xl text-left shadow-lg text-xs leading-relaxed"
              >
                <MathMarkdown content={aiResponse} />
              </motion.div>
            )}
          </div>
        </div>

        {/* BOTTOM CONTROLS */}
        <div className="relative z-10 max-w-xl mx-auto w-full">
          <div className="flex items-center justify-center space-x-4">
            {/* MIC BUTTON / TOGGLE */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={toggleMic}
              className={`p-4 rounded-full shadow-xl transition cursor-pointer flex items-center justify-center ${
                voiceState === 'listening'
                  ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/30'
                  : 'bg-stone-900 text-stone-100 border border-stone-800 hover:border-amber-400/50'
              }`}
              title={voiceState === 'listening' ? 'Pausar micrófono' : 'Hablar'}
            >
              {voiceState === 'listening' ? (
                <Mic className="w-6 h-6 animate-pulse" />
              ) : (
                <MicOff className="w-6 h-6 text-stone-400" />
              )}
            </motion.button>

            {/* STOP / CANCEL ACTION BUTTON (SQUARE) */}
            {(voiceState === 'processing' || voiceState === 'speaking' || transcript || voiceState === 'listening') && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={stopCurrentAction}
                className="p-3.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition cursor-pointer"
                title="Detener petición"
              >
                <Square className="w-5 h-5 fill-current" />
              </motion.button>
            )}

            {/* REPEAT / REPLAY SPEECH BUTTON */}
            {aiResponse && voiceState === 'idle' && (
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => speakText(aiResponse)}
                className="p-3.5 rounded-full bg-stone-900 border border-stone-800 text-stone-300 hover:text-white transition cursor-pointer"
                title="Volver a escuchar explicación"
              >
                <RotateCcw className="w-5 h-5" />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

