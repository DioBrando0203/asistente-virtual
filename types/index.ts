// Tipos para el sistema educativo

export type AIModel = 'gemini' | 'gpt-4' | 'claude' | 'gpt-3.5';

export interface QuizConfig {
  curso: string;
  tema: string;
  tipoPreguntas: 'multiple' | 'verdadero-falso' | 'abierta' | 'mixta';
  numeroPreguntas: number;
  //modelo: AIModel;
}

export interface Quiz {
  id: string;
  tema: string;
  preguntas: Pregunta[];
  createdAt: Date;
}

export interface Pregunta {
  id: string;
  tipo: 'multiple' | 'verdadero-falso' | 'abierta';
  pregunta: string;
  opciones?: string[];
  respuestaCorrecta?: string | number;
}

export interface ResumenConfig {
  tema: string;
  extensionParrafos: number;
  //modelo: AIModel;
  formato?: 'simple' | 'detallado' | 'bullet-points';
}

export interface Resumen {
  id: string;
  tema: string;
  contenido: string;
  parrafos: number;
  createdAt: Date;
}

export interface EvaluacionConfig {
  temaCurso: string;
  pregunta: string;
  respuestaEstudiante: string;
  //modelo: AIModel;
}

export interface Evaluacion {
  id: string;
  calificacion: number;
  retroalimentacion: string;
  puntosPositivos: string[];
  puntosAMejorar: string[];
  createdAt: Date;
}

export interface Material {
  id: string;
  nombre: string;
  tipo: 'pdf' | 'image' | 'word' | 'text';
  url: string;
  tamano: number;
  curso: string;
  uploadedAt: Date;
}

export interface ImageGenerationConfig {
  tema: string;
  descripcion: string;
  temaPersonalizado?: string;
}

export interface ImageGenerationResult {
  id: string;
  imageUrl: string;
  imageBase64?: string; // Base64 de la imagen del backend
  descripcion: string;
  tema: string;
  createdAt: Date;
}

export interface TemaGenerationConfig {
  titulo: string;
  descripcion: string;
  nivelEducativo: string;
}

export interface CourseTopic {
  title: string;
  objective: string;
  estimated_sessions: number;
  summary: string;
}

export interface TemaGenerationResult {
  id: string;
  titulo: string;
  descripcion: string;
  nivelEducativo: string;
  topics: CourseTopic[];
  createdAt: Date;
}

export interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
