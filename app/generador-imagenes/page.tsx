'use client';

import { useState, useEffect } from 'react';
import { ImageGenerationConfig, ImageGenerationResult } from '@/types';

export default function GeneradorImagenesPage() {
  const [config, setConfig] = useState<ImageGenerationConfig>({
    tema: '',
    descripcion: '',
    temaPersonalizado: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ImageGenerationResult | null>(null);
  const [temasDisponibles, setTemasDisponibles] = useState<string[]>([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(false);
  const [usarTemaPersonalizado, setUsarTemaPersonalizado] = useState(false);

  // Cargar lista de temas del bucket al montar el componente
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

  const handleGenerar = async () => {
    // Validaciones
    if (!config.descripcion.trim()) {
      alert('Por favor ingresa una descripción para la imagen');
      return;
    }

    const temaFinal = usarTemaPersonalizado ? config.temaPersonalizado : config.tema;

    if (!temaFinal || !temaFinal.trim()) {
      alert('Por favor selecciona un tema o ingresa uno personalizado');
      return;
    }

    setIsLoading(true);
    setResultado(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';

      const payload = {
        tema: temaFinal,
        descripcion: config.descripcion,
      };

      const response = await fetch(`${apiUrl}/imagenes/generar`, {
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
          'No se pudo generar la imagen';
        throw new Error(message);
      }

      // Construir resultado
      const imageUrl = data?.data?.imageUrl || data?.imageUrl || '';

      if (!imageUrl) {
        throw new Error('No se recibió URL de la imagen');
      }

      setResultado({
        id: data?.data?.id || `img-${Date.now()}`,
        imageUrl: imageUrl,
        descripcion: config.descripcion,
        tema: temaFinal,
        createdAt: new Date(),
      });
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error?.message || 'No se pudo generar la imagen'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDescargar = async () => {
    if (!resultado?.imageUrl) return;

    try {
      const response = await fetch(resultado.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `imagen-${resultado.tema}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al descargar imagen:', error);
      alert('Error al descargar la imagen. Intenta hacer clic derecho > Guardar imagen como...');
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
        Generador de Imágenes
      </h1>

      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Genera imágenes personalizadas usando IA
        </p>
        <div className="space-y-4">
          {/* Opción: Tema de lista o personalizado */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Seleccionar Tema
            </label>
            <div className="flex items-center space-x-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoTema"
                  checked={!usarTemaPersonalizado}
                  onChange={() => setUsarTemaPersonalizado(false)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">De la lista</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="tipoTema"
                  checked={usarTemaPersonalizado}
                  onChange={() => setUsarTemaPersonalizado(true)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">Personalizado</span>
              </label>
            </div>

            {!usarTemaPersonalizado ? (
              <select
                value={config.tema}
                onChange={(e) => setConfig({ ...config, tema: e.target.value })}
                className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                disabled={isLoadingTemas}
              >
                <option value="">
                  {isLoadingTemas ? 'Cargando temas...' : 'Selecciona un tema'}
                </option>
                {temasDisponibles.map((tema) => (
                  <option key={tema} value={tema}>
                    {tema}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type="text"
                value={config.temaPersonalizado}
                onChange={(e) => setConfig({ ...config, temaPersonalizado: e.target.value })}
                placeholder="Ingresa un tema personalizado..."
                className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
            )}

            {temasDisponibles.length === 0 && !isLoadingTemas && !usarTemaPersonalizado && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">
                No hay temas disponibles. Sube archivos en la sección de Gestión de Materiales o usa un tema personalizado.
              </p>
            )}
          </div>

          {/* Descripción de la Imagen */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Descripción de la Imagen
            </label>
            <textarea
              value={config.descripcion}
              onChange={(e) => setConfig({ ...config, descripcion: e.target.value })}
              placeholder="Describe la imagen que deseas generar..."
              rows={4}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ejemplo: "Una ilustración educativa sobre algoritmos de búsqueda en estructuras de datos"
            </p>
          </div>

          {/* Botón Generar */}
          <button
            onClick={handleGenerar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Generando imagen...' : 'Generar Imagen'}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Imagen Generada
          </h2>

          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Tema:</span> {resultado.tema}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">Descripción:</span> {resultado.descripcion}
            </p>
          </div>

          <div className="mb-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <img
              src={resultado.imageUrl}
              alt={resultado.descripcion}
              className="w-full h-auto"
              onError={(e) => {
                console.error('Error cargando imagen:', resultado.imageUrl);
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23ddd" width="400" height="300"/%3E%3Ctext fill="%23999" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EError al cargar imagen%3C/text%3E%3C/svg%3E';
              }}
            />
          </div>

          <div className="flex space-x-4">
            <button
              onClick={handleDescargar}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
            >
              Descargar Imagen
            </button>
            <button
              onClick={() => setResultado(null)}
              className="flex-1 bg-gray-600 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
            >
              Generar Nueva
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
