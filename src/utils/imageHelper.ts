export interface ProcessedImage {
  mimeType: string;
  data: string; // base64 without prefix
  previewUrl: string;
}

export async function fileToProcessedImage(file: File): Promise<ProcessedImage> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('El archivo seleccionado no es una imagen válida.'));
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (!dataUrl) {
        return reject(new Error('No se pudo leer el archivo de imagen.'));
      }

      const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
      if (!match) {
        return reject(new Error('Formato base64 de imagen no reconocido.'));
      }

      resolve({
        mimeType: match[1],
        data: match[2],
        previewUrl: dataUrl,
      });
    };
    reader.onerror = () => reject(new Error('Error al cargar la imagen.'));
    reader.readAsDataURL(file);
  });
}

// Convert canvas or blob to processed image
export function canvasToProcessedImage(canvas: HTMLCanvasElement): ProcessedImage {
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
  return {
    mimeType: match ? match[1] : 'image/jpeg',
    data: match ? match[2] : '',
    previewUrl: dataUrl,
  };
}
