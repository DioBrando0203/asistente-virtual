'use client';

import Link from 'next/link';

const sections = [
  { title: 'Cuestionarios', href: '/cuestionarios', desc: 'Genera cuestionarios IA' },
  { title: 'Resúmenes', href: '/resumenes', desc: 'Resume contenidos largos' },
  { title: 'Evaluador', href: '/evaluador', desc: 'Evalúa respuestas de estudiantes' },
  { title: 'Materiales', href: '/materiales', desc: 'Sube y consulta materiales' },
  { title: 'Generador de Imágenes', href: '/generador-imagenes', desc: 'Genera imágenes educativas con IA' },
  { title: 'Generador de Temas', href: '/generador-temas', desc: 'Crea contenido educativo completo' },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Panel principal</h1>
        <p className="text-gray-700 dark:text-gray-300 mt-2">
          Accesos rápidos a las herramientas del asistente.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block bg-white dark:bg-gray-900 surface-border rounded-lg shadow-sm hover:shadow-md transition-shadow p-5"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">{item.title}</h2>
            <p className="text-sm text-gray-700 dark:text-gray-300">{item.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
