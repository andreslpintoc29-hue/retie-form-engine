/**
 * PROCESADOR CENTRALIZADO DE IMÁGENES DE EVIDENCIA
 * 
 * Se encarga de:
 * 1. Obtener la ubicación GPS de forma asíncrona (con timeout).
 * 2. Cargar la imagen en un Canvas de HTML5.
 * 3. Redimensionar la imagen a un máximo de 1280x720 manteniendo la proporción.
 * 4. Pintar una marca de agua con Fecha, Hora y Coordenadas GPS (sin marcas de empresa)
 *    sobre un fondo semitransparente oscuro para asegurar legibilidad.
 * 5. Comprimir a formato JPEG con calidad 0.7.
 * 6. Devolver el objeto de evidencia estructurado y normalizado.
 */

export interface ProcessEvidenceOptions {
  file: File;
  inspectionId: string;
  formId: string;
  questionId: string;
  caption?: string;
}

export interface ProcessedEvidence {
  id: string;
  inspectionId: string;
  formId: string;
  questionId: string;
  fileName: string;
  mimeType: string;
  dataUrl: string;
  foto: string; // Duplicado para mantener compatibilidad
  caption: string;
  comentario?: string; // Duplicado para mantener compatibilidad
  createdAt: string;
  timestamp?: string; // Para compatibilidad
  gps: {
    latitude: number | null;
    longitude: number | null;
    accuracy: number | null;
  };
  compressed: boolean;
  watermark: boolean;
}

/**
 * Obtiene la geolocalización actual de forma segura con una promesa y timeout de 3 segundos
 */
function getGPSLocation(): Promise<{ latitude: number | null; longitude: number | null; accuracy: number | null }> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !navigator || !navigator.geolocation) {
      resolve({ latitude: null, longitude: null, accuracy: null });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: parseFloat(position.coords.latitude.toFixed(4)),
          longitude: parseFloat(position.coords.longitude.toFixed(4)),
          accuracy: position.coords.accuracy ? parseFloat(position.coords.accuracy.toFixed(2)) : null
        });
      },
      (error) => {
        console.warn('Geolocation error or denied:', error.message);
        resolve({ latitude: null, longitude: null, accuracy: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 3000,
        maximumAge: 10000
      }
    );
  });
}

/**
 * Procesa la imagen cargándola en un canvas, aplicando redimensionamiento, 
 * agregando la marca de agua y comprimiéndola a JPEG 0.7
 */
export async function processEvidenceImage(options: ProcessEvidenceOptions): Promise<ProcessedEvidence> {
  const { file, inspectionId, formId, questionId, caption } = options;

  // 1. Obtener ubicación GPS (en paralelo o secuencial rápido)
  const gps = await getGPSLocation();

  // 2. Leer archivo como DataURL
  const rawDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  // 3. Crear imagen HTML para procesar en Canvas
  const img = await new Promise<HTMLImageElement>((resolve, reject) => {
    const tempImg = new Image();
    tempImg.onload = () => resolve(tempImg);
    tempImg.onerror = (err) => reject(err);
    tempImg.src = rawDataUrl;
  });

  // 4. Calcular dimensiones (máximo 1280x720, manteniendo proporción)
  let width = img.width;
  let height = img.height;
  const maxW = 1280;
  const maxH = 720;

  if (width > maxW || height > maxH) {
    const ratio = Math.min(maxW / width, maxH / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  // 5. Crear Canvas e inicializar contexto
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Could not get 2D context from canvas');
  }

  // Dibujar imagen original en las nuevas dimensiones
  ctx.drawImage(img, 0, 0, width, height);

  // 6. Preparar texto de la marca de agua
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  const timeStr = `${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dateTime = `${dateStr} ${timeStr}`;

  const hasGPS = gps.latitude !== null && gps.longitude !== null;
  const gpsText = hasGPS
    ? `Lat: ${gps.latitude} | Lng: ${gps.longitude}`
    : 'GPS no disponible';

  // 7. Configurar tipografía y tamaño de la marca de agua proporcional al alto
  const fontSize = Math.max(14, Math.round(height * 0.035));
  ctx.font = `bold ${fontSize}px system-ui, -apple-system, sans-serif`;

  // Calcular anchos para el fondo oscuro
  const w1 = ctx.measureText(dateTime).width;
  const w2 = ctx.measureText(gpsText).width;
  const bgWidth = Math.max(w1, w2) + 24;
  const bgHeight = (fontSize * 2) + 20;

  // Posicionar marca de agua en la esquina inferior izquierda con margen
  const margin = 16;
  const rx = margin;
  const ry = height - bgHeight - margin;

  // Dibujar fondo oscuro semitransparente con bordes ligeramente redondeados (opcional, o rectángulo normal)
  ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
  ctx.beginPath();
  if (ctx.roundRect) {
    ctx.roundRect(rx, ry, bgWidth, bgHeight, 6);
    ctx.fill();
  } else {
    ctx.fillRect(rx, ry, bgWidth, bgHeight);
  }

  // Dibujar texto en color blanco
  ctx.fillStyle = '#ffffff';
  ctx.textBaseline = 'top';
  
  // Línea 1: Fecha y Hora
  ctx.fillText(dateTime, rx + 12, ry + 8);
  // Línea 2: GPS
  ctx.fillText(gpsText, rx + 12, ry + 8 + fontSize + 4);

  // 8. Exportar a DataURL comprimido en JPEG
  const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);

  // Generar ID único para la evidencia
  const uniqueId = `ev-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  const defaultCaption = caption || `Evidencia ${formId} - Pregunta ${questionId}`;

  // 9. Retornar estructura normalizada
  return {
    id: uniqueId,
    inspectionId,
    formId,
    questionId,
    fileName: file.name.replace(/\.[^/.]+$/, "") + '.jpg', // Normalizar extensión a jpg
    mimeType: 'image/jpeg',
    dataUrl: compressedDataUrl,
    foto: compressedDataUrl, // Compatibilidad
    caption: defaultCaption,
    comentario: defaultCaption, // Compatibilidad
    createdAt: now.toISOString(),
    timestamp: now.toLocaleString(), // Compatibilidad
    gps,
    compressed: true,
    watermark: true
  };
}
