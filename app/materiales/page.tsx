'use client';

import { useState } from 'react';
import { Material } from '@/types';

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formElement = e.currentTarget;
    const formData = new FormData(formElement);
    const file = formData.get('file') as File;

    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    try {
      // Enviar archivo al backend para extracción de texto
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
      const extractFormData = new FormData();
      extractFormData.append('file', file);

      const response = await fetch(`${apiUrl}/materiales/extract-text`, {
        method: 'POST',
        body: extractFormData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error al extraer texto del archivo');
      }

      const data = await response.json();

      if (!data.success || !data.text) {
        throw new Error('No se pudo extraer texto del archivo');
      }

      const extractedText = data.text.trim();

      if (!extractedText) {
        alert('El archivo no contiene texto extraíble.');
        return;
      }

      const baseName = file.name.replace(/\.[^/.]+$/, '') || 'material';
      const textBlob = new Blob([extractedText], { type: 'text/plain' });
      setExtractedPreview(extractedText);

      // Guardamos solo el texto extraído en un .txt (modo sin backend completo).
      const nuevoMaterial: Material = {
        id: `local-${Date.now()}`,
        nombre: `${baseName}.txt`,
        tipo: 'text',
        url: URL.createObjectURL(textBlob),
        tamano: textBlob.size,
        curso: filtro || 'Sin curso',
        uploadedAt: new Date(),
      };

      setMateriales((prev) => [nuevoMaterial, ...prev]);
      alert('Texto extraído correctamente! (guardado localmente)');
      formElement.reset();
    } catch (error) {
      console.error(error);
      const message = error instanceof Error ? error.message : 'Error al subir material';
      alert(message);
      setExtractedPreview('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return;

    try {
      setMateriales((prev) => prev.filter((mat) => mat.id !== id));
      alert('Material eliminado (modo sin backend)');
    } catch (error) {
      console.error(error);
      alert('Error al eliminar material');
    }
  };

  const getFileIcon = (tipo: string) => {
    switch (tipo) {
      case 'pdf': return 'PDF';
      case 'image': return 'IMG';
      case 'word': return 'DOC';
      case 'text': return 'TXT';
      default: return 'FILE';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Gestión de Materiales</h1>

      {/* Formulario de Subida */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Subir Nuevo Material</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Archivo (PDF, DOCX o TXT)
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,.docx,.txt"
              className="w-full px-4 py-2 border border-black/20 dark:border-white/25 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/40 dark:file:text-indigo-200"
              required
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              El sistema extraerá automáticamente el texto del archivo
            </p>
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isUploading ? 'Extrayendo texto...' : 'Subir y Extraer Texto'}
          </button>
        </form>
      </div>

      {/* Preview de texto extraído */}
      {extractedPreview && (
        <div className="bg-green-50 dark:bg-green-900/30 border-2 border-green-500 dark:border-green-400 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">Texto Extraído Exitosamente</h2>
            <button
              onClick={() => setExtractedPreview('')}
              className="text-green-700 dark:text-green-200 hover:text-green-900 dark:hover:text-white font-semibold"
            >
              Cerrar
            </button>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded border border-green-300 dark:border-green-500/60 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap">{extractedPreview}</p>
          </div>
          <p className="text-sm text-green-700 dark:text-green-200 mt-2">
            Total: {extractedPreview.length} caracteres extraídos
          </p>
        </div>
      )}

      {/* Filtro */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por curso:
          </label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Escribe el nombre del curso..."
            className="flex-1 px-4 py-2 border border-black/20 dark:border-white/25 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white bg-white dark:bg-gray-800"
          />
          {filtro && (
            <button
              onClick={() => setFiltro('')}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-100 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Materiales */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
          Materiales Subidos ({materiales.length})
        </h2>

        {materiales.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            <p className="text-lg">No hay materiales subidos aún</p>
            <p className="text-sm">Sube tu primer archivo usando el formulario arriba</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {materiales.map((material) => (
              <div
                key={material.id}
                className="surface-border rounded-lg p-4 hover:shadow-lg transition-shadow bg-white dark:bg-gray-800"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded text-sm font-semibold text-gray-700 dark:text-gray-100">
                    {getFileIcon(material.tipo)}
                  </div>
                  <span className="bg-indigo-100 dark:bg-indigo-900/40 text-indigo-800 dark:text-indigo-200 text-xs font-semibold px-2 py-1 rounded">
                    {material.curso}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1 truncate" title={material.nombre}>
                  {material.nombre}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {formatFileSize(material.tamano)} • {material.tipo.toUpperCase()}
                </p>
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Subido: {new Date(material.uploadedAt).toLocaleDateString('es-ES')}
                </div>
                <div className="flex space-x-2">
                  <a
                    href={material.url}
                    download={material.nombre}
                    className="flex-1 bg-indigo-600 text-white text-center py-2 rounded-lg hover:bg-indigo-700 text-sm"
                  >
                    Descargar
                  </a>
                  <button
                    onClick={() => handleDelete(material.id)}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 text-sm"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
