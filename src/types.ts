export interface ImageAttachment {
  mimeType: string;
  data: string; // base64
  previewUrl?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  image?: ImageAttachment;
  actionType?: string;
  suggestions?: string[];
}

export interface UserProfile {
  name: string;
  isGuest: boolean;
  email?: string;
  avatarUrl?: string;
}

export interface ProblemStep {
  stepNumber: number;
  title: string;
  summary: string;
  status: 'completed' | 'active' | 'pending';
}

export interface KeyConcept {
  id: string;
  name: string;
  description: string;
  formula?: string;
}

export interface ProblemSession {
  id: string;
  title: string;
  topic: string;
  equationLatex?: string;
  thumbnail?: string;
  messages: Message[];
  steps: ProblemStep[];
  concepts: KeyConcept[];
  createdAt: number;
  status: 'active' | 'solved';
  notes?: string;
}

export interface SampleProblem {
  id: string;
  title: string;
  topic: string;
  difficulty: 'Básico' | 'Intermedio' | 'Avanzado';
  prompt: string;
  equationLatex: string;
  tags: string[];
}
