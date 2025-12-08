'use client';

import { useState } from 'react';
import { TemaGenerationConfig, TemaGenerationResult } from '@/types';
import { generarPDFTema } from '@/lib/pdf-generator';

export default function GeneradorTemasPage() {
  const [config, setConfig] = useState<TemaGenerationConfig>({
    titulo: '',
    descripcion: '',
    nivelEducativo: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<TemaGenerationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const nivelesEducativos = [
    '1ero de Secundaria',
    '2do de Secundaria',
    '3ero de Secundaria',
    '4to de Secundaria',
    '5to de Secundaria',
  ];

  const handleGenerar = async () => {
    // Validaciones
    if (!config.titulo.trim()) {
      alert('Por favor ingresa un título para el tema');
      return;
    }

    if (!config.descripcion.trim()) {
      alert('Por favor ingresa una descripción');
      return;
    }

    if (!config.nivelEducativo) {
      alert('Por favor selecciona un nivel educativo');
      return;
    }

    setIsLoading(true);
    setResultado(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const payload = {
        titulo: config.titulo,
        descripcion: config.descripcion,
        nivelEducativo: config.nivelEducativo,
      };

      const response = await fetch(`${apiUrl}/temas/generar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get('content-type') || '';
      let data: any = null;

      if (contentType.includes('application/json')) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${text || response.statusText}`);
      }

      const success = response.ok && (data?.success ?? true);

      if (!success) {
        const message =
          data?.error ||
          data?.message ||
          data?.detail ||
          response.statusText ||
          'No se pudo generar el tema';
        throw new Error(message);
      }

      // Construir resultado
      const contenido = data?.data?.contenido || data?.contenido || '';

      if (!contenido) {
        throw new Error('No se recibió contenido del tema');
      }

      setResultado({
        id: data?.data?.id || `tema-${Date.now()}`,
        titulo: config.titulo,
        contenido: contenido,
        nivelEducativo: config.nivelEducativo,
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error?.message || 'No se pudo generar el tema'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescargarPDF = () => {
    if (!resultado) return;
    generarPDFTema({
      titulo: resultado.titulo,
      contenido: resultado.contenido,
      nivelEducativo: resultado.nivelEducativo,
    });
  };

  const handleDescargarWord = () => {
    if (!resultado) return;

    // Crear contenido HTML formateado para Word
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>${resultado.titulo}</title>
        <style>
          body {
            font-family: 'Calibri', 'Arial', sans-serif;
            line-height: 1.6;
            margin: 2cm;
            font-size: 12pt;
          }
          h1 {
            color: #2c3e50;
            border-bottom: 3px solid #3498db;
            padding-bottom: 10px;
            margin-bottom: 20px;
          }
          .metadata {
            color: #7f8c8d;
            font-size: 10pt;
            margin-bottom: 30px;
          }
          p {
            text-align: justify;
            margin-bottom: 12pt;
          }
        </style>
      </head>
      <body>
        <h1>${resultado.titulo}</h1>
        <div class="metadata">
          <p><strong>Nivel Educativo:</strong> ${resultado.nivelEducativo}</p>
          <p><strong>Fecha de generación:</strong> ${new Date(resultado.createdAt).toLocaleDateString('es-ES')}</p>
        </div>
        <div>${resultado.contenido.replace(/\n/g, '<br>')}</div>
      </body>
      </html>
    `;

    // Crear blob y descargar
    const blob = new Blob([htmlContent], { type: 'application/msword' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resultado.titulo.replace(/\s+/g, '_')}.doc`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const handleSubirABucket = async () => {
    if (!resultado) return;

    setIsUploading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      // Crear archivo .txt con el contenido del tema
      const txtFileName = `${resultado.titulo.replace(/\s+/g, '_')}.txt`;
      const textContent = `${resultado.titulo}\n\nNivel: ${resultado.nivelEducativo}\n\n${resultado.contenido}`;
      const textBlob = new Blob([textContent], { type: 'text/plain' });
      const txtFile = new File([textBlob], txtFileName, { type: 'text/plain' });

      // Subir el archivo .txt a Supabase usando el endpoint existente
      const uploadFormData = new FormData();
      uploadFormData.append('file', txtFile);

      const uploadResponse = await fetch(`${apiUrl}/materiales/upload`, {
        method: 'POST',
        body: uploadFormData,
      });

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json();
        throw new Error(errorData.error || 'Error al subir archivo a Supabase');
      }

      const uploadData = await uploadResponse.json();

      if (!uploadData.success) {
        throw new Error('No se pudo subir el archivo a Supabase');
      }

      alert('¡Tema subido exitosamente al bucket! Ahora puedes verlo en Gestión de Materiales.');
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error al subir al bucket';
      alert(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Generador de Temas Educativos
      </h1>

      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Genera contenido educativo personalizado para el curso CTA usando IA
        </p>
        <div className="space-y-4">
          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Título del Tema
            </label>
            <input
              type="text"
              value={config.titulo}
              onChange={(e) => setConfig({ ...config, titulo: e.target.value })}
              placeholder="Ejemplo: Contaminación del agua y sus efectos en el medio ambiente"
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción del Tema
            </label>
            <textarea
              value={config.descripcion}
              onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
              placeholder="Describe el tema que deseas generar. Puedes incluir instrucciones específicas como: incluir ejemplos prácticos, enfocarse en aplicaciones reales, etc."
              rows={5}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Esta descripción se usará para generar el contenido educativo
            </p>
          </div>

          {/* Nivel Educativo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nivel Educativo
            </label>
            <select
              value={config.nivelEducativo}
              onChange={(e) => setConfig({ ...config, nivelEducativo: e.target.value })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Selecciona un nivel</option>
              {nivelesEducativos.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>

          {/* Botón Generar */}
          <button
            onClick={handleGenerar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generando tema...' : 'Generar Tema'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            {resultado.titulo}
          </h2>

          <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Nivel:</span> {resultado.nivelEducativo}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Generado:</span> {new Date(resultado.createdAt).toLocaleDateString('es-ES')}
            </p>
          </div>

          <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg mb-4 max-h-96 overflow-y-auto">
            <div className="text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
              {resultado.contenido}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleDescargarPDF}
              className="bg-red-600 text-white py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              Descargar PDF
            </button>
            <button
              onClick={handleDescargarWord}
              className="bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Descargar Word
            </button>
            <button
              onClick={handleSubirABucket}
              disabled={isUploading}
              className="bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isUploading ? 'Subiendo...' : 'Subir al Bucket'}
            </button>
          </div>

          <button
            onClick={() => setResultado(null)}
            className="w-full mt-4 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Generar Nuevo Tema
          </button>
        </div>
      )}
    </div>
  );
}
