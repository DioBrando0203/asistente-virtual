/**
 * Configuración centralizada del API
 * Facilita el cambio entre desarrollo y producción
 */

export const API_CONFIG = {
  // URL base del API - cambiar según el entorno
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api',

  // Endpoints disponibles
  endpoints: {
    // Imágenes
    generateImage: '/images/generate',

    // Materiales
    listTopics: '/materiales/list-topics',
    listTopicsWithContent: '/materiales/list-topics-with-content',
    extractText: '/materiales/extract-text',
    uploadMaterial: '/materiales/upload',

    // Cuestionarios
    generateQuiz: '/cuestionarios/generar',

    // Resúmenes
    generateSummary: '/resumenes/generar',

    // Evaluador
    evaluateAnswer: '/evaluador/evaluar',

    // Temas (Course Topics)
    generateCourseTopics: '/courses/generate-topics',
  },

  // Configuración de timeout
  timeout: 120000, // 2 minutos para generación de imágenes

  // Headers por defecto
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Helper para construir URLs completas
 */
export const getApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.baseURL}${endpoint}`;
};

/**
 * Helper para hacer peticiones fetch con configuración por defecto
 */
export const apiFetch = async (endpoint: string, options?: RequestInit) => {
  const url = getApiUrl(endpoint);

  const isFormData = options?.body instanceof FormData;

  // Evitar fijar Content-Type cuando se envía FormData (el navegador agrega el boundary)
  const defaultHeaders: HeadersInit = isFormData
    ? { Accept: API_CONFIG.headers.Accept }
    : API_CONFIG.headers;

  const defaultOptions: RequestInit = {
    headers: defaultHeaders,
  };

  const mergedHeaders: HeadersInit = {
    ...defaultHeaders,
    ...options?.headers,
  };

  if (isFormData && 'Content-Type' in mergedHeaders) {
    delete (mergedHeaders as Record<string, string>)['Content-Type'];
  }

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: mergedHeaders,
  };

  const response = await fetch(url, mergedOptions);

  // Verificar tipo de contenido
  const contentType = response.headers.get('content-type') || '';

  if (!response.ok) {
    if (contentType.includes('application/json')) {
      const errorData = await response.json();
      throw new Error(errorData.error || errorData.message || `Error HTTP ${response.status}`);
    } else {
      const text = await response.text();
      throw new Error(text || response.statusText || `Error HTTP ${response.status}`);
    }
  }

  if (contentType.includes('application/json')) {
    return await response.json();
  }

  return await response.text();
};

/**
 * Convertir imagen base64 a Blob para descargas
 */
export const base64ToBlob = (base64: string, contentType = 'image/png'): Blob => {
  // Remover prefijo data:image si existe
  const base64Data = base64.replace(/^data:image\/\w+;base64,/, '');

  const byteCharacters = atob(base64Data);
  const byteNumbers = new Array(byteCharacters.length);

  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }

  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
};

/**
 * Crear URL de objeto desde base64
 */
export const base64ToObjectURL = (base64: string): string => {
  const blob = base64ToBlob(base64);
  return URL.createObjectURL(blob);
};
