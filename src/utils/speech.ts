// Speech synthesis utility for reading tutor messages in Spanish with natural pronunciation

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    currentUtterance = null;
  }
}

export function speakTutorText(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onError?.();
    return;
  }

  stopSpeaking();

  // Clean markdown and simplify math for voice reading
  let cleanText = text
    .replace(/\$\$(.*?)\$\$/gs, ' Expresión matemática: $1 ')
    .replace(/\$(.*?)\$/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 sobre $2')
    .replace(/\\int/g, 'integral ')
    .replace(/\\lim_\{([^}]+)\}/g, 'límite cuando $1 ')
    .replace(/\\to/g, ' tiende a ')
    .replace(/\\sin/g, 'seno ')
    .replace(/\\cos/g, 'coseno ')
    .replace(/\\tan/g, 'tangente ')
    .replace(/\\ln/g, 'logaritmo natural ')
    .replace(/\\sqrt\{([^}]+)\}/g, 'raíz cuadrada de $1')
    .replace(/\\cdot/g, ' por ')
    .replace(/\\times/g, ' por ')
    .replace(/\\,/g, ' ')
    .replace(/[\*_#>`]/g, '')
    .trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'es-ES';
  utterance.rate = 0.95; // slightly slower, calm and reassuring
  utterance.pitch = 1.0;

  // Try to pick an authentic Spanish voice if available
  const voices = window.speechSynthesis.getVoices();
  const spanishVoice = voices.find(
    (v) => v.lang.startsWith('es') && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Mónica') || v.name.includes('Jorge') || v.name.includes('Paulina'))
  ) || voices.find((v) => v.lang.startsWith('es'));

  if (spanishVoice) {
    utterance.voice = spanishVoice;
  }

  utterance.onstart = () => onStart?.();
  utterance.onend = () => {
    currentUtterance = null;
    onEnd?.();
  };
  utterance.onerror = () => {
    currentUtterance = null;
    onError?.();
  };

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

export function isSpeakingActive(): boolean {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    return window.speechSynthesis.speaking;
  }
  return false;
}
