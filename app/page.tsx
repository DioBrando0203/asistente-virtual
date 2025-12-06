'use client';

import Link from 'next/link';

export default function Home() {
  const features = [
    {
      title: 'Generador de Cuestionarios',
      description: 'Crea cuestionarios personalizados con diferentes tipos de preguntas',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/cuestionarios',
      color: 'bg-blue-500',
    },
    {
      title: 'Generador de Resúmenes',
      description: 'Genera resúmenes de cualquier tema con control de extensión',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      href: '/resumenes',
      color: 'bg-green-500',
    },
    {
      title: 'Evaluador de Respuestas',
      description: 'Evalúa respuestas de estudiantes con retroalimentación IA',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      href: '/evaluador',
      color: 'bg-purple-500',
    },
    {
      title: 'Gestión de Materiales',
      description: 'Sube y gestiona PDFs, imágenes y documentos del curso',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
      href: '/materiales',
      color: 'bg-orange-500',
    },
  ];

  return (
    <div className="px-4 py-10">
      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-shadow surface-border hover:border-black/50 dark:hover:border-white/60"
          >
            <div className="flex items-start space-x-4">
              <div className={`${feature.color} w-12 h-12 rounded-lg flex items-center justify-center text-white flex-shrink-0`}>
                {feature.icon}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300">
                  {feature.description}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
