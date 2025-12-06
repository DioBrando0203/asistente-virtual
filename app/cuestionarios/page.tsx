"use client";

import { useState } from "react";
import ModelSelector from "@/components/ui/ModelSelector";
import { AIModel, QuizConfig } from "@/types";

export default function CuestionariosPage() {
  const [config, setConfig] = useState<QuizConfig>({
    curso: "",
    tema: "",
    tipoPreguntas: "multiple",
    numeroPreguntas: 5,
    //modelo: "gemini",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<any>(null);

  const handleGenerar = async () => {
    if (!config.curso.trim() || !config.tema.trim()) {
      alert("Por favor ingresa el curso y el tema del curso");
      return;
    }

    setIsLoading(true);
    setResultado(null);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://chatbotapi.test/api";
      const payload = { ...config, cantidad: config.numeroPreguntas };

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
        <div className="space-y-4">
          {/* Curso */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Curso</label>
            <input
              type="text"
              value={config.curso}
              onChange={(e) => setConfig({ ...config, curso: e.target.value })}
              placeholder="Ej: Álgebra lineal, Biología general, Literatura"
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Tema */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tema del curso</label>
            <input
              type="text"
              value={config.tema}
              onChange={(e) => setConfig({ ...config, tema: e.target.value })}
              placeholder="Ej: Vectores y matrices, Células, Realismo mágico"
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          {/* Tipo de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Tipo de Preguntas</label>
            <select
              value={config.tipoPreguntas}
              onChange={(e) => setConfig({ ...config, tipoPreguntas: e.target.value as QuizConfig["tipoPreguntas"] })}
              className="w-full px-4 py-2 border border-black/20 dark:border-white/20 rounded-lg focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="multiple">Opción múltiple</option>
              <option value="verdadero-falso">Verdadero/Falso</option>
              <option value="abierta">Pregunta abierta</option>
              <option value="mixta">Mixta</option>
            </select>
          </div>

          {/* Número de Preguntas */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Número de Preguntas (máximo 15): {config.numeroPreguntas}
            </label>
            <input
              type="range"
              min="1"
              max="15"
              value={config.numeroPreguntas}
              onChange={(e) => setConfig({ ...config, numeroPreguntas: parseInt(e.target.value, 10) })}
              className="w-full"
            />
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
