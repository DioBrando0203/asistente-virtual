import { jsPDF } from 'jspdf';

interface ResumenData {
  topic: string;
  paragraphs: string[];
}

interface EvaluacionData {
  temaCurso: string;
  score: number;
  grade?: string;
  feedback: string;
  strengths: string[];
  improvements: string[];
}

interface CuestionarioData {
  tema: string;
  preguntas: Array<{
    question?: string;
    pregunta?: string;
    options?: string[];
    answer?: string;
  }>;
}

interface TemaData {
  titulo: string;
  contenido: string;
  nivelEducativo: string;
}

const MARGIN = 20;
const PAGE_WIDTH = 210; // A4 width in mm
const MAX_WIDTH = PAGE_WIDTH - (MARGIN * 2);
const LINE_HEIGHT = 7;

function addWrappedText(
  doc: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
): number {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + (lines.length * lineHeight);
}

function checkAndAddPage(doc: jsPDF, currentY: number, requiredSpace: number): number {
  const pageHeight = doc.internal.pageSize.height;
  if (currentY + requiredSpace > pageHeight - MARGIN) {
    doc.addPage();
    return MARGIN;
  }
  return currentY;
}

export function generarPDFResumen(data: ResumenData): void {
  const doc = new jsPDF();
  let yPosition = MARGIN;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(doc, 'Resumen Generado', MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Tema
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  yPosition = checkAndAddPage(doc, yPosition, 15);
  yPosition = addWrappedText(doc, data.topic, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Contenido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  data.paragraphs.forEach((paragraph, index) => {
    yPosition = checkAndAddPage(doc, yPosition, 20);

    // Número de párrafo
    doc.setFont('helvetica', 'bold');
    doc.text(`Párrafo ${index + 1}:`, MARGIN, yPosition);
    yPosition += LINE_HEIGHT;

    // Contenido del párrafo
    doc.setFont('helvetica', 'normal');
    yPosition = addWrappedText(doc, paragraph, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
    yPosition += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Página ${i} de ${pageCount}`,
      PAGE_WIDTH / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`resumen-${data.topic.replace(/\s+/g, '-')}.pdf`);
}

export function generarPDFEvaluacion(data: EvaluacionData): void {
  const doc = new jsPDF();
  let yPosition = MARGIN;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(doc, 'Evaluación de Respuesta', MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Tema
  doc.setFontSize(14);
  yPosition = addWrappedText(doc, `Tema: ${data.temaCurso}`, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Calificación
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  const calificacionTexto = `Calificación: ${data.score}/100${data.grade ? ` (${data.grade})` : ''}`;
  yPosition = addWrappedText(doc, calificacionTexto, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 15;

  // Retroalimentación
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = checkAndAddPage(doc, yPosition, 20);
  doc.text('Retroalimentación General:', MARGIN, yPosition);
  yPosition += LINE_HEIGHT;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  yPosition = addWrappedText(doc, data.feedback, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 15;

  // Puntos Positivos
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = checkAndAddPage(doc, yPosition, 20);
  doc.text('Puntos Positivos:', MARGIN, yPosition);
  yPosition += LINE_HEIGHT;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  data.strengths?.forEach((punto) => {
    yPosition = checkAndAddPage(doc, yPosition, 15);
    yPosition = addWrappedText(doc, `• ${punto}`, MARGIN + 5, yPosition, MAX_WIDTH - 5, LINE_HEIGHT);
    yPosition += 3;
  });
  yPosition += 10;

  // Puntos a Mejorar
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  yPosition = checkAndAddPage(doc, yPosition, 20);
  doc.text('Puntos a Mejorar:', MARGIN, yPosition);
  yPosition += LINE_HEIGHT;

  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  data.improvements?.forEach((punto) => {
    yPosition = checkAndAddPage(doc, yPosition, 15);
    yPosition = addWrappedText(doc, `• ${punto}`, MARGIN + 5, yPosition, MAX_WIDTH - 5, LINE_HEIGHT);
    yPosition += 3;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Página ${i} de ${pageCount}`,
      PAGE_WIDTH / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`evaluacion-${data.temaCurso.replace(/\s+/g, '-')}.pdf`);
}

export function generarPDFCuestionario(data: CuestionarioData): void {
  const doc = new jsPDF();
  let yPosition = MARGIN;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(doc, 'Cuestionario Generado', MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Tema
  doc.setFontSize(14);
  yPosition = addWrappedText(doc, `Tema: ${data.tema}`, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Número de preguntas
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  yPosition = addWrappedText(
    doc,
    `Total de preguntas: ${data.preguntas.length}`,
    MARGIN,
    yPosition,
    MAX_WIDTH,
    LINE_HEIGHT
  );
  yPosition += 15;

  // Preguntas
  doc.setFont('helvetica', 'normal');
  data.preguntas.forEach((pregunta, index) => {
    yPosition = checkAndAddPage(doc, yPosition, 30);

    // Número de pregunta
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const textoPregunta = pregunta.question || pregunta.pregunta || '';
    yPosition = addWrappedText(doc, `${index + 1}. ${textoPregunta}`, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
    yPosition += 5;

    // Opciones (si existen)
    if (pregunta.options && pregunta.options.length > 0) {
      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      pregunta.options.forEach((opcion, i) => {
        yPosition = checkAndAddPage(doc, yPosition, 10);
        const letra = String.fromCharCode(65 + i); // A, B, C, D...
        yPosition = addWrappedText(doc, `   ${letra}) ${opcion}`, MARGIN + 5, yPosition, MAX_WIDTH - 5, LINE_HEIGHT);
        yPosition += 2;
      });
      yPosition += 3;
    }

    // Respuesta (si existe)
    if (pregunta.answer) {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'italic');
      yPosition = checkAndAddPage(doc, yPosition, 10);
      yPosition = addWrappedText(doc, `   Respuesta: ${pregunta.answer}`, MARGIN + 5, yPosition, MAX_WIDTH - 5, LINE_HEIGHT);
    }

    yPosition += 10;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Página ${i} de ${pageCount}`,
      PAGE_WIDTH / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`cuestionario-${data.tema.replace(/\s+/g, '-')}.pdf`);
}

export function generarPDFTema(data: TemaData): void {
  const doc = new jsPDF();
  let yPosition = MARGIN;

  // Título
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addWrappedText(doc, data.titulo, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 10;

  // Nivel Educativo
  doc.setFontSize(12);
  doc.setFont('helvetica', 'italic');
  yPosition = addWrappedText(doc, `Nivel: ${data.nivelEducativo}`, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
  yPosition += 15;

  // Contenido
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');

  // Dividir el contenido en párrafos
  const paragraphs = data.contenido.split('\n').filter(p => p.trim());

  paragraphs.forEach((paragraph) => {
    yPosition = checkAndAddPage(doc, yPosition, 20);
    yPosition = addWrappedText(doc, paragraph, MARGIN, yPosition, MAX_WIDTH, LINE_HEIGHT);
    yPosition += 8;
  });

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(
      `Página ${i} de ${pageCount}`,
      PAGE_WIDTH / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }

  doc.save(`tema-${data.titulo.replace(/\s+/g, '-')}.pdf`);
}
