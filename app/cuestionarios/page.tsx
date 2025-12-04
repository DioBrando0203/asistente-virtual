'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ui/ModelSelector';
import { AIModel, QuizConfig } from '@/types';

export default function CuestionariosPage() {
  const [config, setConfig] = useState<QuizConfig>({
    tema: '',
    tipoPreguntas: 'multiple',
    numeroPreguntas: 10,
    dificultad: 'media',
    modelo: 'gemini',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleGenerar = async () => {
    if (!config.tema.trim()) {
      alert('Por favor ingresa un tema');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/cuestionarios/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        setResultado(data.data);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error al generar cuestionario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Generador de Cuestionarios</h1>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="space-y-4">
          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tema del Cuestionario
            </label>
            <input
              type="text"
              value={config.tema}
              onChange={(e) => setConfig({ ...config, tema: e.target.value })}
              placeholder="Ej: Física Cuántica, Historia de México, etc."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
            />
          </div>

          {/* Tipo de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Preguntas
            </label>
            <select
              value={config.tipoPreguntas}
              onChange={(e) => setConfig({ ...config, tipoPreguntas: e.target.value as any })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white text-gray-900"
            >
              <option value="multiple">Opción Múltiple</option>
              <option value="verdadero-falso">Verdadero/Falso</option>
              <option value="abierta">Pregunta Abierta</option>
              <option value="mixta">Mixta</option>
            </select>
          </div>

          {/* Número de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Preguntas: {config.numeroPreguntas}
            </label>
            <input
              type="range"
              min="5"
              max="50"
              value={config.numeroPreguntas}
              onChange={(e) => setConfig({ ...config, numeroPreguntas: parseInt(e.target.value) })}
              className="w-full"
            />
          </div>

          {/* Dificultad */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dificultad
            </label>
            <div className="flex space-x-4">
              {['facil', 'media', 'dificil'].map((nivel) => (
                <button
                  key={nivel}
                  onClick={() => setConfig({ ...config, dificultad: nivel as any })}
                  className={`px-4 py-2 rounded-lg font-medium ${
                    config.dificultad === nivel
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {nivel.charAt(0).toUpperCase() + nivel.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Modelo */}
          <ModelSelector
            selected={config.modelo}
            onChange={(modelo: AIModel) => setConfig({ ...config, modelo })}
          />

          {/* Botón Generar */}
          <button
            onClick={handleGenerar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Generando...' : 'Generar Cuestionario'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cuestionario Generado</h2>
          <div className="space-y-4">
            {resultado.preguntas?.map((pregunta: any, index: number) => (
              <div key={index} className="border-b pb-4">
                <p className="font-semibold text-gray-900 mb-2">
                  {index + 1}. {pregunta.pregunta}
                </p>
                {pregunta.opciones && (
                  <ul className="ml-6 space-y-1">
                    {pregunta.opciones.map((opcion: string, i: number) => (
                      <li key={i} className="text-gray-700">
                        {String.fromCharCode(65 + i)}) {opcion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {/* Aquí iría la lógica de descarga */}}
            className="mt-6 bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
