'use client';

import { useState, useEffect } from 'react';
import { ResumenConfig } from '@/types';

type ResultadoResumen = {
  topic: string;
  format?: string;
  paragraphs: string[];
};

export default function ResumenesPage() {
  const [config, setConfig] = useState<ResumenConfig>({
    tema: '',
    extensionParrafos: 4, // Medio (3-4 párrafos) por defecto
    formato: 'simple',
    //modelo: 'gemini',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoResumen | null>(null);
  const [temasDisponibles, setTemasDisponibles] = useState<string[]>([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(false);
  const [contenidoMaterial, setContenidoMaterial] = useState<string>('');
  const [isLoadingContenido, setIsLoadingContenido] = useState(false);

  // Cargar lista de archivos del bucket al montar el componente
  useEffect(() => {
    const cargarTemas = async () => {
      setIsLoadingTemas(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
        const response = await fetch(`${apiUrl}/materiales/list-topics`);

        if (!response.ok) {
          throw new Error('Error al cargar temas del bucket');
        }

        const data = await response.json();

        if (data.success) {
          // El backend puede devolver files como array o como objeto
          let filesArray: string[] = [];

          if (Array.isArray(data.files)) {
            filesArray = data.files;
          } else if (data.files && typeof data.files === 'object') {
            filesArray = Object.values(data.files);
          }

          // Remover la extensión .txt de los nombres para mostrar más limpio
          const temas = filesArray.map((file: string) => file.replace(/\.txt$/, ''));
          setTemasDisponibles(temas);
        } else {
          console.error('Formato de respuesta inesperado:', data);
        }
      } catch (error) {
        console.error('Error al cargar temas:', error);
        alert('No se pudieron cargar los temas disponibles del bucket');
      } finally {
        setIsLoadingTemas(false);
      }
    };

    cargarTemas();
  }, []);

  // Cargar contenido del archivo cuando se selecciona un tema
  const cargarContenidoTema = async (nombreArchivo: string) => {
    if (!nombreArchivo) {
      setContenidoMaterial('');
      return;
    }

    setIsLoadingContenido(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
      const archivoConExtension = nombreArchivo.endsWith('.txt') ? nombreArchivo : `${nombreArchivo}.txt`;

      const response = await fetch(`${apiUrl}/materiales/list-topics-with-content`);

      if (!response.ok) {
        throw new Error('Error al cargar contenido del material');
      }

      const data = await response.json();

      if (data.success && data.files) {
        let filesArray = Array.isArray(data.files) ? data.files : Object.values(data.files);
        const archivo = filesArray.find((f: any) => f.name === archivoConExtension);

        if (archivo && archivo.content) {
          setContenidoMaterial(archivo.content);
          console.log(`Contenido cargado: ${archivo.content.length} caracteres`);
        } else {
          console.warn(`No se encontró contenido para: ${archivoConExtension}`);
          setContenidoMaterial('');
        }
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      setContenidoMaterial('');
    } finally {
      setIsLoadingContenido(false);
    }
  };

  // Manejar cambio de tema
  const handleTemaChange = (tema: string) => {
    setConfig({ ...config, tema });
    cargarContenidoTema(tema);
  };

  const handleGenerar = async () => {
    if (!config.tema) {
      alert('Por favor selecciona un tema del curso');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';

      // Agregar contenido del material al payload
      const payload = {
        ...config,
        contenidoMaterial: contenidoMaterial || undefined
      };

      const response = await fetch(`${apiUrl}/resumenes/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.error || data.message || 'No se pudo generar el resumen');
      }

      const summary = data.summary ?? data.data ?? data;

      if (!summary) {
        throw new Error('Respuesta del servidor incompleta');
      }

      setResultado({
        topic: summary.topic ?? summary.tema ?? config.tema,
        format: summary.format ?? summary.formato ?? config.formato,
        paragraphs: summary.paragraphs ?? (summary.contenido ? [summary.contenido] : []),
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error al generar resumen';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Generador de Resúmenes</h1>

      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Genera resúmenes estructurados y claros de los temas del curso CTA
        </p>
        <div className="space-y-4">
          {/* Tema del Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema del Curso
            </label>
            <select
              value={config.tema}
              onChange={(e) => handleTemaChange(e.target.value)}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={isLoadingTemas || isLoadingContenido}
            >
              <option value="">
                {isLoadingTemas ? "Cargando temas..." : isLoadingContenido ? "Cargando contenido..." : "Selecciona un tema"}
              </option>
              {temasDisponibles.map((tema) => (
                <option key={tema} value={tema}>
                  {tema}
                </option>
              ))}
            </select>
            {temasDisponibles.length === 0 && !isLoadingTemas && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                No hay materiales disponibles. Sube archivos en la sección de Gestión de Materiales.
              </p>
            )}
            {contenidoMaterial && (
              <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                ✓ Material cargado ({contenidoMaterial.length} caracteres)
              </p>
            )}
          </div>

          {/* Extensión del Resumen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Extensión del Resumen
            </label>
            <select
              value={config.extensionParrafos}
              onChange={(e) => setConfig({ ...config, extensionParrafos: parseInt(e.target.value) })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={2}>Corto (1-2 párrafos)</option>
              <option value={4}>Medio (3-4 párrafos)</option>
              <option value={6}>Extenso (5+ párrafos)</option>
            </select>
          </div>

          <button
            onClick={handleGenerar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generando...' : 'Generar Resumen'}
          </button>
        </div>
      </div>

      {resultado && (
        <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resumen Generado</h2>
            <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-3 py-1 rounded-full">
              {resultado.paragraphs.length} párrafos
            </span>
          </div>
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">{resultado.topic}</h3>
          <div className="prose max-w-none">
            <div className="text-gray-700 dark:text-gray-200 leading-relaxed space-y-3">
              {resultado.paragraphs.length > 0 ? (
                resultado.paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))
              ) : (
                <p>No se recibieron párrafos en la respuesta.</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => navigator.clipboard.writeText(resultado.paragraphs.join('\n\n'))}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Copiar
            </button>
            <button
              onClick={() => {/* Aquí iría la lógica de descarga */}}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
            >
              Descargar PDF
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
