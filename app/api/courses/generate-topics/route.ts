import { NextRequest, NextResponse } from 'next/server';
import { OpenAIService } from '@/lib/openai-service';

export async function POST(request: NextRequest) {
  try {
    // Parsear el body de la petición
    const body = await request.json();

    // Validar campos requeridos
    const { titulo, descripcion, nivelEducativo } = body;

    if (!titulo || typeof titulo !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "titulo" es requerido y debe ser un string',
        },
        { status: 400 }
      );
    }

    if (!descripcion || typeof descripcion !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "descripcion" es requerido y debe ser un string',
        },
        { status: 400 }
      );
    }

    if (!nivelEducativo || typeof nivelEducativo !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'El campo "nivelEducativo" es requerido y debe ser un string',
        },
        { status: 400 }
      );
    }

    // Validar longitud de los campos
    if (titulo.length > 255) {
      return NextResponse.json(
        {
          success: false,
          error: 'El título no puede exceder 255 caracteres',
        },
        { status: 400 }
      );
    }

    if (descripcion.length > 3000) {
      return NextResponse.json(
        {
          success: false,
          error: 'La descripción no puede exceder 3000 caracteres',
        },
        { status: 400 }
      );
    }

    // Crear instancia del servicio OpenAI
    const openaiService = new OpenAIService();

    // Generar los temas del curso
    const result = await openaiService.generateCourseTopics(
      titulo,
      descripcion,
      nivelEducativo
    );

    // Devolver respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        titulo,
        descripcion,
        nivelEducativo,
        data: result, // Aquí viene course_title, education_level, topics[...]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generando temas del curso:', error);

    // Manejar errores específicos
    if (error instanceof Error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 500 }
      );
    }

    // Error genérico
    return NextResponse.json(
      {
        success: false,
        error: 'Error al generar temas del curso',
      },
      { status: 500 }
    );
  }
}
