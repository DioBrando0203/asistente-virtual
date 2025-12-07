import { Suspense } from 'react';
import ResumenesClient from './ResumenesClient';

// Skeleton loading component
function ResumenesLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-64 mb-6 animate-pulse"></div>
      <div className="bg-white dark:bg-gray-900 surface-border rounded-lg shadow-md p-6">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-4 animate-pulse"></div>
        <div className="space-y-4">
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}

// Server Component que hace fetch en el servidor
async function getTemasDisponibles() {
  try {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://chatbotapi.test/api';
    const response = await fetch(`${apiUrl}/materiales/list-topics`, {
      next: { revalidate: 60 } // Cache por 60 segundos
    });

    if (!response.ok) {
      console.error('Error al cargar temas');
      return [];
    }

    const data = await response.json();

    if (data.success) {
      let filesArray: string[] = [];

      if (Array.isArray(data.files)) {
        filesArray = data.files;
      } else if (data.files && typeof data.files === 'object') {
        filesArray = Object.values(data.files);
      }

      return filesArray.map((file: string) => file.replace(/\.txt$/, ''));
    }

    return [];
  } catch (error) {
    console.error('Error al cargar temas:', error);
    return [];
  }
}

// Server Component principal
export default async function ResumenesPage() {
  // Esto se ejecuta en el servidor, no incrementa el bundle del cliente
  const temas = await getTemasDisponibles();

  return (
    <Suspense fallback={<ResumenesLoading />}>
      <ResumenesClient temasDisponibles={temas} />
    </Suspense>
  );
}
