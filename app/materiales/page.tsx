'use client';

import { useState, useEffect } from 'react';
import { Material } from '@/types';
import { extractTextFromFile } from '@/utils/fileTextExtractor';

export default function MaterialesPage() {
  const [materiales, setMateriales] = useState<Material[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [filtro, setFiltro] = useState('');
  const [extractedPreview, setExtractedPreview] = useState('');

  const fetchMateriales = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
      const url = filtro ? `${apiUrl}/materiales?curso=${filtro}` : `${apiUrl}/materiales`;
      const response = await fetch(url);
      const data = await response.json();
      if (data.success) {
        setMateriales(data.data);
      }
    } catch (error) {
      console.error('Error al cargar materiales:', error);
    }
  };

  // TEMPORAL: Comentado para probar sin backend
  // useEffect(() => {
  //   fetchMateriales();
  // }, [filtro]);

  const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;

    if (!file) {
      alert('Por favor selecciona un archivo');
      return;
    }

    setIsUploading(true);
    try {
      // Intentar extraer texto del archivo (PDF, DOCX, TXT)
      try {
        const extractedText = await extractTextFromFile(file);
        formData.append('extractedText', extractedText);
        setExtractedPreview(extractedText);
        console.log('Texto extraído exitosamente:', extractedText.substring(0, 100) + '...');
      } catch (extractError) {
        console.warn('No se pudo extraer texto del archivo:', extractError);
        setExtractedPreview('');
        // Continuar sin texto extraído (para imágenes u otros archivos)
      }

      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

      const response = await fetch(`${apiUrl}/materiales/subir`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        alert('Material subido exitosamente');
        fetchMateriales();
        e.currentTarget.reset();
        setExtractedPreview('');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error(error);
      alert('Error al subir material');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este material?')) return;

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';
      const response = await fetch(`${apiUrl}/materiales/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        alert('Material eliminado');
        fetchMateriales();
      } else {
        alert('Error: ' + data.error);
      }
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
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Materiales</h1>

      {/* Formulario de Subida */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Nuevo Material</h2>
        <form onSubmit={handleUpload} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seleccionar Archivo
            </label>
            <input
              type="file"
              name="file"
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx,.txt"
              className="w-full px-4 py-2 border border-black/25 dark:border-white/25 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              required
            />
          </div>
          <button
            type="submit"
            disabled={isUploading}
            className="w-full bg-orange-600 text-white py-3 rounded-lg font-semibold hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isUploading ? 'Subiendo...' : 'Subir Material'}
          </button>
        </form>
      </div>

      {/* Preview de texto extraído - TEMPORAL PARA PRUEBAS */}
      {extractedPreview && (
        <div className="bg-green-50 border-2 border-green-500 rounded-lg shadow-md p-6 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xl font-semibold text-green-900">Texto Extraído (Preview)</h2>
            <button
              onClick={() => setExtractedPreview('')}
              className="text-green-700 hover:text-green-900 font-semibold"
            >
              Cerrar
            </button>
          </div>
          <div className="bg-white p-4 rounded border border-green-300 max-h-96 overflow-y-auto">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{extractedPreview}</p>
          </div>
          <p className="text-sm text-green-700 mt-2">
            Total: {extractedPreview.length} caracteres
          </p>
        </div>
      )}

      {/* Filtro */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-4 mb-6">
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700">
            Filtrar por curso:
          </label>
          <input
            type="text"
            value={filtro}
            onChange={(e) => setFiltro(e.target.value)}
            placeholder="Escribe el nombre del curso..."
            className="flex-1 px-4 py-2 border border-black/25 dark:border-white/25 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-900"
          />
          {filtro && (
            <button
              onClick={() => setFiltro('')}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Lista de Materiales */}
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Materiales Subidos ({materiales.length})
        </h2>

        {materiales.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
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
                  <div className="bg-gray-100 px-3 py-1 rounded text-sm font-semibold text-gray-700">
                    {getFileIcon(material.tipo)}
                  </div>
                  <span className="bg-orange-100 text-orange-800 text-xs font-semibold px-2 py-1 rounded">
                    {material.curso}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900 mb-1 truncate" title={material.nombre}>
                  {material.nombre}
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  {formatFileSize(material.tamano)} • {material.tipo.toUpperCase()}
                </p>
                <div className="text-xs text-gray-500 mb-3">
                  Subido: {new Date(material.uploadedAt).toLocaleDateString('es-ES')}
                </div>
                <div className="flex space-x-2">
                  <a
                    href={material.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 text-white text-center py-2 rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Ver
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
