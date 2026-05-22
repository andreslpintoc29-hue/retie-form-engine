// ============================================
// TEMPORARY PRODUCTO SCHEMA - Copia funcional de APANTALLAMIENTO
// Solo para diagnóstico del problema de inicialización
// ============================================

import { RETIEMasterSchema } from '../masterSchema';

export const RETIE_PRODUCTO_SCHEMA: RETIEMasterSchema = {
  hoja: "PRODUCTO",
  titulo: "LISTA DE CHEQUEO PRODUCTO (DIAGNÓSTICO)",
  proceso: "GESTIÓN DE INSPECCIÓN",
  codigo: "F-GI-16",
  version: "1",
  fecha_formato: "20/01/2018",
  instruccion_excel: "Copia funcional de APANTALLAMIENTO para diagnóstico",
  tipo_principal: "radio",
  opciones_principales: ["SI", "NO", "N/A"],
  respuesta_por_defecto: {
    visita_1: { tipo: "radio", opciones: ["SI", "NO", "N/A"] },
    cierre: { tipo: "radio", opciones: ["SI", "NO"] }
  },
  campos_contexto: [
    { id: "codigo_servicio", label: "Código servicio", tipo: "text" },
    { id: "fecha_inspeccion", label: "Fecha de la inspección", tipo: "date" },
    { id: "fecha_cierre_no_conformidades", label: "Fecha de cierre no conformidades", tipo: "text" },
    { id: "observaciones", label: "Observaciones", tipo: "textarea" }
  ],
  total_preguntas: 24,
  secciones: [
    {
      titulo: "1. Requisitos de producto",
      rango: "1-24",
      total_preguntas: 24,
      tipo_respuesta_principal: "radio",
      opciones_visita_1: ["SI", "NO", "N/A"],
      opciones_cierre: ["SI", "NO"],
      preguntas: [
        { id: "PROD-001", numero: 1, pregunta: "Producto eléctrico certificado" },
        { id: "PROD-002", numero: 2, pregunta: "Materiales homologados" },
        { id: "PROD-003", numero: 3, pregunta: "Equipos con label RETIE" },
        { id: "PROD-004", numero: 4, pregunta: "Cables certificados" },
        { id: "PROD-005", numero: 5, pregunta: "Tomas con certificación" },
        { id: "PROD-006", numero: 6, pregunta: "Interruptores certificados" },
        { id: "PROD-007", numero: 7, pregunta: "Tableros con sello" },
        { id: "PROD-008", numero: 8, pregunta: "Protectores certificados" },
        { id: "PROD-009", numero: 9, pregunta: "Canalizaciones aprobadas" },
        { id: "PROD-010", numero: 10, pregunta: "Cajas certificadas" },
        { id: "PROD-011", numero: 11, pregunta: "Conexionesapproved" },
        { id: "PROD-012", numero: 12, pregunta: "Aisladores certificados" },
        { id: "PROD-013", numero: 13, pregunta: "Ground fault protectors" },
        { id: "PROD-014", numero: 14, pregunta: "Transformadores aprobados" },
        { id: "PROD-015", numero: 15, pregunta: "Medidores certificados" },
        { id: "PROD-016", numero: 16, pregunta: "Conductores approved" },
        { id: "PROD-017", numero: 17, pregunta: "Empalmes certificados" },
        { id: "PROD-018", numero: 18, pregunta: "Barras aprobadas" },
        { id: "PROD-019", numero: 19, pregunta: "Terminales certificadas" },
        { id: "PROD-020", numero: 20, pregunta: "Bornes approved" },
        { id: "PROD-021", numero: 21, pregunta: "Rectificadores certificados" },
        { id: "PROD-022", numero: 22, pregunta: "Inversores aprobados" },
        { id: "PROD-023", numero: 23, pregunta: "Baterías certificadas" },
        { id: "PROD-024", numero: 24, pregunta: "Equipos de medición aprobados" }
      ]
    },
    {
      titulo: "2. Observaciones",
      rango: "",
      total_preguntas: 0,
      tipo_respuesta_principal: "textarea",
      opciones_visita_1: [],
      opciones_cierre: [],
      preguntas: []
    }
  ],
  validacion_extraccion: {
    preguntas_esperadas: 24,
    preguntas_extraidas: 24,
    numeros_faltantes: [],
    numeros_duplicados: [],
    preguntas_sin_texto: [],
    estado: "OK"
  }
};

export default RETIE_PRODUCTO_SCHEMA;