import OpenAI from 'openai';

// Interfaz para la respuesta de generación de temas
interface CourseTopicsResponse {
  course_title: string;
  education_level: string;
  topics: {
    title: string;
    objective: string;
    estimated_sessions: number;
    summary: string;
  }[];
}

export class OpenAIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno');
    }

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = process.env.OPENAI_MODEL || 'gpt-4o-mini';
  }

  /**
   * Genera temas para un curso usando OpenAI
   */
  async generateCourseTopics(
    title: string,
    description: string,
    educationLevel: string
  ): Promise<CourseTopicsResponse> {
    const numTopics = 8;

    const prompt = `
Actuas como un docente experto en diseño curricular y planificacion de clases.

Debes proponer aproximadamente ${numTopics} temas o lecciones para un curso con los siguientes datos:

- Titulo general del curso o unidad: "${title}"
- Descripcion del curso: "${description}"
- Nivel educativo: "${educationLevel}"

Cada tema debe:
- Estar redactado en lenguaje claro para estudiantes de ese nivel.
- Seguir un orden logico de aprendizaje (de basico a avanzado).
- Tener un objetivo de aprendizaje breve.
- Indicar una cantidad aproximada de sesiones (entre 1 y 3).

Devuelve la informacion en formato JSON con esta estructura:

{
  "course_title": "...",
  "education_level": "...",
  "topics": [
    {
      "title": "Titulo del tema",
      "objective": "Objetivo de aprendizaje claro",
      "estimated_sessions": 2,
      "summary": "Breve descripcion del contenido del tema"
    }
  ]
}

IMPORTANTE:
- Devuelve SOLO el JSON valido.
- No agregues explicacion adicional antes ni despues del JSON.
`;

    try {
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [
          {
            role: 'system',
            content: 'Eres un planificador curricular para un LMS educativo. Generas temarios estructurados en JSON.'
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content || '{}';

      // Intentar parsear el JSON
      const data = JSON.parse(content) as CourseTopicsResponse;

      // Validar que tenga la estructura esperada
      if (!data.topics || !Array.isArray(data.topics)) {
        throw new Error('La respuesta de OpenAI no tiene la estructura esperada');
      }

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new Error('OpenAI devolvió un JSON inválido');
      }
      throw error;
    }
  }
}
