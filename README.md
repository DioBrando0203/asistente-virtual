# 🎓 Asistente Educativo con IA

Sistema completo de herramientas educativas potenciadas por inteligencia artificial.

## ✨ Características

### 1. Generador de Cuestionarios
- Crear cuestionarios personalizados por tema
- Tipos: Opción múltiple, Verdadero/Falso, Abierta, Mixta
- Control de número de preguntas (5-50)
- Niveles de dificultad: Fácil, Media, Difícil

### 2. Generador de Resúmenes
- Resúmenes de cualquier tema
- Control de extensión (1-10 párrafos)
- Formatos: Simple, Detallado, Bullet Points

### 3. Evaluador de Respuestas
- Evaluación automática con IA
- Calificación de 0-100
- Retroalimentación detallada
- Puntos positivos y a mejorar

### 4. Gestión de Materiales
- Subir PDFs, imágenes, Word
- Organizar por cursos
- Filtrar y buscar materiales

## 🚀 Instalación

```bash
npm install
```

## 🔧 Configuración

1. Copia `.env.local` y configura:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

2. Cambia la URL cuando tengas el backend Laravel desplegado.

## 🏃 Ejecutar

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm run start
```

## 📡 Endpoints del Backend (Laravel)

Tu amigo debe crear estos endpoints:

### POST /api/cuestionarios/generar
```json
{
  "tema": "string",
  "tipoPreguntas": "multiple|verdadero-falso|abierta|mixta",
  "numeroPreguntas": number,
  "dificultad": "facil|media|dificil",
  "modelo": "gemini|gpt-4|claude|gpt-3.5"
}
```

### POST /api/resumenes/generar
```json
{
  "tema": "string",
  "extensionParrafos": number,
  "formato": "simple|detallado|bullet-points",
  "modelo": "gemini|gpt-4|claude|gpt-3.5"
}
```

### POST /api/evaluador/evaluar
```json
{
  "temaCurso": "string",
  "pregunta": "string",
  "respuestaEstudiante": "string",
  "modelo": "gemini|gpt-4|claude|gpt-3.5"
}
```

### POST /api/materiales/subir (multipart/form-data)
- file: archivo
- curso: string
- nombre: string (opcional)

### GET /api/materiales?curso=nombre

### DELETE /api/materiales/:id

Ver `RESUMEN-PROYECTOS.md` en la carpeta raíz para más detalles.

## 🎨 Estructura del Proyecto

```
app/
├── page.tsx              # Dashboard principal
├── layout.tsx            # Layout con navegación
├── cuestionarios/        # Generador de cuestionarios
├── resumenes/            # Generador de resúmenes
├── evaluador/            # Evaluador de respuestas
└── materiales/           # Gestión de archivos

components/
└── ui/
    └── ModelSelector.tsx # Selector de modelos IA

types/
└── index.ts              # Tipos TypeScript
```

## 🌐 Desplegar en Vercel

```bash
# Subir a GitHub
git init
git add .
git commit -m "Asistente educativo"
git push origin main

# En Vercel:
# 1. Importar repositorio
# 2. Agregar variable: NEXT_PUBLIC_API_URL
# 3. Desplegar
```

## 🤝 Para el Backend (Laravel)

Envía a tu amigo el archivo `RESUMEN-PROYECTOS.md` que contiene:
- Todos los endpoints necesarios
- Formato de request/response
- Ejemplos completos

## 📝 Notas

- Todos los formularios tienen validación
- Selector de modelos IA en cada herramienta
- Diseño responsive
- Manejo de errores
- Estados de carga

## 🎯 Próximos Pasos

1. Conectar con el backend Laravel
2. Probar todas las funcionalidades
3. Agregar funcionalidad de descarga PDF (opcional)
4. Desplegar en Vercel

---

Desarrollado con ❤️ usando Next.js 15, TypeScript y Tailwind CSS
