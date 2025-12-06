"use client";

import { useState, useEffect } from "react";
import { QuizConfig } from "@/types";

export default function CuestionariosPage() {
  const [config, setConfig] = useState<QuizConfig>({
    curso: "CTA",
    tema: "",
    tipoPreguntas: "mixta",
    numeroPreguntas: 5,
    //modelo: "gemini",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);
  const [temasDisponibles, setTemasDisponibles] = useState<string[]>([]);
  const [isLoadingTemas, setIsLoadingTemas] = useState(false);
  const [contenidoMaterial, setContenidoMaterial] = useState<string>("");
  const [isLoadingContenido, setIsLoadingContenido] = useState(false);

  // Cargar lista de archivos del bucket al montar el componente
  useEffect(() => {
    const cargarTemas = async () => {
      setIsLoadingTemas(true);
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://chatbotapi.test/api";
        const response = await fetch(`${apiUrl}/materiales/list-topics`);

        if (!response.ok) {
          throw new Error("Error al cargar temas del bucket");
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
          console.error("Formato de respuesta inesperado:", data);
        }
      } catch (error) {
        console.error("Error al cargar temas:", error);
        alert("No se pudieron cargar los temas disponibles del bucket");
      } finally {
        setIsLoadingTemas(false);
      }
    };

    cargarTemas();
  }, []);

  // Cargar contenido del archivo cuando se selecciona un tema
  const cargarContenidoTema = async (nombreArchivo: string) => {
    if (!nombreArchivo) {
      setContenidoMaterial("");
      return;
    }

    setIsLoadingContenido(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://chatbotapi.test/api";
      // Agregar extensión .txt si no la tiene
      const archivoConExtension = nombreArchivo.endsWith('.txt') ? nombreArchivo : `${nombreArchivo}.txt`;

      const response = await fetch(`${apiUrl}/materiales/list-topics-with-content`);

      if (!response.ok) {
        throw new Error('Error al cargar contenido del material');
      }

      const data = await response.json();

      if (data.success && data.files) {
        let filesArray = Array.isArray(data.files) ? data.files : Object.values(data.files);

        // Buscar el archivo específico
        const archivo = filesArray.find((f: any) => f.name === archivoConExtension);

        if (archivo && archivo.content) {
          setContenidoMaterial(archivo.content);
          console.log(`Contenido cargado: ${archivo.content.length} caracteres`);
        } else {
          console.warn(`No se encontró contenido para: ${archivoConExtension}`);
          setContenidoMaterial("");
        }
      }
    } catch (error) {
      console.error('Error al cargar contenido:', error);
      setContenidoMaterial("");
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
      alert("Por favor selecciona un tema del curso");
      return;
    }

    setIsLoading(true);
    setResultado(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://chatbotapi.test/api";

      // Agregar contenido del material al payload
      const payload = {
        ...config,
        cantidad: config.numeroPreguntas,
        contenidoMaterial: contenidoMaterial || undefined // Solo enviar si existe
      };

      const response = await fetch(`${apiUrl}/cuestionarios/generar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const contentType = response.headers.get("content-type") || "";
      let data: any = null;

      if (contentType.includes("application/json")) {
        data = await response.json();
      } else {
        const text = await response.text();
        throw new Error(`Error HTTP ${response.status}: ${text || response.statusText}`);
      }

      const success = response.ok && (data?.success ?? true);
      const resultadoData = data?.data ?? data;

      if (!success || (!resultadoData?.questions && !resultadoData?.preguntas)) {
        const message =
          data?.error ||
          data?.message ||
          data?.detail ||
          response.statusText ||
          "No se pudo generar el cuestionario";
        throw new Error(message);
      }

      setResultado(resultadoData);
    } catch (error: any) {
      console.error(error);
      alert(`Error: ${error?.message || "No se pudo generar el cuestionario"}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Generador de Cuestionarios</h1>

      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6 mb-6">
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Genera cuestionarios automáticos basados en el material del curso CTA
        </p>
        <div className="space-y-4">
          {/* Tema del Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema del Curso</label>
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

          {/* Tipo de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Preguntas</label>
            <select
              value={config.tipoPreguntas}
              onChange={(e) => setConfig({ ...config, tipoPreguntas: e.target.value as QuizConfig["tipoPreguntas"] })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="mixta">Mixto</option>
              <option value="verdadero-falso">Verdadero y Falso</option>
              <option value="multiple">Opción Múltiple</option>
              <option value="abierta">Preguntas Abiertas</option>
            </select>
          </div>

          {/* Número de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Número de Preguntas</label>
            <select
              value={config.numeroPreguntas}
              onChange={(e) => setConfig({ ...config, numeroPreguntas: parseInt(e.target.value, 10) })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value={5}>5 preguntas</option>
              <option value={10}>10 preguntas</option>
              <option value={15}>15 preguntas</option>
              <option value={20}>20 preguntas</option>
            </select>
          </div>

          {/* Selector de Modelo
          <ModelSelector
            selected={config.modelo as AIModel}
            onChange={(modelo) => setConfig({ ...config, modelo })}
          /> */}

          {/* Botón Generar */}
          <button
            onClick={handleGenerar}
            disabled={isLoading}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isLoading ? "Generando..." : "Generar Cuestionario"}
          </button>
        </div>
      </div>

      {/* Resultado */}
      {resultado && (
        <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Cuestionario Generado</h2>
          <div className="space-y-4">
            {(resultado.questions || resultado.preguntas)?.map((pregunta: any, index: number) => (
              <div key={index} className="border-b border-black/10 dark:border-white/10 pb-4">
                <p className="font-semibold text-gray-900 dark:text-white mb-2">
                  {index + 1}. {pregunta.question || pregunta.pregunta}
                </p>
                {pregunta.options && pregunta.options.length > 0 && (
                  <ul className="ml-6 space-y-1">
                    {pregunta.options.map((opcion: string, i: number) => (
                      <li key={i} className="text-gray-700 dark:text-gray-300">
                        {String.fromCharCode(65 + i)}) {opcion}
                      </li>
                    ))}
                  </ul>
                )}
                {pregunta.answer && (
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">Respuesta: {pregunta.answer}</p>
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => {
              /* Aquí iría la lógica de descarga */
            }}
            className="mt-6 bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700"
          >
            Descargar PDF
          </button>
        </div>
      )}
    </div>
  );
}
