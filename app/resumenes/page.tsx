'use client';

import { useState } from 'react';
import ModelSelector from '@/components/ui/ModelSelector';
import { AIModel, ResumenConfig } from '@/types';

type ResultadoResumen = {
  topic: string;
  format?: string;
  paragraphs: string[];
};

export default function ResumenesPage() {
  const [config, setConfig] = useState<ResumenConfig>({
    tema: '',
    extensionParrafos: 3,
    formato: 'simple',
    //modelo: 'gemini',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ResultadoResumen | null>(null);

  const handleGenerar = async () => {
    if (!config.tema.trim()) {
      alert('Por favor ingresa un tema');
      return;
    }

    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
      const response = await fetch(`${apiUrl}/resumenes/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
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
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tema del Resumen
            </label>
            <input
              type="text"
              value={config.tema}
              onChange={(e) => setConfig({ ...config, tema: e.target.value })}
              placeholder="Ej: La Segunda Guerra Mundial, ADN y Genética, etc."
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Extensión: {config.extensionParrafos} párrafo{config.extensionParrafos > 1 ? 's' : ''}
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={config.extensionParrafos}
              onChange={(e) => setConfig({ ...config, extensionParrafos: parseInt(e.target.value) })}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
              <span>Breve (1)</span>
              <span>Extenso (10)</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Formato del Resumen
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[{ value: 'simple', label: 'Simple', desc: 'Párrafos sencillos' }, { value: 'detallado', label: 'Detallado', desc: 'Más información' }, { value: 'bullet-points', label: 'Puntos', desc: 'Lista de puntos' }].map((formato) => (
                <button
                  key={formato.value}
                  onClick={() => setConfig({ ...config, formato: formato.value as any })}
                  className={`p-3 rounded-lg border-2 text-left transition-all ${
                    config.formato === formato.value
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/30'
                      : 'border-black/10 dark:border-white/10 hover:border-indigo-300'
                  }`}
                >
                  <div className="font-semibold text-gray-900 dark:text-white">{formato.label}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">{formato.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Selector de Modelo 
          <ModelSelector
            selected={config.modelo}
            onChange={(modelo: AIModel) => setConfig({ ...config, modelo })}
          />*/}

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
