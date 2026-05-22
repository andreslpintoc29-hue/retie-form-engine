import { describe, it, expect, beforeEach } from 'vitest';
import { PDFEngine, pdfEngine } from './pdfEngine';

describe('PDFEngine Sanitization & Integration Tests', () => {
  it('should clean values properly to avoid NaN, null, and undefined in the PDF', () => {
    // @ts-ignore - access private cleanValue for testing
    const clean = pdfEngine.cleanValue.bind(pdfEngine);

    expect(clean('Valido')).toBe('Valido');
    expect(clean('')).toBe('-');
    expect(clean(null)).toBe('-');
    expect(clean(undefined)).toBe('-');
    expect(clean('NaN')).toBe('-');
    expect(clean('nan')).toBe('-');
    expect(clean('undefined')).toBe('-');
    expect(clean('null')).toBe('-');
    expect(clean('  espacios  ')).toBe('espacios');
  });

  it('should generate a PDF report blob without throwing errors using mock data', async () => {
    const options: any = {
      inspection: {
        id: 'RETIE-DEMO-2026',
        siteName: 'Test Project',
        siteAddress: 'Calle 123 #45-67',
        inspectionDate: '2026-05-19'
      },
      retieProjectInfo: {
        proyecto: 'Test Project',
        direccion: 'Calle 123 #45-67',
        ciudad: 'Bogotá',
        propietario: 'Propietario Demo',
        alcance: 'Uso Final',
        uso: 'Residencial',
        fechaInspeccion: '2026-05-19',
        numeroDictamen: 'DICT-2026-001'
      },
      inspectionBodyInfo: {
        nombre: 'Organismo de Inspección Retie SAS',
        nit: '900.123.456-7',
        direccion: 'Av. Siempre Viva 123',
        telefono: '3001234567',
        resolucionAcreditacion: '18-OAC-045'
      },
      inspectorInfo: {
        inspectorNombre: 'Ing. Carlos Pérez',
        inspectorMatricula: 'CN205-12345',
        directorNombre: 'Ing. María Gómez',
        directorMatricula: 'CN205-54321'
      },
      dictamenResult: 'APROBADO',
      formApantallamiento: {
        'APA-001__visita_1': 'SI',
        'APA-002__visita_1': 'NO',
        'APA-002__visita_1__obs': 'Requiere análisis detallado'
      },
      formPiscinas: {
        'PIS-001__visita_1': 'SI',
        'PIS-002__visita_1': 'N/A'
      },
      formAscensores: {
        'ASC-001__visita_1': 'SI',
        'ASC-002__visita_1': 'NO'
      },
      formProducto: {
        codigo_servicio: 'R&F-0467-10-20',
        fecha_inspeccion: '2026-05-19',
        fecha_cierre_no_conformidades: '2026-05-20',
        // Mark first item as applicable SI
        'PROD-001_aplica': 'SI',
        'PROD-001_marca_1_nombre': 'Schneider',
        'PROD-001_marca_1_organismo': 'CIDET',
        'PROD-001_marca_1_certificado': 'CERT-123',
        'PROD-001_marca_1_cumple': 'SI',
        // Mark second item as applicable NO
        'PROD-002_aplica': 'NO'
      },
      formRSpt: {
        codigo_servicio: 'R&F-0467-10-20',
        fecha_inspeccion: '2026-05-19',
        codigo_equipo: 'R&F-MI2088-01',
        metodo_utilizado: 'CAIDA DE TENSION',
        // Terreno Regular
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_spt_de': 'PUNTO NEUTRO DE ACOMETIDA EN BT',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_distancia_d_m': '20',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_distancia_x_61_8': '12.36',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_valor_medido_61_8': '15.2',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_distancia_x_52': '10.40',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_valor_medido_52': '15.1',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_distancia_x_72': '14.40',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_valor_medido_72': '15.3',
        'Valores_medidos_-_TERRENO_REGULAR_fila_0_cumple': 'SI',
        // Terreno Irregular Group 1
        'TERRENO_IRREGULAR_g_1_fila_0_distancia_d_m': '2.0',
        'TERRENO_IRREGULAR_g_1_fila_0_resistencia_ohm': '12.4',
        // Observaciones
        'Observaciones_observaciones': 'Puesta a tierra cumple con los parámetros RETIE.'
      }
    };

    const blob = await pdfEngine.generateReport(options);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('should generate a single-form PDF for APANTALLAMIENTO and respect module status/photo evidences', async () => {
    const options: any = {
      mode: 'single-form',
      targetForm: 'APANTALLAMIENTO',
      moduleStatus: {
        'APANTALLAMIENTO': 'aplica',
        'PISCINAS': 'no-aplica',
        'ASCENSORES': 'no-aplica'
      },
      inspection: {
        id: 'RETIE-DEMO-2026',
        siteName: 'Test Single Project',
        siteAddress: 'Calle 123 #45-67',
        inspectionDate: '2026-05-19'
      },
      retieProjectInfo: {
        proyecto: 'Test Single Project',
        alcance: 'Uso Final',
        uso: 'Residencial',
        fechaInspeccion: '2026-05-19'
      },
      formApantallamiento: {
        'APA-001__visita_1': 'SI',
        'APA-002__visita_1': 'NO',
        'APA-002__visita_1__obs': 'Observacion de prueba',
        'APA-003__visita_1': 'NaN', 
        'APA-004__visita_1': undefined, 
        'APA-005__cierre': 'null' 
      },
      photoEvidence: [
        {
          foto: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
          comentario: 'Foto de prueba valida',
          formularioAsociado: 'APANTALLAMIENTO',
          preguntaAsociada: 'APA-001'
        },
        {
          foto: 'imagen-invalida-path-roto',
          comentario: 'Foto invalida con fallback',
          formularioAsociado: 'APANTALLAMIENTO',
          preguntaAsociada: 'APA-002'
        }
      ]
    };

    const blob = await pdfEngine.generateReport(options);
    expect(blob).toBeInstanceOf(Blob);
    expect(blob.size).toBeGreaterThan(0);
  });
});
