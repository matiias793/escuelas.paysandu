/** Comprime una imagen en el navegador (JPEG) para subir a Storage. */

const MAX_EDGE_PX = 1280;
const JPEG_QUALITY = 0.78;
const MAX_OUTPUT_BYTES = 220_000;

function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo leer la imagen.'));
    };
    img.src = url;
  });
}

function canvasToJpegBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('No se pudo comprimir la imagen.'));
          return;
        }
        resolve(blob);
      },
      'image/jpeg',
      quality,
    );
  });
}

/**
 * Redimensiona y comprime a JPEG (~≤220 KB).
 * Acepta JPEG/PNG/WebP desde el input del admin.
 */
export async function compressImageForUpload(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) {
    throw new Error('El archivo debe ser una imagen.');
  }

  if (file.size > 12 * 1024 * 1024) {
    throw new Error('La imagen es demasiado grande (máx. 12 MB).');
  }

  const img = await loadImageFromFile(file);
  const scale = Math.min(1, MAX_EDGE_PX / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('No se pudo preparar la imagen.');

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  let quality = JPEG_QUALITY;
  let blob = await canvasToJpegBlob(canvas, quality);

  while (blob.size > MAX_OUTPUT_BYTES && quality > 0.45) {
    quality -= 0.08;
    blob = await canvasToJpegBlob(canvas, quality);
  }

  return new File([blob], 'facade.jpg', { type: 'image/jpeg', lastModified: Date.now() });
}
