/**
 * Corrige problemas de codificación UTF-8 en texto extraído
 * Reemplaza caracteres de reemplazo Unicode (�) y otros problemas comunes
 */
function fixEncoding(text: string): string {
  // Limpiar caracteres de reemplazo Unicode
  let cleaned = text.replace(/\uFFFD/g, '');

  // Reemplazar secuencias comunes de mal encoding usando códigos Unicode
  const replacements = [
    [/Ã¡/g, 'á'],
    [/Ã©/g, 'é'],
    [/Ã­/g, 'í'],
    [/Ã³/g, 'ó'],
    [/Ãº/g, 'ú'],
    [/Ã±/g, 'ñ'],
    [/Ã\u0081/g, 'Á'],
    [/Ã‰/g, 'É'],
    [/Ã\u008D/g, 'Í'],
    [/Ã"/g, 'Ó'],
    [/Ãš/g, 'Ú'],
    [/Ã'/g, 'Ñ'],
    [/Â¿/g, '¿'],
    [/Â¡/g, '¡'],
    [/â€œ/g, '"'],
    [/â€\u009D/g, '"'],
    [/â€™/g, "'"],
    [/â€"/g, '—'],
    [/Â°/g, '°'],
  ] as const;

  for (const [pattern, replacement] of replacements) {
    cleaned = cleaned.replace(pattern, replacement);
  }

  return cleaned;
}

/**
 * Extrae texto de un archivo PDF
 * Ignora automáticamente las imágenes
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Configurar worker local servido desde /public para evitar cdnjs
    const workerSrc =
      typeof window !== 'undefined'
        ? `${window.location.origin}/pdf.worker.min.mjs`
        : '/pdf.worker.min.mjs';
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;
    (pdfjsLib.GlobalWorkerOptions as any).disableWorker = false;

    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fixEncoding(fullText.trim());
  } catch (error) {
    console.error('Error al extraer texto del PDF:', error);
    throw new Error('No se pudo extraer el texto del PDF');
  }
}

/**
 * Extrae texto de un archivo DOCX
 * Ignora automáticamente las imágenes
 */
export async function extractTextFromDOCX(file: File): Promise<string> {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();

    const result = await mammoth.extractRawText({ arrayBuffer });
    const cleanText = result.value.trim();

    // Si detectamos problemas de encoding, intentar corregir
    return fixEncoding(cleanText);
  } catch (error) {
    console.error('Error al extraer texto del DOCX:', error);
    throw new Error('No se pudo extraer el texto del DOCX');
  }
}

/**
 * Extrae texto de un archivo de texto plano
 * Intenta detectar y corregir problemas de codificación
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // Intentar detectar encoding
    let text = '';
    try {
      // Primero intentar UTF-8
      text = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer);
    } catch {
      try {
        // Si falla, intentar Windows-1252 (común en Windows)
        text = new TextDecoder('windows-1252').decode(arrayBuffer);
      } catch {
        // Como último recurso, usar Latin-1
        text = new TextDecoder('iso-8859-1').decode(arrayBuffer);
      }
    }

    return fixEncoding(text.trim());
  } catch (error) {
    console.error('Error al leer el archivo de texto:', error);
    throw new Error('No se pudo leer el archivo de texto');
  }
}

/**
 * Función principal que detecta el tipo de archivo y extrae el texto
 * Soporta: PDF, DOCX, TXT
 * Ignora: DOC (antiguo), imágenes
 */
export async function extractTextFromFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'pdf':
      return await extractTextFromPDF(file);
    case 'docx':
      return await extractTextFromDOCX(file);
    case 'txt':
      return await extractTextFromTXT(file);
    case 'jpg':
    case 'jpeg':
    case 'png':
    case 'gif':
      throw new Error('Los archivos de imagen no pueden ser convertidos a texto');
    case 'doc':
      throw new Error('Los archivos .doc antiguos no están soportados. Por favor, conviértelo a .docx');
    default:
      throw new Error(`Tipo de archivo no soportado: ${extension}`);
  }
}
