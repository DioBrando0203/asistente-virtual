import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Generador de Cuestionarios',
      description: 'Crea cuestionarios personalizados con diferentes tipos de preguntas',
      icon: '📝',
      href: '/cuestionarios',
      color: 'bg-blue-500',
    },
    {
      title: 'Generador de Resúmenes',
      description: 'Genera resúmenes de cualquier tema con control de extensión',
      icon: '📄',
      href: '/resumenes',
      color: 'bg-green-500',
    },
    {
      title: 'Evaluador de Respuestas',
      description: 'Evalúa respuestas de estudiantes con retroalimentación IA',
      icon: '✅',
      href: '/evaluador',
      color: 'bg-purple-500',
    },
    {
      title: 'Gestión de Materiales',
      description: 'Sube y gestiona PDFs, imágenes y documentos del curso',
      icon: '📚',
      href: '/materiales',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Bienvenido al Asistente Educativo con IA
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Herramientas potenciadas por inteligencia artificial para facilitar
          la creación de contenido educativo y evaluación de estudiantes
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow border border-gray-200 hover:border-indigo-500"
          >
            <div className="flex items-start space-x-4">
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-2xl flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="mt-16 max-w-5xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-lg p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Características del Sistema</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">4</div>
              <div className="text-indigo-100">Modelos de IA Disponibles</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">∞</div>
              <div className="text-indigo-100">Cuestionarios Generados</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold mb-2">100%</div>
              <div className="text-indigo-100">Evaluación Automatizada</div>
            </div>
          </div>
        </div>
      </div>

      {/* How it Works */}
      <div className="mt-16 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          ¿Cómo funciona?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              1️⃣
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Selecciona Herramienta</h3>
            <p className="text-sm text-gray-600">Elige entre cuestionarios, resúmenes, evaluador o materiales</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              2️⃣
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Configura Parámetros</h3>
            <p className="text-sm text-gray-600">Define tema, tipo, cantidad y modelo de IA a usar</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              3️⃣
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Genera con IA</h3>
            <p className="text-sm text-gray-600">La IA procesa tu solicitud y genera el contenido</p>
          </div>
          <div className="text-center">
            <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              4️⃣
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Descarga o Usa</h3>
            <p className="text-sm text-gray-600">Descarga, comparte o usa el contenido generado</p>
          </div>
        </div>
      </div>
    </div>
  );
}
