import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { motion, AnimatePresence } from 'motion/react';
import {
  Plus,
  Volume2,
  VolumeX,
  Copy,
  Check,
  ArrowUp,
  ArrowRight,
  ArrowLeft,
  X,
  Camera,
  Image as ImageIcon,
  Menu,
  SquarePen,
  Trash2,
  User,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  Sparkle,
  Monitor,
  List,
  Pencil,
  GraduationCap,
  Mail,
  ShieldCheck,
  Award,
  Upload,
  Search,
} from 'lucide-react';
import { AVATAR_OPTIONS, AVATAR_CATEGORIES, AvatarOption } from './data/avatars';
import { AvatarCropModal } from './components/AvatarCropModal';
import mathAiLogo from './assets/images/math_ai_logo_1788166806106.jpg';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: {
    mimeType: string;
    data: string;
    previewUrl?: string;
  };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: Message[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  gradeLevel: string;
  savedAt: number;
  isRegistered: boolean;
}

export interface ProcessedImage {
  data: string;
  mimeType: string;
  previewUrl: string;
}

export interface ExerciseCardItem {
  id: string;
  title: string;
  content: string;
}

const CURRENT_USER_SESSION = 'math_ai_active_user_session_v4';

const GRADE_OPTIONS = [
  '6º de Primaria',
  '1º de ESO (Secundaria)',
  '2º de ESO (Secundaria)',
  '3º de ESO (Secundaria)',
  '4º de ESO (Secundaria)',
  '1º de Bachillerato',
  '2º de Bachillerato',
  'Universidad / Superior',
];

function isMathQuestion(text: string, hasImage: boolean): boolean {
  if (hasImage) return true;
  const clean = text.toLowerCase().trim();
  const mathPatterns = [
    /\d+/,
    /[+\-*\/=^√%<>≤≥]/,
    /sum[ar]|rest[ar]|multiplic[ar]|divid[ir]|calcul[ar]|raiz|fraccion|porcentaj|ecuacion|resolver|cuanto es|resultado|area|perimetro|volumen|x\s*=|y\s*=|seno|coseno|tangente|algebra|geometria|angulo|hipotenusa|cateto|polinomio|integral|derivada/i,
  ];
  return mathPatterns.some((pattern) => pattern.test(clean));
}

function speakTutorText(text: string, onStart?: () => void, onEnd?: () => void, onError?: () => void) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();

  const clean = text
    .replace(/\$\$[\s\S]*?\$\$/g, ' fórmula matemática ')
    .replace(/\$[^\$]+\$/g, ' expresión matemática ')
    .replace(/[#*`_~]/g, '')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
    .replace(/\\sqrt\{([^}]+)\}/g, 'raíz de $1')
    .trim();

  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = 'es-ES';
  utterance.rate = 1.05;

  utterance.onstart = () => onStart?.();
  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onError?.();

  window.speechSynthesis.speak(utterance);
}

function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}

