'use client';

import Link from 'next/link';
import { useTheme } from './theme-provider';
import { LottieAnimation } from './lottie-animation';

export function Navbar() {
  const { theme, toggleTheme } = useTheme();

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <Link href="/" className="flex items-center gap-3 text-xl font-bold text-indigo-600 dark:text-indigo-400">
              <LottieAnimation
                src="/animations/animation.lottie"
                width={40}
                height={40}
                loop={true}
                autoplay={true}
              />
              Asistente Educativo
            </Link>
            <div className="hidden md:flex md:space-x-4 md:items-center">
              <Link href="/cuestionarios" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Cuestionarios
              </Link>
              <Link href="/resumenes" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Resúmenes
              </Link>
              <Link href="/evaluador" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Evaluador
              </Link>
              <Link href="/generador-imagenes" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Imágenes
              </Link>
              <Link href="/generador-temas" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Temas
              </Link>
               <Link href="/materiales" className="text-gray-800 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-2 rounded-md text-sm font-medium">
                Materiales
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <svg className="w-5 h-5 text-gray-700 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-gray-300 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
