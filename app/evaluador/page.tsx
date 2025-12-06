'use client';

import { useState, useEffect } from 'react';
import { EvaluacionConfig } from '@/types';

type ResultadoEvaluacion = {
  score: number;
  grade?: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
};

export default function EvaluadorPage() {
  const [config, setConfig] = useState<EvaluacionConfig>({
    temaCurso: '',
    pregunta: '',
    respuestaEstudiante: '',
    //modelo: 'gemini',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoEvaluacion | null>(null);
  const [temasDisponibles, setTemasDisponibles] = useState<string[]>([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(false);

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

  const handleEvaluar = async () => {
    if (!config.temaCurso || !config.pregunta.trim() || !config.respuestaEstudiante.trim()) {
      alert('Por favor completa todos los campos');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
      const response = await fetch(`${apiUrl}/evaluador/evaluar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();

      if (data.success === false) {
        throw new Error(data.error || data.message || 'No se pudo evaluar la respuesta');
      }

      const evaluation = data.evaluation ?? data.data ?? data;

      if (!evaluation) {
        throw new Error('Respuesta del servidor incompleta');
      }

      setResultado({
        score: evaluation.score ?? evaluation.calificacion ?? 0,
        grade: evaluation.grade ?? evaluation.nivel ?? '',
        feedback: evaluation.feedback ?? evaluation.retroalimentacion ?? '',
        strengths: evaluation.strengths ?? evaluation.puntosPositivos ?? [],
        improvements: evaluation.improvements ?? evaluation.puntosAMejorar ?? [],
      });
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error al evaluar respuesta';
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCalificacionColor = (calificacion: number) => {
    if (calificacion >= 90) return 'text-green-700 bg-green-100 dark:text-green-200 dark:bg-green-900/30';
    if (calificacion >= 70) return 'text-indigo-700 bg-indigo-100 dark:text-indigo-200 dark:bg-indigo-900/30';
    if (calificacion >= 50) return 'text-yellow-700 bg-yellow-100 dark:text-yellow-200 dark:bg-yellow-900/30';
    return 'text-red-700 bg-red-100 dark:text-red-200 dark:bg-red-900/30';
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Evaluador de Respuestas</h1>

      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6 text-gray-900 dark:text-white">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Evalúa las respuestas de los estudiantes con retroalimentación detallada del curso CTA
        </p>
        <div className="space-y-4">
          {/* Tema del Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema del Curso
            </label>
            <select
              value={config.temaCurso}
              onChange={(e) => setConfig({ ...config, temaCurso: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              disabled={isLoadingTemas}
            >
              <option value="">
                {isLoadingTemas ? "Cargando temas..." : "Selecciona un tema"}
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
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Pregunta del Examen
            </label>
            <textarea
              value={config.pregunta}
              onChange={(e) => setConfig({ ...config, pregunta: e.target.value })}
              placeholder="Escribe la pregunta que se le hizo al estudiante..."
              rows={3}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Respuesta del Estudiante
            </label>
            <textarea
              value={config.respuestaEstudiante}
              onChange={(e) => setConfig({ ...config, respuestaEstudiante: e.target.value })}
              placeholder="Pega aquí la respuesta del estudiante que quieres evaluar..."
              rows={6}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
          </div>

          <button
            onClick={handleEvaluar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Evaluando...' : 'Evaluar Respuesta'}
          </button>
        </div>
      </div>

      {resultado && (
        <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Evaluación Completa</h2>
            <div className="flex items-center space-x-3">
              {resultado.grade ? (
                <span className="text-lg font-semibold text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-800 px-4 py-2 rounded-lg">
                  {resultado.grade}
                </span>
              ) : null}
              <div className={`text-4xl font-bold px-6 py-3 rounded-lg ${getCalificacionColor(resultado.score)}`}>
                {resultado.score}/100
              </div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Retroalimentación General</h3>
            <p className="text-gray-700 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              {resultado.feedback}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-indigo-700 dark:text-indigo-300 mb-3">Puntos Positivos</h3>
              <ul className="space-y-2">
                {resultado.strengths?.map((punto: string, index: number) => (
                  <li key={index} className="bg-indigo-50 dark:bg-indigo-900/30 p-3 rounded-lg text-gray-800 dark:text-gray-200 text-sm">
                    • {punto}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-300 mb-3">Puntos a Mejorar</h3>
              <ul className="space-y-2">
                {resultado.improvements?.map((punto: string, index: number) => (
                  <li key={index} className="bg-orange-50 dark:bg-orange-900/30 p-3 rounded-lg text-gray-800 dark:text-gray-200 text-sm">
                    • {punto}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => {
                const texto = `
Evaluación - ${config.temaCurso}
Calificación: ${resultado.score}/100${resultado.grade ? ` (${resultado.grade})` : ''}

Retroalimentación:
${resultado.feedback}

Puntos Positivos:
${resultado.strengths?.map((p: string) => `• ${p}`).join('\n')}

Puntos a Mejorar:
${resultado.improvements?.map((p: string) => `• ${p}`).join('\n')}
                `.trim();
                navigator.clipboard.writeText(texto);
                alert('Evaluación copiada al portapapeles');
              }}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
            >
              Copiar Evaluación
            </button>
            <button
              onClick={() => {/* Aquí iría la lógica de descarga */}}
              className="bg-indigo-500 text-white px-6 py-2 rounded-lg hover:bg-indigo-600"
            >
              Descargar PDF
            </button>
            <button
              onClick={() => {
                setResultado(null);
                setConfig({ temaCurso: '', pregunta: '', respuestaEstudiante: ''
                //  , modelo: 'gemini' 
                });
              }}
              className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
            >
              Nueva Evaluación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
