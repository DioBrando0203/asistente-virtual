/**
 * Extrae texto de un archivo PDF
 * Ignora automáticamente las imágenes
 */
export async function extractTextFromPDF(file: File): Promise<string> {
  try {
    const pdfjsLib = await import('pdfjs-dist');

    // Configurar worker de PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

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

    return fullText.trim();
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
    return result.value.trim();
  } catch (error) {
    console.error('Error al extraer texto del DOCX:', error);
    throw new Error('No se pudo extraer el texto del DOCX');
  }
}

/**
 * Extrae texto de un archivo de texto plano
 */
export async function extractTextFromTXT(file: File): Promise<string> {
  try {
    return await file.text();
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