async function processImageFile(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64Data = result.split(',')[1];
      resolve({
        data: base64Data,
        mimeType: file.type || 'image/jpeg',
        previewUrl: result,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function generateTitleFromText(text: string): string {
  if (!text) return 'Página de Ejercicios';
  const clean = text
    .replace(/[\$#*`_]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  if (clean.length === 0) return 'Operaciones';
  const firstLine = clean.split('\n')[0];
  if (firstLine.length > 28) {
    return firstLine.substring(0, 26) + '...';
  }
  return firstLine;
}

// Multi-exercise chunks extractor
function parseMultipleExercises(content: string): ExerciseCardItem[] | null {
  if (!content) return null;

  const headerRegex = /(?:^|\n)(?:###?\s*|\*\*\s*|\b)(?:Operación|Ejercicio|Problema|Apartado|Caso)?\s*(?:[0-9]{1,2}[\.\)]|[a-zA-Z][\.\)]|\b[0-9]{1,2}\b\s*[-–—:]|\([0-9a-zA-Z]\))(?:\s*[:\.\-–—]|\s*\*\*)?/gi;
  const matches = [...content.matchAll(headerRegex)];

  if (matches.length >= 2) {
    const cards: ExerciseCardItem[] = [];
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      const start = match.index! + match[0].length;
      const end = i + 1 < matches.length ? matches[i + 1].index! : content.length;

      const rawHeader = match[0]
        .replace(/[\n#*]/g, '')
        .replace(/^[-\s:]+/, '')
        .trim();

      const chunk = content.substring(start, end).trim();

      if (chunk.length > 0) {
        cards.push({
          id: `card_${i}_${rawHeader}`,
          title: rawHeader || `Operación ${i + 1}`,
          content: chunk,
        });
      }
    }

    if (cards.length >= 2) {
      return cards;
    }
  }

  const lines = content.split('\n');
  const sections: { title: string; lines: string[] }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    const m = line.match(/^([0-9]{1,2}[\.\)]|[a-dA-D][\.\)]|\b[0-9]{1,2}\s*[-–—])\s*(.*)/);
    if (m) {
      if (current && current.lines.length > 0) sections.push(current);
      current = {
        title: m[1].replace(/[\.\)-]/g, '').trim(),
        lines: [m[2] || ''],
      };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current && current.lines.length > 0) sections.push(current);

  if (sections.length >= 2) {
    return sections.map((sec, idx) => ({
      id: `sec_${idx}`,
      title: `Operación ${sec.title || idx + 1}`,
      content: sec.lines.join('\n').trim(),
    }));
  }

  return null;
}

function MathAILogo({ className = 'w-6 h-6', rounded = 'rounded-lg' }: { className?: string; rounded?: string }) {
  return (
    <div className={`overflow-hidden inline-flex items-center justify-center bg-stone-900 border border-stone-800 shadow-xs shrink-0 select-none ${rounded} ${className}`}>
      <img
        src={mathAiLogo}
        alt="Math AI Logo"
        className="w-full h-full object-cover"
        referrerPolicy="no-referrer"
      />
    </div>
  );
}

function MathMarkdown({ content }: { content: string }) {
  return (
    <div className="math-markdown leading-relaxed text-sm break-words overflow-x-auto">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0 break-words leading-relaxed">{children}</p>,
          ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-0.5">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-0.5">{children}</ol>,
          li: ({ children }) => <li className="text-stone-200">{children}</li>,
          h1: ({ children }) => <h1 className="text-sm font-bold text-amber-300 mb-1.5 mt-2">{children}</h1>,
          h2: ({ children }) => <h2 className="text-xs font-bold text-amber-200 mb-1.5 mt-2">{children}</h2>,
          h3: ({ children }) => <h3 className="text-xs font-bold text-stone-200 mb-1 mt-1.5">{children}</h3>,
          strong: ({ children }) => <strong className="font-semibold text-amber-300">{children}</strong>,
          code: ({ children, className }) => {
            const isInline = !className;
            return isInline ? (
              <code className="px-1 py-0.5 rounded bg-stone-800 text-amber-300 font-mono text-xs border border-stone-700">
                {children}
              </code>
            ) : (
              <code className="block p-2 rounded-xl bg-stone-950 text-stone-200 font-mono text-xs border border-stone-800 overflow-x-auto my-1.5 max-w-full">
                {children}
              </code>
            );
          },
          blockquote: ({ children }) => (
            <div className="border-l-3 border-amber-500 pl-2.5 py-1.5 text-stone-100 my-2 bg-amber-500/10 rounded-r-lg border-y border-r border-amber-500/20 shadow-xs text-xs">
              {children}
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

// "Pantallitas" Miniature Monitors Grid
function MultiExerciseScreens({ cards }: { cards: ExerciseCardItem[] }) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const count = cards.length;

  const gridClass =
    count === 2
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 my-2'
      : count === 3
      ? 'grid grid-cols-1 sm:grid-cols-3 gap-3 my-2'
      : count === 4
      ? 'grid grid-cols-1 sm:grid-cols-2 gap-3 my-2'
      : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 my-2';

  const copyCard = (idx: number, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full my-2 space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
          <Monitor className="w-3.5 h-3.5" />
          {count} Operaciones Resueltas ({count} Pantallitas)
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 font-mono border border-amber-500/30">
          Modo Dividido Activo
        </span>
      </div>

      <div className={gridClass}>
        {cards.map((card, idx) => (
          <motion.div
            key={card.id || idx}
            initial={{ opacity: 0, scale: 0.94, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.08 }}
            whileHover={{ scale: 1.015 }}
            className="rounded-2xl p-3 bg-stone-950 border border-stone-800 hover:border-amber-500/50 transition-colors duration-200 shadow-lg flex flex-col justify-between overflow-hidden relative group"
          >
            <div className="flex items-center justify-between border-b border-stone-850 pb-2 mb-2">
              <div className="flex items-center space-x-1.5 truncate">
                <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-300 flex items-center justify-center text-[11px] font-mono font-bold border border-amber-500/40 shrink-0">
                  {idx + 1}
                </span>
                <span className="text-xs font-bold text-amber-200 truncate">
                  {card.title || `Operación ${idx + 1}`}
                </span>
              </div>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={() => copyCard(idx, card.content)}
                className="p-1 rounded-md text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
                title="Copiar resultado"
              >
                {copiedIndex === idx ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </motion.button>
            </div>

            <div className="text-xs leading-relaxed text-stone-200 overflow-x-auto">
              <MathMarkdown content={card.content} />
            </div>

            <div className="mt-2.5 pt-1.5 border-t border-stone-900 flex items-center justify-between text-[10px] text-stone-500 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Completado
              </span>
              <span>Pantalla {idx + 1} de {count}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  // Check if active user is saved
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    try {
      const activeSession = localStorage.getItem(CURRENT_USER_SESSION);
      if (activeSession) {
        const parsed = JSON.parse(activeSession);
        if (parsed && parsed.name && parsed.isRegistered) return parsed;
      }
    } catch {}
    return {
      id: 'student_' + Math.random().toString(36).substring(2, 8),
      name: '',
      email: '',
      avatarUrl: AVATAR_OPTIONS[0].url,
      gradeLevel: '6º de Primaria',
      savedAt: Date.now(),
      isRegistered: false,
    };
  });

  const [conversations, setConversations] = useState<Conversation[]>(() => {
    const initialId = 'conv_' + Date.now();
    return [
      {
        id: initialId,
        title: 'Nuevo Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      },
    ];
  });

  const [activeConvId, setActiveConvId] = useState<string>(conversations[0].id);

  // UI & STATE
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [progressPercent, setProgressPercent] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCurrentQuestionMath, setIsCurrentQuestionMath] = useState(false);
  const [attachedImage, setAttachedImage] = useState<ProcessedImage | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [viewModes, setViewModes] = useState<Record<string, 'screens' | 'full'>>({});

  // TWO-STEP ONBOARDING (ALWAYS OPEN IF NOT REGISTERED)
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => !currentUser.isRegistered);
  const [onboardingStep, setOnboardingStep] = useState<1 | 2>(1);

  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPhotoChoiceModalOpen, setIsPhotoChoiceModalOpen] = useState(false);
  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [cropTarget, setCropTarget] = useState<'profile' | 'onboarding'>('profile');
  const [selectedAvatarCategory, setSelectedAvatarCategory] = useState<string>('Todos');
  const [avatarSearch, setAvatarSearch] = useState<string>('');
  const [isEditingField, setIsEditingField] = useState<'name' | 'grade' | 'email' | null>(null);

  // Form State for 2-Step Registration
  const [formName, setFormName] = useState(currentUser.name);
  const [formEmail, setFormEmail] = useState(currentUser.email);
  const [formGrade, setFormGrade] = useState(currentUser.gradeLevel || '6º de Primaria');
  const [formAvatarUrl, setFormAvatarUrl] = useState(currentUser.avatarUrl || AVATAR_OPTIONS[0].url);

  // Temporary edit inputs in Account Dashboard
  const [editVal, setEditVal] = useState('');

  const galleryAvatarInputRef = useRef<HTMLInputElement>(null);
  const profileDirectGalleryInputRef = useRef<HTMLInputElement>(null);
  const modalGalleryInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mobileCameraInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const progressIntervalRef = useRef<any>(null);

  const currentConversation = useMemo(() => {
    return (
      conversations.find((c) => c.id === activeConvId) ||
      conversations[0] || {
        id: 'conv_temp',
        title: 'Nuevo Chat',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        messages: [],
      }
    );
  }, [conversations, activeConvId]);

  const filteredAvatars = useMemo(() => {
    return AVATAR_OPTIONS.filter((av) => {
      const matchesCategory = selectedAvatarCategory === 'Todos' || av.category === selectedAvatarCategory;
      const cleanSearch = avatarSearch.toLowerCase().trim();
      const matchesSearch =
        cleanSearch === '' ||
        av.label.toLowerCase().includes(cleanSearch) ||
        av.category.toLowerCase().includes(cleanSearch);
      return matchesCategory && matchesSearch;
    });
  }, [selectedAvatarCategory, avatarSearch]);

  const messages = currentConversation.messages;

  // PERSISTENCE SYNC
  useEffect(() => {
    if (currentUser.isRegistered) {
      localStorage.setItem(CURRENT_USER_SESSION, JSON.stringify(currentUser));
    }
  }, [currentUser]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputText]);

  // Progressive progress bar handler
  useEffect(() => {
    if (isLoading) {
      setProgressPercent(12);
      let current = 12;
      progressIntervalRef.current = setInterval(() => {
        current += Math.max(1, (94 - current) * 0.15);
        if (current > 94) current = 94;
        setProgressPercent(Math.round(current));
      }, 140);
    } else {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
      setProgressPercent(100);
      const timer = setTimeout(() => {
        setProgressPercent(0);
      }, 300);
      return () => clearTimeout(timer);
    }

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [isLoading]);

  // Handle Complete Onboarding
  const handleCompleteOnboarding = () => {
    const finalName = formName.trim() || 'Estudiante';
    const finalEmail = formEmail.trim();
    const finalGrade = formGrade;
    const finalAvatar = formAvatarUrl || AVATAR_OPTIONS[0].url;

    const updatedUser: UserProfile = {
      id: currentUser.id,
      name: finalName,
      email: finalEmail,
      avatarUrl: finalAvatar,
      gradeLevel: finalGrade,
      savedAt: Date.now(),
      isRegistered: true,
    };

    setCurrentUser(updatedUser);
    setIsOnboardingOpen(false);
    setIsProfileModalOpen(true); // Open professional profile immediately!
  };

  const handleUpdateAvatar = (newAvatarUrl: string) => {
    const updated = { ...currentUser, avatarUrl: newAvatarUrl };
    setCurrentUser(updated);
    setIsAvatarPickerOpen(false);
  };

  const handleUploadGalleryAvatar = (file: File, target: 'profile' | 'onboarding' = 'profile') => {
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setCropImageSrc(dataUrl);
      setCropTarget(target);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveCroppedAvatar = (croppedDataUrl: string) => {
    if (cropTarget === 'onboarding') {
      setFormAvatarUrl(croppedDataUrl);
    } else {
      handleUpdateAvatar(croppedDataUrl);
    }
  };

  const handleSaveFieldEdit = () => {
    if (!isEditingField) return;
    const trimmed = editVal.trim();
    let updated = { ...currentUser };

    if (isEditingField === 'name' && trimmed) {
      updated.name = trimmed;
    } else if (isEditingField === 'grade' && trimmed) {
      updated.gradeLevel = trimmed;
    } else if (isEditingField === 'email') {
      updated.email = trimmed;
    }

    setCurrentUser(updated);
    setIsEditingField(null);
    setEditVal('');
  };

  const handleCreateNewChat = () => {
    const newId = 'conv_' + Date.now();
    const newConv: Conversation = {
      id: newId,
      title: 'Nuevo Chat',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };
    setConversations((prev) => [newConv, ...prev]);
    setActiveConvId(newId);
    setIsSidebarOpen(false);
    setAttachedImage(null);
    setInputText('');
  };

  const handleDeleteConversation = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== convId);
      if (filtered.length === 0) {
        const fallbackId = 'conv_' + Date.now();
        const fallbackConv: Conversation = {
          id: fallbackId,
          title: 'Nuevo Chat',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          messages: [],
        };
        setActiveConvId(fallbackId);
        return [fallbackConv];
      }
      if (activeConvId === convId) {
        setActiveConvId(filtered[0].id);
      }
      return filtered;
    });
  };

  const handleSendMessage = async (textToSend?: string) => {
    const finalContent = textToSend !== undefined ? textToSend : inputText.trim();
    const hasImage = !!attachedImage;
    if ((!finalContent && !hasImage) || isLoading) return;

    const isMath = isMathQuestion(finalContent, hasImage);
    setIsCurrentQuestionMath(isMath);

    const userMsg: Message = {
      id: 'msg_' + Date.now(),
      role: 'user',
      content: finalContent,
      timestamp: Date.now(),
      image: attachedImage
        ? {
            mimeType: attachedImage.mimeType,
            data: attachedImage.data,
            previewUrl: attachedImage.previewUrl,
          }
        : undefined,
    };

    const updatedMessages = [...messages, userMsg];

    let newTitle = currentConversation.title;
    if (messages.length === 0) {
      newTitle = generateTitleFromText(finalContent);
    }

    setConversations((prev) =>
      prev.map((c) =>
        c.id === activeConvId
          ? {
              ...c,
              title: newTitle,
              updatedAt: Date.now(),
              messages: updatedMessages,
            }
          : c
      )
    );

    setInputText('');
    setAttachedImage(null);
    setIsLoading(true);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 35000);

      const response = await fetch('/api/tutor/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
        body: JSON.stringify({
          messages: updatedMessages.map((m) => ({
            role: m.role,
            content: m.content,
            image: m.image ? { mimeType: m.image.mimeType, data: m.image.data } : undefined,
          })),
        }),
      });

      clearTimeout(timeoutId);

      let data: any;
      const responseText = await response.text();
      try {
        data = JSON.parse(responseText);
      } catch {
        if (!response.ok) {
          throw new Error(`El servidor devolvió un error (${response.status}). Si estás en Vercel, asegúrate de añadir la variable de entorno GEMINI_API_KEY en la configuración de tu proyecto.`);
        }
        throw new Error('Respuesta no válida del servidor.');
      }

      if (!response.ok) {
        throw new Error(data?.error || `Error ${response.status}: No se pudo comunicar con el tutor.`);
      }

      const assistantText = data.text || '';
      const tutorMsg: Message = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: assistantText,
        timestamp: Date.now(),
      };

      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...updatedMessages, tutorMsg],
              }
            : c
        )
      );
    } catch (error: any) {
      console.error('Error sending message:', error);
      const isTimeout = error?.name === 'AbortError';
      const errorMsg: Message = {
        id: 'msg_' + Date.now(),
        role: 'assistant',
        content: isTimeout
          ? '⏱️ La respuesta tardó más de lo esperado. Por favor, reintenta tu pregunta o envía una versión más corta.'
          : `Error al procesar: ${error?.message || 'No se pudo conectar con el servidor.'}`,
        timestamp: Date.now(),
      };
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConvId
            ? {
                ...c,
                updatedAt: Date.now(),
                messages: [...updatedMessages, errorMsg],
              }
            : c
        )
      );
    } finally {
      setIsLoading(false);
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

  const toggleViewMode = (msgId: string) => {
    setViewModes((prev) => ({
      ...prev,
      [msgId]: prev[msgId] === 'full' ? 'screens' : 'full',
    }));
  };

  return (
    <div className="fixed inset-0 w-full h-full flex bg-stone-950 text-stone-100 overflow-hidden font-sans select-none">
      {/* SIDEBAR DRAWER WITH ANIMATE PRESENCE */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              key="sidebar-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40"
              onClick={() => setIsSidebarOpen(false)}
            />

            <motion.aside
              key="sidebar-aside"
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-stone-900 border-r border-stone-800 flex flex-col shadow-2xl"
            >
              <div className="p-3.5 border-b border-stone-800 flex items-center justify-between shrink-0">
                <div className="flex items-center space-x-2.5">
                  <MathAILogo className="w-8 h-8" rounded="rounded-xl" />
                  <div>
                    <span className="font-semibold text-sm text-stone-100 block leading-tight">Conversaciones</span>
                    <span className="text-[10px] text-amber-400 font-mono">Progreso Guardado</span>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="p-3 shrink-0">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleCreateNewChat}
                  className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Nuevo Chat</span>
                </motion.button>
              </div>

              <div className="flex-1 overflow-y-auto px-2 space-y-1 min-h-0">
                <div className="px-2 py-1 text-[11px] font-semibold text-stone-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Historial ({conversations.length})</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                </div>

                {conversations.map((conv) => {
                  const isActive = conv.id === activeConvId;
                  return (
                    <div
                      key={conv.id}
                      onClick={() => {
                        setActiveConvId(conv.id);
                        setIsSidebarOpen(false);
                      }}
                      className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition cursor-pointer ${
                        isActive
                          ? 'bg-stone-800 text-stone-100 font-medium border border-stone-700'
                          : 'text-stone-300 hover:bg-stone-850 hover:text-stone-100 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5 truncate min-w-0 pr-2">
                        <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-amber-400' : 'text-stone-400'}`} />
                        <span className="truncate">{conv.title || 'Nuevo Chat'}</span>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => handleDeleteConversation(e, conv.id)}
                        className="p-1 rounded-md text-stone-400 hover:text-red-400 hover:bg-stone-700/60 transition cursor-pointer shrink-0"
                        title="Eliminar conversación"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* SIDEBAR FOOTER - CLICK TO OPEN PROFESSIONAL ACCOUNT MODAL */}
              <div className="p-3 border-t border-stone-800 bg-stone-950/60 shrink-0">
                <button
                  onClick={() => setIsProfileModalOpen(true)}
                  className="w-full flex items-center space-x-2.5 p-2 rounded-xl hover:bg-stone-800 transition cursor-pointer group"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden border border-amber-500/40 bg-stone-800 flex items-center justify-center shrink-0 shadow-xs relative">
                    <img src={currentUser.avatarUrl} alt="User" className="w-full h-full object-cover" />
                  </div>
                  <div className="text-left truncate flex-1 min-w-0">
                    <div className="text-xs text-stone-200 font-semibold truncate flex items-center gap-1">
                      <span>{currentUser.name || 'Estudiante'}</span>
                      <Pencil className="w-3 h-3 text-stone-400 opacity-0 group-hover:opacity-100 transition" />
                    </div>
                    <div className="text-[10px] text-amber-400/90 truncate">
                      {currentUser.gradeLevel}
                    </div>
                  </div>
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 h-full w-full overflow-hidden relative">
        {/* HEADER */}
        <header className="h-14 border-b border-stone-850 bg-stone-950/90 backdrop-blur-md px-4 flex items-center justify-between shrink-0 select-none z-20">
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-xl text-stone-300 hover:text-stone-100 hover:bg-stone-900 border border-stone-800 transition cursor-pointer"
              title="Abrir menú de chats"
            >
              <Menu className="w-5 h-5" />
            </motion.button>

            <div className="flex items-center space-x-2.5">
              <MathAILogo className="w-8 h-8" rounded="rounded-xl" />
              <span className="font-semibold text-stone-100 text-sm tracking-tight flex items-center gap-1.5">
                Math AI
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300 border border-amber-500/25 font-mono">
                  {currentUser.gradeLevel ? currentUser.gradeLevel.split(' ')[0] : 'Tutor'}
                </span>
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleCreateNewChat}
              className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-900 border border-transparent hover:border-stone-800 transition cursor-pointer"
              title="Nuevo chat"
            >
              <SquarePen className="w-4 h-4" />
            </motion.button>

            {/* CLICK AVATAR TO OPEN PROFESSIONAL PROFILE CARD */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (!currentUser.isRegistered) {
                  setIsOnboardingOpen(true);
                } else {
                  setIsProfileModalOpen(true);
                }
              }}
              className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-stone-900/60 hover:bg-stone-900 border border-stone-800 hover:border-amber-500/40 transition cursor-pointer shadow-xs"
              title="Ver mi Cuenta Profesional"
            >
              <div className="w-6 h-6 rounded-full overflow-hidden border border-amber-400/50 bg-stone-800 flex items-center justify-center">
                <img src={currentUser.avatarUrl} alt={currentUser.name} className="w-full h-full object-cover" />
              </div>
              <span className="text-xs text-stone-200 font-medium max-w-[110px] truncate hidden sm:inline">
                {currentUser.name || 'Mi Cuenta'}
              </span>
            </motion.button>
          </div>
        </header>

        {/* CHAT MESSAGES SCROLL AREA */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 md:px-12 lg:px-24 py-4 sm:py-6 space-y-6 min-h-0">
          {messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="h-full flex flex-col items-center justify-center text-center max-w-xl mx-auto py-6 px-4 space-y-5"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300, delay: 0.1 }}
              >
                <MathAILogo className="w-16 h-16 shadow-xl border border-amber-500/30" rounded="rounded-2xl" />
              </motion.div>
              
              <div className="space-y-2">
                <h2 className="text-xl sm:text-2xl font-semibold text-stone-100 tracking-tight">
                  ¡Hola {currentUser.name || 'Estudiante'}! ¿Qué resolvemos hoy?
                </h2>
                <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-sans max-w-md mx-auto">
                  Escribe cualquier duda o cálculo matemático, o pulsa <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-stone-300 border border-stone-700 font-mono text-xs">+</kbd> para capturar una <strong className="text-amber-300">foto o página entera</strong> de ejercicios.
                </p>
              </div>
            </motion.div>
          ) : (
            messages.map((msg, index) => {
              const isTutor = msg.role === 'assistant';
              const multiCards = isTutor ? parseMultipleExercises(msg.content) : null;
              const hasMulti = multiCards !== null && multiCards.length >= 2;
              const currentMode = viewModes[msg.id] || 'screens';

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 15, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.04, 0.2) }}
                  className={`flex gap-3.5 max-w-3xl mx-auto w-full ${
                    isTutor ? 'justify-start' : 'justify-end'
                  }`}
                >
                  {isTutor && (
                    <div className="shrink-0 mt-1">
                      <MathAILogo className="w-8 h-8 shadow-xs" rounded="rounded-xl" />
                    </div>
                  )}

                  <div
                    className={`flex flex-col space-y-1.5 min-w-0 max-w-full ${
                      isTutor ? 'flex-1 max-w-[95%] sm:max-w-[92%]' : 'max-w-[85%] items-end'
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-3 text-sm leading-relaxed overflow-hidden max-w-full ${
                        isTutor
                          ? 'bg-stone-900 border border-stone-850 text-stone-100 shadow-xs'
                          : 'bg-stone-800 text-stone-100 rounded-tr-xs'
                      }`}
                    >
                      {msg.image?.previewUrl && (
                        <div className="mb-3 rounded-xl overflow-hidden border border-stone-700 max-w-xs bg-black/40">
                          <img
                            src={msg.image.previewUrl}
                            alt="Foto de la página de ejercicios"
                            className="w-full h-auto max-h-72 object-contain"
                          />
                        </div>
                      )}

                      {isTutor ? (
                        <div className="max-w-full overflow-hidden">
                          {hasMulti && (
                            <div className="flex items-center justify-end mb-2">
                              <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.96 }}
                                type="button"
                                onClick={() => toggleViewMode(msg.id)}
                                className="px-2.5 py-1 rounded-lg bg-stone-800 hover:bg-stone-750 border border-stone-700 text-[11px] text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
                              >
                                {currentMode === 'screens' ? (
                                  <>
                                    <List className="w-3 h-3" />
                                    Ver en Texto Continuo
                                  </>
                                ) : (
                                  <>
                                    <Monitor className="w-3 h-3" />
                                    Ver en Pantallitas ({multiCards.length})
                                  </>
                                )}
                              </motion.button>
                            </div>
                          )}

                          {hasMulti && currentMode === 'screens' ? (
                            <MultiExerciseScreens cards={multiCards} />
                          ) : (
                            <div className="prose prose-invert prose-stone max-w-none text-stone-200 break-words">
                              <MathMarkdown content={msg.content} />
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="whitespace-pre-wrap font-sans break-words">{msg.content}</div>
                      )}
                    </div>

                    {isTutor && (
                      <div className="flex items-center space-x-2 px-1 text-xs text-stone-400">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
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
                        </motion.button>

                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="flex items-center space-x-1 px-2 py-1 rounded-md hover:bg-stone-850 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                          title="Copiar texto"
                        >
                          {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                          <span className="text-[11px]">{copiedId === msg.id ? 'Copiado' : 'Copiar'}</span>
                        </motion.button>
                      </div>
                    )}
                  </div>

                  {!isTutor && (
                    <motion.div
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.92 }}
                      onClick={() => setIsProfileModalOpen(true)}
                      className="w-8 h-8 rounded-full border border-stone-700 flex items-center justify-center shrink-0 mt-1 overflow-hidden bg-stone-800 shadow-xs cursor-pointer hover:border-amber-400 transition"
                      title="Ver perfil"
                    >
                      <img src={currentUser.avatarUrl} alt="User Avatar" className="w-full h-full object-cover" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })
          )}

          {/* DYNAMIC PROGRESS CARD */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 15, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="flex gap-3.5 max-w-3xl mx-auto justify-start w-full"
            >
              <div className="shrink-0">
                <MathAILogo className="w-8 h-8 shadow-xs animate-pulse" rounded="rounded-xl" />
              </div>
              <div className="flex-1 max-w-[92%] sm:max-w-[88%] bg-stone-900 border border-stone-800 rounded-2xl p-4 shadow-md space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 animate-spin" />
                    {isCurrentQuestionMath ? 'Calculando solución y dividiendo en pantallitas...' : 'Pensando respuesta...'}
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold">
                    {progressPercent}%
                  </span>
                </div>

                <div className="w-full bg-stone-950 rounded-full h-2 overflow-hidden border border-stone-800">
                  <motion.div
                    className="h-full bg-gradient-to-r from-amber-400 via-pink-500 to-sky-400 rounded-full"
                    animate={{ width: `${progressPercent}%` }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                  />
                </div>

                <p className="text-[11px] text-stone-400 font-sans">
                  {isCurrentQuestionMath
                    ? 'Organizando cada ejercicio con procedimiento corto y resultado destacado...'
                    : 'Preparando la respuesta para ti...'}
                </p>
              </div>
            </motion.div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* FIXED BOTTOM INPUT BAR */}
        <div className="p-3 sm:p-4 bg-stone-950 border-t border-stone-900 shrink-0 z-20">
          <div className="max-w-3xl mx-auto relative">
            <AnimatePresence>
              {attachedImage && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: 10 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="mb-2 p-1.5 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between max-w-xs shadow-md overflow-hidden"
                >
                  <div className="flex items-center space-x-2">
                    <img
                      src={attachedImage.previewUrl}
                      alt="Adjunto"
                      className="w-9 h-12 object-cover rounded-lg border border-stone-700"
                    />
                    <span className="text-xs text-stone-300 font-medium truncate">
                      Página capturada
                    </span>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setAttachedImage(null)}
                    className="p-1 text-stone-400 hover:text-stone-200 transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {isMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 12, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                  className="absolute bottom-14 left-0 w-64 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-2 z-50 text-stone-200"
                >
                  <div className="text-[11px] font-semibold text-stone-400 px-3 py-1 uppercase tracking-wider">
                    Adjuntar Ejercicios
                  </div>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const processed = await processImageFile(file);
                        setAttachedImage(processed);
                        setIsMenuOpen(false);
                      }
                    }}
                    accept="image/*"
                    className="hidden"
                  />

                  <input
                    type="file"
                    ref={mobileCameraInputRef}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const processed = await processImageFile(file);
                        setAttachedImage(processed);
                        setIsMenuOpen(false);
                      }
                    }}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-stone-800 text-stone-200 hover:text-white transition cursor-pointer text-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
                      <ImageIcon className="w-4 h-4" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Subir foto o archivo</div>
                      <div className="text-[11px] text-stone-400">Desde tu galería o fotos</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setIsMenuOpen(false);
                      mobileCameraInputRef.current?.click();
                    }}
                    className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl hover:bg-stone-800 text-stone-200 hover:text-white transition cursor-pointer text-xs"
                  >
                    <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
                      <Camera className="w-4 h-4" />
                    </div>
                    <div className="text-left font-medium">
                      Hacer foto
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="relative flex items-end rounded-2xl bg-stone-900 border border-stone-800 focus-within:border-stone-700 shadow-lg px-2 py-1.5 transition"
            >
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="button"
                onClick={() => setIsMenuOpen((prev) => !prev)}
                className="p-2 rounded-xl text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer shrink-0"
                title="Adjuntar foto o página"
              >
                <Plus className="w-5 h-5" />
              </motion.button>

              <textarea
                ref={textareaRef}
                rows={1}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Escribe varias operaciones o haz preguntas..."
                className="w-full px-3 py-2 bg-transparent text-stone-100 placeholder-stone-500 text-sm focus:outline-hidden resize-none max-h-36 min-h-[36px]"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />

              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                type="submit"
                disabled={isLoading || (!inputText.trim() && !attachedImage)}
                className="p-2 rounded-xl bg-stone-100 hover:bg-white text-stone-950 disabled:bg-stone-800 disabled:text-stone-600 transition shrink-0 cursor-pointer disabled:cursor-not-allowed shadow-md"
                title="Enviar"
              >
                <ArrowUp className="w-4 h-4 stroke-[2.5]" />
              </motion.button>
            </form>

            <p className="text-[11px] text-stone-500 text-center mt-2 font-sans">
              Math AI • Tutor adaptado a tu curso con modo pantallitas
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2-STEP ONBOARDING MODAL (STEP 1: INFO -> STEP 2: AVATAR) */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isOnboardingOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5"
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                <div className="flex items-center space-x-2.5">
                  <MathAILogo className="w-8 h-8 shadow-xs" rounded="rounded-xl" />
                  <div>
                    <h2 className="text-sm font-bold text-stone-100">Crear Cuenta de Alumno</h2>
                    <p className="text-[11px] text-stone-400">Paso {onboardingStep} de 2</p>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5">
                  <div className={`h-2 rounded-full transition-all ${onboardingStep === 1 ? 'w-6 bg-amber-400' : 'w-2 bg-stone-700'}`} />
                  <div className={`h-2 rounded-full transition-all ${onboardingStep === 2 ? 'w-6 bg-amber-400' : 'w-2 bg-stone-700'}`} />
                </div>
              </div>

              {/* STEP 1: NAME, GRADE & EMAIL */}
              {onboardingStep === 1 && (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!formName.trim()) return;
                    setOnboardingStep(2);
                  }}
                  className="space-y-4"
                >
                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                      1. Nombre o Apodo <span className="text-amber-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="Ej: Daniel, Elena, Lucas..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-hidden focus:border-amber-500/50"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                      2. ¿Qué curso estás haciendo? <span className="text-amber-400">*</span>
                    </label>
                    <select
                      value={formGrade}
                      onChange={(e) => setFormGrade(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-hidden focus:border-amber-500/50"
                    >
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-stone-300 block mb-1.5">
                      3. Correo Electrónico (Opcional)
                    </label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="tu.correo@ejemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-100 text-sm focus:outline-hidden focus:border-amber-500/50"
                    />
                  </div>

                  <div className="pt-2 flex justify-end">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={!formName.trim()}
                      className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:bg-stone-800 disabled:text-stone-500 text-stone-950 font-bold text-xs transition cursor-pointer flex items-center justify-center gap-2 shadow-md"
                    >
                      <span>Paso 2: Elegir Foto de Perfil</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </motion.button>
                  </div>
                </form>
              )}

              {/* STEP 2: PHOTO PICKER (GALLERY OR 30 AVATARS) */}
              {onboardingStep === 2 && (
                <div className="space-y-4">
                  <input
                    type="file"
                    ref={galleryAvatarInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        handleUploadGalleryAvatar(file, 'onboarding');
                      }
                    }}
                  />

                  <div className="flex items-center justify-between p-3 rounded-2xl bg-stone-950 border border-stone-800">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-amber-400 bg-stone-800 shadow-md shrink-0">
                        <img src={formAvatarUrl} alt="Avatar Preview" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-stone-100">Foto Actual</div>
                        <div className="text-[11px] text-stone-400">Elige abajo o sube de galería</div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => galleryAvatarInputRef.current?.click()}
                      className="px-3 py-2 rounded-xl bg-stone-800 hover:bg-stone-750 border border-stone-700 text-xs font-semibold text-amber-300 flex items-center gap-1.5 transition cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      De tu Galería
                    </button>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-stone-300 mb-2 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        Elige entre los {AVATAR_OPTIONS.length}+ Avatares:
                      </span>
                      <span className="text-[11px] text-amber-400 font-mono">
                        {AVATAR_OPTIONS.length} disponibles
                      </span>
                    </div>

                    <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 p-2.5 rounded-2xl bg-stone-950 border border-stone-800 max-h-48 overflow-y-auto">
                      {AVATAR_OPTIONS.map((av) => {
                        const isSelected = formAvatarUrl === av.url;
                        return (
                          <button
                            key={av.id}
                            type="button"
                            onClick={() => setFormAvatarUrl(av.url)}
                            className={`relative p-1 rounded-xl transition cursor-pointer flex flex-col items-center justify-center ${
                              isSelected
                                ? 'bg-amber-500/20 border-2 border-amber-400 shadow-xs scale-105'
                                : 'hover:bg-stone-850 border border-stone-800 opacity-75 hover:opacity-100'
                            }`}
                            title={av.label}
                          >
                            <img src={av.url} alt={av.label} className="w-8 h-8 rounded-lg object-cover" />
                            {isSelected && (
                              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[8px] font-bold">
                                ✓
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => setOnboardingStep(1)}
                      className="px-4 py-2 rounded-xl text-stone-400 hover:text-stone-200 text-xs transition cursor-pointer flex items-center gap-1"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Atrás
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleCompleteOnboarding}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer shadow-lg flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      Finalizar y Ver mi Cuenta
                    </motion.button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* PROFESSIONAL ACCOUNT DASHBOARD MODAL */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col"
            >
              <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="w-5 h-5 text-amber-400" />
                  <span className="font-bold text-sm text-stone-100">Cuenta de Estudiante</span>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsProfileModalOpen(false)}
                  className="p-1 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="p-5 sm:p-6 space-y-5 overflow-y-auto max-h-[80vh]">
                {/* Photo & Info Card */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start space-y-3 sm:space-y-0 sm:space-x-4 p-4 rounded-2xl bg-stone-950 border border-stone-800 relative">
                  {/* Clickable Profile Photo with Camera Badge */}
                  <div
                    onClick={() => setIsPhotoChoiceModalOpen(true)}
                    className="relative group cursor-pointer w-20 h-20 rounded-full overflow-hidden border-2 border-amber-400 bg-stone-800 shadow-lg shrink-0 ring-4 ring-amber-500/20"
                    title="Haz clic para cambiar tu foto de perfil (Galería o App)"
                  >
                    <img src={currentUser.avatarUrl} alt="Avatar" className="w-full h-full object-cover group-hover:scale-105 transition" />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white">
                      <Camera className="w-5 h-5 text-amber-300" />
                      <span className="text-[9px] font-semibold mt-0.5">Cambiar</span>
                    </div>
                  </div>

                  <div className="flex-1 text-center sm:text-left min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h3 className="text-base font-bold text-stone-100 truncate">{currentUser.name || 'Estudiante'}</h3>
                      <button
                        onClick={() => {
                          setIsEditingField('name');
                          setEditVal(currentUser.name);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-850 transition cursor-pointer"
                        title="Editar nombre con lápiz"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-amber-400 font-semibold flex items-center justify-center sm:justify-start gap-1 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>{currentUser.gradeLevel}</span>
                      <button
                        onClick={() => {
                          setIsEditingField('grade');
                          setEditVal(currentUser.gradeLevel);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-850 transition cursor-pointer"
                        title="Editar curso con lápiz"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-xs text-stone-400 flex items-center justify-center sm:justify-start gap-1 mt-1 truncate">
                      <Mail className="w-3.5 h-3.5 text-stone-500" />
                      <span className="truncate">{currentUser.email || 'Sin correo asignado'}</span>
                      <button
                        onClick={() => {
                          setIsEditingField('email');
                          setEditVal(currentUser.email);
                        }}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-amber-400 hover:bg-stone-850 transition cursor-pointer"
                        title="Editar correo con lápiz"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Inline Pencil Editor if active */}
                {isEditingField && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-amber-300">
                      <span>
                        Modificar {isEditingField === 'name' ? 'Nombre' : isEditingField === 'grade' ? 'Curso Escolar' : 'Correo Electrónico'}
                      </span>
                      <button onClick={() => setIsEditingField(null)} className="text-stone-400 hover:text-stone-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {isEditingField === 'grade' ? (
                      <select
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:outline-hidden"
                      >
                        {GRADE_OPTIONS.map((g) => (
                          <option key={g} value={g}>{g}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type={isEditingField === 'email' ? 'email' : 'text'}
                        value={editVal}
                        onChange={(e) => setEditVal(e.target.value)}
                        placeholder={`Escribe nuevo ${isEditingField}...`}
                        className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-700 text-stone-100 text-xs focus:outline-hidden"
                      />
                    )}

                    <div className="flex justify-end gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setIsEditingField(null)}
                        className="px-3 py-1.5 rounded-lg text-stone-400 hover:text-stone-200 text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveFieldEdit}
                        className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs"
                      >
                        Guardar Cambio
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                      <span>Chats Guardados</span>
                    </div>
                    <div className="text-lg font-bold text-stone-100 mt-1">{conversations.length}</div>
                  </div>

                  <div className="p-3 rounded-xl bg-stone-950 border border-stone-800">
                    <div className="text-[11px] text-stone-400 flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Modo Tutor</span>
                    </div>
                    <div className="text-xs font-semibold text-emerald-300 mt-1">Paso a paso activo</div>
                  </div>
                </div>

                {/* Hidden file input for direct profile photo upload */}
                <input
                  type="file"
                  ref={profileDirectGalleryInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      handleUploadGalleryAvatar(file);
                    }
                  }}
                />

                <div className="pt-3 border-t border-stone-800 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setIsProfileModalOpen(false);
                      setOnboardingStep(1);
                      setIsOnboardingOpen(true);
                    }}
                    className="text-xs text-stone-400 hover:text-amber-400 transition cursor-pointer"
                  >
                    Volver al registro de 2 pasos
                  </button>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setIsProfileModalOpen(false)}
                    className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs transition cursor-pointer shadow-md"
                  >
                    Cerrar
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* PHOTO SOURCE CHOICE MODAL (GALERÍA vs AVATARES DE LA APP)     */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isPhotoChoiceModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-5 sm:p-6 max-w-sm w-full shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Camera className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-stone-100">Foto de Perfil</h3>
                    <p className="text-[11px] text-stone-400">¿Cómo quieres poner tu foto?</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPhotoChoiceModalOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              <div className="space-y-2.5 pt-1">
                {/* Option 1: Poner de la galería */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsPhotoChoiceModalOpen(false);
                    profileDirectGalleryInputRef.current?.click();
                  }}
                  className="w-full p-3.5 rounded-2xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 text-left flex items-center space-x-3.5 transition group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-stone-950 flex items-center justify-center font-bold shrink-0 shadow-md group-hover:scale-105 transition">
                    <Upload className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition flex items-center justify-between">
                      <span>Poner de la galería</span>
                      <span className="text-[10px] text-amber-400 font-medium">Galería →</span>
                    </div>
                    <div className="text-[11px] text-stone-450 mt-0.5">
                      Abre tus fotos para elegir una imagen propia
                    </div>
                  </div>
                </motion.button>

                {/* Option 2: Usar una de la app */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    setIsPhotoChoiceModalOpen(false);
                    setIsAvatarPickerOpen(true);
                  }}
                  className="w-full p-3.5 rounded-2xl bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-amber-500/50 text-left flex items-center space-x-3.5 transition group cursor-pointer shadow-sm"
                >
                  <div className="w-10 h-10 rounded-xl bg-stone-800 text-amber-400 flex items-center justify-center font-bold shrink-0 border border-stone-700 group-hover:scale-105 transition">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-stone-100 group-hover:text-amber-300 transition flex items-center justify-between">
                      <span>Usar una de la app</span>
                      <span className="text-[10px] text-stone-400 font-medium">30 Avatares →</span>
                    </div>
                    <div className="text-[11px] text-stone-450 mt-0.5">
                      Elige entre los 30 personajes e iconos
                    </div>
                  </div>
                </motion.button>
              </div>

              <div className="pt-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => setIsPhotoChoiceModalOpen(false)}
                  className="text-xs text-stone-500 hover:text-stone-300 transition py-1 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* AVATAR PICKER MODAL (120+ PRESET ICONS & CATEGORIES)          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isAvatarPickerOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 10 }}
              transition={{ type: 'spring', damping: 26, stiffness: 350 }}
              className="bg-stone-900 border border-stone-800 rounded-3xl p-4 sm:p-6 max-w-2xl w-full shadow-2xl space-y-3.5 max-h-[92vh] flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-stone-800 pb-3 shrink-0">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center border border-amber-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-stone-100">Catálogo de Avatares e Iconos</h3>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 font-mono border border-amber-500/30">
                        {AVATAR_OPTIONS.length} iconos
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-400">Elige tu personaje favorito o busca por categoría</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="p-1.5 rounded-lg text-stone-400 hover:text-stone-100 hover:bg-stone-800 transition cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </motion.button>
              </div>

              {/* Search Input & Quick Info */}
              <div className="space-y-2 shrink-0">
                <div className="relative">
                  <Search className="w-4 h-4 text-stone-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={avatarSearch}
                    onChange={(e) => setAvatarSearch(e.target.value)}
                    placeholder="Buscar icono por nombre o temática (ej: ninja, robot, mago, pixel, anime)..."
                    className="w-full bg-stone-950 border border-stone-800 focus:border-amber-400 text-xs text-stone-100 rounded-xl pl-9 pr-8 py-2.5 focus:outline-hidden transition"
                  />
                  {avatarSearch && (
                    <button
                      type="button"
                      onClick={() => setAvatarSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-stone-500 hover:text-stone-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Horizontal Category Filter Pills */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
                  {AVATAR_CATEGORIES.map((cat) => {
                    const isActive = selectedAvatarCategory === cat;
                    const count = cat === 'Todos' ? AVATAR_OPTIONS.length : AVATAR_OPTIONS.filter((a) => a.category === cat).length;
                    return (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setSelectedAvatarCategory(cat)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition flex items-center gap-1.5 cursor-pointer ${
                          isActive
                            ? 'bg-amber-500 text-stone-950 font-bold shadow-xs'
                            : 'bg-stone-950 text-stone-400 hover:text-stone-200 border border-stone-800 hover:border-stone-700'
                        }`}
                      >
                        <span>{cat}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            isActive ? 'bg-stone-950/20 text-stone-900 font-bold' : 'bg-stone-850 text-stone-400'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Results Grid */}
              <div className="flex-1 overflow-y-auto pr-1">
                {filteredAvatars.length === 0 ? (
                  <div className="text-center py-10 px-4 bg-stone-950/60 rounded-2xl border border-dashed border-stone-800 space-y-2">
                    <p className="text-xs text-stone-400">No se encontraron avatares que coincidan con &quot;{avatarSearch}&quot;</p>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarSearch('');
                        setSelectedAvatarCategory('Todos');
                      }}
                      className="text-xs text-amber-400 font-medium hover:underline cursor-pointer"
                    >
                      Ver todos los {AVATAR_OPTIONS.length} avatares
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 p-2.5 rounded-2xl bg-stone-950 border border-stone-800">
                    {filteredAvatars.map((av) => {
                      const isSelected = currentUser.avatarUrl === av.url;
                      return (
                        <motion.button
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.95 }}
                          key={av.id}
                          type="button"
                          onClick={() => {
                            handleUpdateAvatar(av.url);
                            setIsAvatarPickerOpen(false);
                          }}
                          className={`relative p-1.5 rounded-2xl transition cursor-pointer flex flex-col items-center justify-center group ${
                            isSelected
                              ? 'bg-amber-500/25 border-2 border-amber-400 shadow-md scale-105'
                              : 'hover:bg-stone-850 border border-stone-800/80 hover:border-stone-700 opacity-85 hover:opacity-100'
                          }`}
                          title={`${av.label} (${av.category})`}
                        >
                          <img
                            src={av.url}
                            alt={av.label}
                            className="w-11 h-11 rounded-xl object-cover group-hover:scale-105 transition"
                            loading="lazy"
                          />
                          <span className="text-[9px] text-stone-400 group-hover:text-stone-200 truncate w-full text-center mt-1 block">
                            {av.label.split(' ')[0]}
                          </span>
                          {isSelected && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-stone-950 flex items-center justify-center text-[8px] font-bold shadow-xs">
                              ✓
                            </div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="pt-2 border-t border-stone-800 flex items-center justify-between shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setIsAvatarPickerOpen(false);
                    profileDirectGalleryInputRef.current?.click();
                  }}
                  className="text-xs text-stone-400 hover:text-amber-400 flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>¿Prefieres subir una foto propia de tu galería?</span>
                </button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setIsAvatarPickerOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-semibold transition cursor-pointer"
                >
                  Cerrar
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* AVATAR CROP / ADJUSTMENT MODAL                                */}
      {/* ============================================================== */}
      <AvatarCropModal
        isOpen={isCropModalOpen}
        imageSrc={cropImageSrc}
        onClose={() => {
          setIsCropModalOpen(false);
          setCropImageSrc(null);
        }}
        onSave={(croppedDataUrl) => {
          handleSaveCroppedAvatar(croppedDataUrl);
        }}
      />
    </div>
  );
}
