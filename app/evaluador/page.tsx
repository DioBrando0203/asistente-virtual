'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ui/ModelSelector';
import { AIModel, EvaluacionConfig } from '@/types';

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

  const handleEvaluar = async () => {
    if (!config.temaCurso.trim() || !config.pregunta.trim() || !config.respuestaEstudiante.trim()) {
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
    if (calificacion >= 90) return 'text-green-600 bg-green-50';
    if (calificacion >= 70) return 'text-blue-600 bg-blue-50';
    if (calificacion >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Evaluador de Respuestas</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          {/* Tema del Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema del Curso
            </label>
            <input
              type="text"
              value={config.temaCurso}
              onChange={(e) => setConfig({ ...config, temaCurso: e.target.value })}
              placeholder="Ej: Matemáticas - Álgebra Lineal"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900"
            />
          </div>

          {/* Pregunta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pregunta del Examen
            </label>
            <textarea
              value={config.pregunta}
              onChange={(e) => setConfig({ ...config, pregunta: e.target.value })}
              placeholder="Escribe la pregunta que se le hizo al estudiante..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
            />
          </div>

          {/* Respuesta del Estudiante */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Respuesta del Estudiante
            </label>
            <textarea
              value={config.respuestaEstudiante}
              onChange={(e) => setConfig({ ...config, respuestaEstudiante: e.target.value })}
              placeholder="Pega aquí la respuesta del estudiante que quieres evaluar..."
              rows={6}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 text-gray-900 resize-none"
            />
          </div>

          {/* Selector de Modelo 
          <ModelSelector
            selected={config.modelo}
            onChange={(modelo: AIModel) => setConfig({ ...config, modelo })}
          />*/}

          {/* Botón Evaluar */}
          <button
            onClick={handleEvaluar}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Evaluando...' : 'Evaluar Respuesta'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Evaluación Completa</h2>
            <div className="flex items-center space-x-3">
              {resultado.grade ? (
                <span className="text-lg font-semibold text-gray-700 bg-gray-100 px-4 py-2 rounded-lg">
                  {resultado.grade}
                </span>
              ) : null}
              <div className={`text-4xl font-bold px-6 py-3 rounded-lg ${getCalificacionColor(resultado.score)}`}>
                {resultado.score}/100
              </div>
            </div>
          </div>

          {/* Retroalimentación General */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Retroalimentación General</h3>
            <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">
              {resultado.feedback}
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Puntos Positivos */}
            <div>
              <h3 className="text-lg font-semibold text-green-700 mb-3 flex items-center">
                <span className="mr-2">✅</span> Puntos Positivos
              </h3>
              <ul className="space-y-2">
                {resultado.strengths?.map((punto: string, index: number) => (
                  <li key={index} className="bg-green-50 p-3 rounded-lg text-gray-800 text-sm">
                    • {punto}
                  </li>
                ))}
              </ul>
            </div>

            {/* Puntos a Mejorar */}
            <div>
              <h3 className="text-lg font-semibold text-orange-700 mb-3 flex items-center">
                <span className="mr-2">💡</span> Puntos a Mejorar
              </h3>
              <ul className="space-y-2">
                {resultado.improvements?.map((punto: string, index: number) => (
                  <li key={index} className="bg-orange-50 p-3 rounded-lg text-gray-800 text-sm">
                    • {punto}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex space-x-3">
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
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              📋 Copiar Evaluación
            </button>
            <button
              onClick={() => {/* Aquí iría la lógica de descarga */}}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              📥 Descargar PDF
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
              🔄 Nueva Evaluación
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
