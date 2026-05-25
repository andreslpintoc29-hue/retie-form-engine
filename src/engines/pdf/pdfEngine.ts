// ============================================
// PDF ENGINE - OFFICIAL RETIE DICTAMEN GENERATOR
// ============================================

import { jsPDF } from 'jspdf';
import rawAutoTable from 'jspdf-autotable';

// Fallback to support both standard ES6 imports (Next.js/webpack) and CommonJS default exports (Vitest/node)
const autoTable = (typeof rawAutoTable === 'function'
  ? rawAutoTable
  : (rawAutoTable as any)?.default) as typeof rawAutoTable;
import { RETIE_DISENO_SCHEMA } from '@/schemas/retie/diseno';
import { RETIE_DISTRIBUCION_SCHEMA } from '@/schemas/retie/distribucion';
import { RETIE_UFR_SCHEMA } from '@/schemas/retie/ufr';
import { RETIE_UFIYC_SCHEMA } from '@/schemas/retie/ufIyc';
import { RETIE_ACP_SDE_BCI_SCHEMA } from '@/schemas/retie/acpSdeBci';
import { RETIE_PRODUCTO_SCHEMA } from '@/schemas/retie/producto';
import { RETIE_R_SPT_SCHEMA } from '@/schemas/retie/rSpt';
import { RETIE_APANTALLAMIENTO_SCHEMA } from '@/schemas/retie/apantallamiento';
import { RETIE_PISCINAS_SCHEMA } from '@/schemas/retie/piscinas';
import { RETIE_ASCENSORES_SCHEMA } from '@/schemas/retie/ascensores';
import type { InspectionState } from '../state/formStateEngine';
import type { ComplianceResult } from '../compliance/complianceEngine';

// ============================================
// MODULE LABELS — FASE 3.5
// ============================================
const MODULE_LABELS: Record<string, string> = {
  'IN':              'Portada Técnica (IN)',
  'CARPETA':         'Revisión Documental (CARPETA)',
  'DISENO':          'Lista de Chequeo Diseño',
  'DISTRIBUCION':    'Lista de Chequeo Distribución',
  'UFR':             'Uso Final Residencial (U.F.R)',
  'UFIYC':           'Uso Final Industrial y Comercial (UF I Y C)',
  'ACPSDEBCI':       'ACP-SDE-BCI',
  'APANTALLAMIENTO': 'Lista de Chequeo Apantallamiento',
  'PISCINAS':        'Lista de Chequeo Piscinas',
  'ASCENSORES':      'Lista de Chequeo Ascensores',
  'PRODUCTO':        'Revisión de Productos',
  'R_SPT':           'Resistencia de Puesta a Tierra (R. SPT)',
  'R_AISLAMIENTO':   'Resistencia de Aislamiento',
  'ILUMINANCIA':     'Mediciones de Iluminancia',
};

export type ReportType = 
  | 'inspection_full'
  | 'dictamen_oficial';

export interface PDFConfig {
  reportType: ReportType;
  title: string;
  subtitle?: string;
  includeIndex: boolean;
  includeTimestamp: boolean;
  includeQR: boolean;
  includeSignature: boolean;
  includePhotos: boolean;
  watermark?: string;
  primaryColor: string;
  secondaryColor: string;
  pageSize: 'A4' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

export interface RetieProjectInfo {
  proyecto: string;
  direccion: string;
  ciudad: string;
  propietario: string;
  alcance: string;
  uso: string; // Residencial, Comercial, Industrial...
  fechaInspeccion: string;
  numeroDictamen: string;
}

export interface InspectionBodyInfo {
  nombre: string;
  nit: string;
  direccion: string;
  telefono: string;
  resolucionAcreditacion: string;
  logo?: string;
}

export interface InspectorInfo {
  inspectorNombre: string;
  inspectorMatricula: string;
  directorNombre: string;
  directorMatricula: string;
  disenadorNombre?: string;
  disenadorMatricula?: string;
  constructorNombre?: string;
  constructorMatricula?: string;
}

export interface ReportOptions {
  inspection: InspectionState | any;
  compliance?: ComplianceResult;
  sheets?: any[];
  
  // The 8 requested sections
  retieProjectInfo?: RetieProjectInfo;
  inspectionBodyInfo?: InspectionBodyInfo;
  inspectorInfo?: InspectorInfo;
  complianceDeclarations?: string[];
  photoEvidence?: { src?: string; dataUrl?: string; caption: string; formId?: string }[];
  attachments?: { type: string; fileName: string; size?: string; date?: string }[];
  dictamenResult?: 'APROBADO' | 'NO APROBADO';
  
  generatedBy?: string;

  // FASE 3.5 — Alcance y Aplicabilidad
  mode?: 'global' | 'single-form';
  targetForm?: string;
  moduleStatus?: Record<string, string>;
  
  // Pilot Forms 3B
  formIn?: any;
  formCarpeta?: any;
  formAislamiento?: any;
  formIluminancia?: any;

  // Block 1 Forms
  formDiseno?: any;
  formDistribucion?: any;
  formUFR?: any;
  formUFIYC?: any;
  formACPSDEBCI?: any;

  // Block 2 Forms
  formProducto?: any;
  formRSpt?: any;

  // Block 3 Forms
  formApantallamiento?: any;
  formPiscinas?: any;
  formAscensores?: any;
}

const DEFAULT_CONFIG: PDFConfig = {
  reportType: 'dictamen_oficial',
  title: 'DICTAMEN DE INSPECCIÓN RETIE',
  subtitle: 'REGLAMENTO TÉCNICO DE INSTALACIONES ELÉCTRICAS',
  includeIndex: false,
  includeTimestamp: true,
  includeQR: true,
  includeSignature: true,
  includePhotos: true,
  primaryColor: '#0f172a', // Slate 900
  secondaryColor: '#475569', // Slate 600
  pageSize: 'Letter',
  orientation: 'portrait'
};

export class PDFEngine {
  private config: PDFConfig;
  private doc!: jsPDF;
  private currentY: number = 0;
  private pageWidth: number = 0;
  private pageHeight: number = 0;
  private margin: number = 15;

  constructor(config: Partial<PDFConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  setConfig(config: Partial<PDFConfig>): this {
    this.config = { ...DEFAULT_CONFIG, ...config };
    return this;
  }

  /**
   * Normaliza metadatos de evidencia para evitar undefined/null en PDF.
   * Fallback a valores seguros si los campos están vacíos.
   */
  private normalizeEvidence(evidence: any): { formId: string; questionId: string; caption: string; fileName: string; dataUrl: string } {
    // Normalizar módulo/formulario
    const formId = evidence.formId
      || evidence.moduleId
      || evidence.form
      || evidence.formularioAsociado
      || MODULE_LABELS[evidence.formId?.toUpperCase()] 
      || 'Sin módulo';

    // Normalizar pregunta/ítem
    const questionId = evidence.questionId
      || evidence.itemId
      || evidence.question
      || evidence.preguntaId
      || evidence.preguntaAsociada
      || '-';

    // Normalizar descripción/caption
    const caption = evidence.caption
      || evidence.descripcion
      || evidence.description
      || evidence.observacion
      || evidence.comentario
      || 'Evidencia fotográfica';

    // Normalizar nombre de archivo
    const fileName = evidence.fileName
      || evidence.name
      || evidence.file
      || 'foto_evidencia';

    // Data URL de la imagen
    const dataUrl = evidence.dataUrl
      || evidence.preview
      || evidence.imageData
      || evidence.base64
      || evidence.foto
      || '';

    // Construir etiqueta limpia
    const cleanLabel = `${formId} — ${questionId}: ${caption}`
      .replace(/undefined/g, '')
      .replace(/null/g, '')
      .replace(/— : /g, '— ')
      .replace(/ — :/g, ':')
      .trim();

    return {
      formId: String(formId),
      questionId: String(questionId),
      caption: cleanLabel || 'Evidencia fotográfica',
      fileName: String(fileName),
      dataUrl: String(dataUrl)
    };
  }

  async generateReport(options: ReportOptions): Promise<Blob> {
    // DIAGNÓSTICO DE PDFENGINE REQUERIDO POR EL USUARIO
    const iId = options.inspection?.inspectionId || 'N/A';
    const repMode = options.mode || 'global';
    const targetF = options.targetForm || 'N/A';
    
    // Calcular qué clave intentó/debió leer el frontend
    const suffix = targetF !== 'N/A' ? `_${targetF}` : '';
    // Si el iId ya incluye el sufijo del targetForm, no lo duplicamos
    const expectedKey = iId.endsWith(suffix) ? `draft_${iId}` : `draft_${iId}${suffix}`;
    
    // Buscar si el formulario destino tiene datos
    let targetDraftFound = false;
    if (repMode === 'single-form') {
      const dataMap: Record<string, any> = {
        APANTALLAMIENTO: options.formApantallamiento,
        PISCINAS: options.formPiscinas,
        ASCENSORES: options.formAscensores,
        DISENO: options.formDiseno,
        UFR: options.formUFR,
        UFIYC: options.formUFIYC,
        ACPSDEBCI: options.formACPSDEBCI,
        DISTRIBUCION: options.formDistribucion,
        PRODUCTO: options.formProducto,
        R_SPT: options.formRSpt,
        R_AISLAMIENTO: options.formAislamiento,
        ILUMINANCIA: options.formIluminancia,
        IN: options.formIn,
        CARPETA: options.formCarpeta
      };
      const data = dataMap[targetF];
      targetDraftFound = data && Object.keys(data).length > 0;
    }
    
    console.log("=== DIAGNÓSTICO EN PDFENGINE ===");
    console.log("- inspectionId usado:", iId);
    console.log("- mode usado:", repMode);
    console.log("- targetForm usado:", targetF);
    console.log("- clave de draft esperada en IndexedDB:", expectedKey);
    console.log("- ¿Se encontraron respuestas en la llamada?:", targetDraftFound ? "SÍ (draft encontrado)" : "NO (null o vacío)");
    if (repMode === 'single-form') {
      const receivedData = options.formApantallamiento || options.formPiscinas || options.formAscensores || options.formDiseno || options.formUFR || options.formUFIYC || options.formACPSDEBCI || options.formDistribucion || options.formProducto || options.formRSpt || options.formAislamiento || options.formIluminancia || options.formIn || options.formCarpeta;
      console.log("=== PDFENGINE single-form ENTRY ===");
      console.log("- targetForm:", targetF);
      console.log("- keys count:", receivedData ? Object.keys(receivedData).length : 0);
      console.log("- ALL keys:", receivedData ? Object.keys(receivedData) : 'N/A');
      console.log("- ALL entries:", receivedData ? Object.entries(receivedData) : 'N/A');
    }

    const orientation = this.config.orientation === 'landscape' ? 'landscape' : 'portrait';
    this.doc = new jsPDF({
      orientation,
      unit: 'mm',
      format: this.config.pageSize
    });

    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.currentY = this.margin;

    if (this.config.watermark) {
      this.addWatermark();
    }

    // --- SECTIONS (mode-aware — FASE 3.5) ---
    const mode = options.mode || 'global';
    const ms   = options.moduleStatus || {};
    const notApplicableList: string[] = [];

    const isNA    = (key: string): boolean => ms[key] === 'no-aplica';
    const trackNA = (key: string): void => { notApplicableList.push(MODULE_LABELS[key] || key); };

    // Render a form section respecting moduleStatus
    const renderModule = (
      key: string,
      sectionTitle: string,
      data: any,
      renderFn: () => void
    ): void => {
      if (!this.doc) return;
      if (isNA(key)) { trackNA(key); return; }
      const hasData = data != null && typeof data === 'object' && Object.keys(data).length > 0;
      if (!hasData) {
        this.addPageIfNeeded(20);
        this.addSectionTitle(sectionTitle);
        this.doc.setFontSize(9);
        this.doc.setTextColor('#64748b');
        // Only show "pendiente" if explicitly marked as "aplicable" in moduleStatus
        const isMarkedAplicable = ms[key] === 'aplicable';
        const msg = isMarkedAplicable
          ? 'Módulo aplicable — pendiente de diligenciamiento.'
          : 'Formulario no diligenciado.';
        this.doc.text(msg, this.margin, this.currentY);
        this.currentY += 10;
        return;
      }
      renderFn();
    };

    if (mode === 'single-form' && options.targetForm) {
      // ── MODO: INFORME INDIVIDUAL ────────────────────────────────────
      this.addInspectionBodyInfo(options.inspectionBodyInfo);
      this.addRetieProjectInfo(options.retieProjectInfo, options.inspection);

      const formPhotos = (options.photoEvidence || []).filter(p => !p.formId || p.formId === options.targetForm);

      switch (options.targetForm) {
        case 'APANTALLAMIENTO':
          this.addSchemaBasedFormNoCierre('12. LISTA DE CHEQUEO APANTALLAMIENTO', RETIE_APANTALLAMIENTO_SCHEMA, options.formApantallamiento); break;
        case 'PISCINAS':
          this.addSchemaBasedFormNoCierre('13. LISTA DE CHEQUEO PISCINAS', RETIE_PISCINAS_SCHEMA, options.formPiscinas); break;
        case 'ASCENSORES':
          this.addSchemaBasedFormNoCierre('14. LISTA DE CHEQUEO ASCENSORES', RETIE_ASCENSORES_SCHEMA, options.formAscensores); break;
        case 'DISENO':
          this.addSchemaBasedFormRich('7. LISTA DE CHEQUEO DISEÑO', RETIE_DISENO_SCHEMA, options.formDiseno); break;
        case 'UFR':
          this.addSchemaBasedFormRich('9. USO FINAL RESIDENCIAL (U.F.R)', RETIE_UFR_SCHEMA, options.formUFR); break;
        case 'UFIYC':
          this.addSchemaBasedFormRich('10. USO FINAL INDUSTRIAL Y COMERCIAL (UF I Y C)', RETIE_UFIYC_SCHEMA, options.formUFIYC); break;
        case 'ACPSDEBCI':
          this.addSchemaBasedFormRich('11. ACP-SDE-BCI', RETIE_ACP_SDE_BCI_SCHEMA, options.formACPSDEBCI); break;
        case 'DISTRIBUCION':
          this.addFormDistribucion(options.formDistribucion); break;
        case 'PRODUCTO':
          this.addFormProductoRich('15. REVISIÓN DE PRODUCTOS', RETIE_PRODUCTO_SCHEMA, options.formProducto, formPhotos); break;
        case 'R_SPT':
          this.addFormRSpt(options.formRSpt); break;
        case 'R_AISLAMIENTO':
          this.addFormAislamiento(options.formAislamiento); break;
        case 'ILUMINANCIA':
          this.addFormIluminancia(options.formIluminancia); break;
        case 'IN':
          this.addFormIN(options.formIn, options.retieProjectInfo, options.inspection); break;
        case 'CARPETA':
          this.addFormCarpeta(options.formCarpeta); break;
        default:
          this.addPageIfNeeded(20);
          this.doc!.setFontSize(9);
          this.doc!.setTextColor('#ef4444');
          this.doc!.text(`Formulario "${options.targetForm}" no reconocido en el sistema.`, this.margin, this.currentY);
          this.currentY += 10;
      }

      // Evidencias filtradas para este formulario (ya declarada al inicio)
      const tf = options.targetForm;
      
      console.log("=== LOG 5: PDFENGINE RECIBE EVIDENCIAS ===");
      console.log("targetForm:", tf);
      console.log("photoEvidence recibido:", options.photoEvidence?.length || 0);
      console.log("formPhotos filtradas:", formPhotos.length);
      formPhotos.forEach((p, i) => {
        console.log(`  Foto ${i + 1}:`);
        console.log(`    caption: ${p.caption}`);
        console.log(`    dataUrl exists: ${!!p.dataUrl}`);
        console.log(`    dataUrl type: ${p.dataUrl ? p.dataUrl.slice(0, 30) : 'N/A'}`);
        console.log(`    dataUrl valid: ${p.dataUrl?.startsWith('data:image/') || false}`);
      });
      
      if (formPhotos.length > 0) { this.addPhotoEvidence(formPhotos); }

      // NCs del formulario
      if (options.compliance && options.compliance.noConformities.length > 0) {
        this.addNonConformities(options.compliance);
      }
      this.addDictamen(options.dictamenResult, options.inspectorInfo);

    } else {
      // ── MODO: PDF GLOBAL (DICTAMEN COMPLETO FILTRADO) ───────────────
      renderModule('IN', '1. PORTADA TÉCNICA (IN)', options.formIn,
        () => this.addFormIN(options.formIn, options.retieProjectInfo, options.inspection));
      this.addRetieProjectInfo(options.retieProjectInfo, options.inspection);
      this.addInspectionBodyInfo(options.inspectionBodyInfo);
      this.addInspectorInfo(options.inspectorInfo);
      this.addComplianceDeclarations(options.complianceDeclarations);

      renderModule('CARPETA',     '6. REVISIÓN DOCUMENTAL (CARPETA)',                 options.formCarpeta,       () => this.addFormCarpeta(options.formCarpeta));
      renderModule('DISENO',      '7. LISTA DE CHEQUEO DISEÑO',                       options.formDiseno,        () => this.addFormDiseno(options.formDiseno));
      renderModule('DISTRIBUCION','8. LISTA DE CHEQUEO DISTRIBUCIÓN',                 options.formDistribucion,  () => this.addFormDistribucion(options.formDistribucion));
      renderModule('UFR',         '9. USO FINAL RESIDENCIAL (U.F.R)',                 options.formUFR,           () => this.addFormUFR(options.formUFR));
      renderModule('UFIYC',       '10. USO FINAL INDUSTRIAL Y COMERCIAL (UF I Y C)', options.formUFIYC,          () => this.addFormUFIYC(options.formUFIYC));
      renderModule('ACPSDEBCI',   '11. ACP-SDE-BCI',                                 options.formACPSDEBCI,     () => this.addFormACPSDEBCI(options.formACPSDEBCI));
      renderModule('APANTALLAMIENTO','12. LISTA DE CHEQUEO APANTALLAMIENTO',          options.formApantallamiento,() => this.addFormApantallamientoNoCierre(options.formApantallamiento));
      renderModule('PISCINAS',    '13. LISTA DE CHEQUEO PISCINAS',                   options.formPiscinas,      () => this.addFormPiscinasNoCierre(options.formPiscinas));
      renderModule('ASCENSORES',  '14. LISTA DE CHEQUEO ASCENSORES',                 options.formAscensores,    () => this.addFormAscensoresNoCierre(options.formAscensores));
      renderModule('PRODUCTO',    '15. REVISIÓN DE PRODUCTOS',                       options.formProducto,      () => this.addFormProductoRich('15. REVISIÓN DE PRODUCTOS', RETIE_PRODUCTO_SCHEMA, options.formProducto, options.photoEvidence));
      renderModule('R_SPT',       '16. RESISTENCIA DE PUESTA A TIERRA (R. SPT)',     options.formRSpt,          () => this.addFormRSptWithEvidence(options.formRSpt, options.photoEvidence));
      renderModule('R_AISLAMIENTO','17. RESISTENCIA DE AISLAMIENTO',                 options.formAislamiento,   () => this.addFormAislamiento(options.formAislamiento));
      renderModule('ILUMINANCIA', '18. MEDICIONES DE ILUMINANCIA',                   options.formIluminancia,   () => this.addFormIluminancia(options.formIluminancia));

      // Resumen de módulos no aplicables al alcance
      if (notApplicableList.length > 0) { this.addNotApplicableModulesList(notApplicableList); }

      // 19. No conformidades
      if (options.compliance && options.compliance.noConformities.length > 0) {
        this.addNonConformities(options.compliance);
      }
      // 20. Evidencias fotográficas
      if (options.photoEvidence && options.photoEvidence.length > 0) {
        this.addPhotoEvidence(options.photoEvidence);
      }
      // 21. Adjuntos
      if (options.attachments && options.attachments.length > 0) {
        this.addAttachments(options.attachments);
      }
      // 22. Dictamen & 23. Firmas
      this.addDictamen(options.dictamenResult, options.inspectorInfo);
    }

    this.addFooter(options.inspectionBodyInfo?.nombre);

    return this.doc.output('blob');
  }

  // ==========================================
  // SECTION RENDERING
  // ==========================================

  private addInspectionBodyInfo(bodyInfo?: InspectionBodyInfo): void {
    if (!this.doc) return;

    if (bodyInfo?.logo) {
      try {
        this.doc.addImage(bodyInfo.logo, 'PNG', this.margin, this.currentY, 35, 18);
      } catch (e) {
        console.warn('Logo no agregado:', e);
      }
    }

    this.doc.setFontSize(14);
    this.doc.setTextColor(this.config.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    
    const titleX = this.pageWidth / 2;
    this.doc.text(this.config.title, titleX, this.currentY + 6, { align: 'center' });
    
    this.doc.setFontSize(9);
    this.doc.setTextColor(this.config.secondaryColor);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(this.config.subtitle || '', titleX, this.currentY + 11, { align: 'center' });
    
    if (bodyInfo) {
      this.doc.setFontSize(8);
      this.doc.text(`${bodyInfo.nombre} - NIT: ${bodyInfo.nit}`, titleX, this.currentY + 16, { align: 'center' });
      this.doc.text(`Acreditación ONAC: ${bodyInfo.resolucionAcreditacion}`, titleX, this.currentY + 20, { align: 'center' });
    }

    this.currentY += 25;
    this.doc.setDrawColor(this.config.primaryColor);
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 8;
  }

  private addRetieProjectInfo(info?: RetieProjectInfo, rawInspection?: any): void {
    if (!this.doc) return;
    this.addSectionTitle('2. INFORMACIÓN DEL PROYECTO (EXPEDIENTE)');

    const tableData = [
      ['Proyecto / Instalación', info?.proyecto || rawInspection?.siteName || 'N/A'],
      ['Dirección', info?.direccion || rawInspection?.siteAddress || 'N/A'],
      ['Ciudad / Municipio', info?.ciudad || 'N/A'],
      ['Propietario', info?.propietario || 'N/A'],
      ['Alcance de la Inspección', info?.alcance || 'N/A'],
      ['Uso de la Instalación', info?.uso || 'N/A'],
      ['Fecha de Inspección', info?.fechaInspeccion || rawInspection?.inspectionDate || 'N/A'],
      ['Número de Dictamen', info?.numeroDictamen || 'N/A']
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [],
      body: tableData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3, textColor: '#333333', lineColor: '#cbd5e1', lineWidth: 0.1 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fafc', cellWidth: 70 } },
      margin: { left: this.margin, right: this.margin }
    });

    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addInspectorInfo(info?: InspectorInfo): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle('4. PERSONAL INVOLUCRADO (INSPECTOR)');

    const tableData = [
      ['Inspector(es)', info?.inspectorNombre || 'N/A', info?.inspectorMatricula || 'N/A'],
      ['Director Técnico', info?.directorNombre || 'N/A', info?.directorMatricula || 'N/A'],
      ['Diseñador', info?.disenadorNombre || 'N/A', info?.disenadorMatricula || 'N/A'],
      ['Constructor', info?.constructorNombre || 'N/A', info?.constructorMatricula || 'N/A']
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Rol', 'Nombre Completo', 'Matrícula Profesional']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: this.config.secondaryColor, fontSize: 9 },
      styles: { fontSize: 8, cellPadding: 3 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fafc' } },
      margin: { left: this.margin, right: this.margin }
    });

    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addComplianceDeclarations(declarations?: string[]): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle('5. DECLARACIONES DE CUMPLIMIENTO');

    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor('#334155');

    const defaults = [
      "Se ha verificado el cumplimiento de los requisitos establecidos en el Reglamento Técnico de Instalaciones Eléctricas (RETIE).",
      "Las mediciones de resistencia de puesta a tierra y aislamiento se encuentran dentro de los parámetros normativos.",
      "Se evidenció que los productos utilizados cuentan con certificado de conformidad válido.",
      "Se verificó la declaración de cumplimiento suscrita por el constructor responsable."
    ];

    const list = (declarations && declarations.length > 0) ? declarations : defaults;

    list.forEach(decl => {
      const textLines = this.doc!.splitTextToSize(`• ${decl}`, this.pageWidth - (this.margin * 2));
      this.doc!.text(textLines, this.margin, this.currentY);
      this.currentY += (textLines.length * 4) + 2;
    });

    this.currentY += 6;
  }

  private addNonConformities(compliance: ComplianceResult): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle(`19. NO CONFORMIDADES HALLADAS (${compliance.noConformities.length})`);

    const ncData = compliance.noConformities.map(nc => [
      nc.fieldLabel,
      nc.severity.toUpperCase(),
      nc.description
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Campo / Ítem', 'Severidad', 'Descripción de la No Conformidad']],
      body: ncData,
      theme: 'grid',
      headStyles: { fillColor: '#991b1b', textColor: '#ffffff' }, // Red theme for NCs
      styles: { fontSize: 8, cellPadding: 4 },
      columnStyles: { 
        0: { cellWidth: 50 },
        1: { cellWidth: 25, fontStyle: 'bold' } 
      },
      margin: { left: this.margin, right: this.margin }
    });

    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addPhotoEvidence(photos: any[]): void {
    if (!this.doc) return;
    
    console.log("=== LOG 6: addPhotoEvidence RECIBE ===");
    console.log("photos.length:", photos.length);
    
    this.addPageIfNeeded(60);
    this.addSectionTitle('20. EVIDENCIAS FOTOGRÁFICAS');

    const cols = 1; // Una foto por fila para espacio de metadatos
    const imgWidth = 100;
    const imgHeight = 75;
    const paddingX = 10;
    const paddingY = 45; // Espacio para metadatos

    let col = 0;

    photos.forEach((photo, idx) => {
      // Normalizar evidencia
      const normalized = this.normalizeEvidence(photo);
      
      console.log(`  Procesando foto ${idx + 1}:`, {
        formId: normalized.formId,
        questionId: normalized.questionId,
        caption: normalized.caption,
        hasDataUrl: !!normalized.dataUrl,
        startsWithDataImage: normalized.dataUrl?.startsWith('data:image/') || false
      });
      
      const imageData = normalized.dataUrl;
      const hasValidImage = imageData && (imageData.startsWith('data:image/') || imageData.startsWith('http') || imageData.startsWith('/'));

      console.log(`  Foto ${idx + 1} - hasValidImage:`, hasValidImage);

      if (col === cols) {
        col = 0;
        this.currentY += imgHeight + paddingY;
        this.addPageIfNeeded(imgHeight + paddingY + 10);
      }

      const x = this.margin + (col * (imgWidth + paddingX));
      
      // Mostrar imagen
      if (hasValidImage) {
        try {
          // Detectar formato a partir del dataUrl
          let fmt: string = 'JPEG';
          if (imageData.startsWith('data:image/png')) fmt = 'PNG';
          else if (imageData.startsWith('data:image/webp')) fmt = 'WEBP';
          this.doc!.addImage(imageData, fmt, x, this.currentY, imgWidth, imgHeight);
        } catch (e) {
          console.warn('Error rendering image', e);
          // Fallback if image fails to render
          this.doc!.setFillColor(241, 245, 249); // slate-100
          this.doc!.rect(x, this.currentY, imgWidth, imgHeight, 'F');
          this.doc!.setFontSize(9);
          this.doc!.setTextColor('#64748b');
          this.doc!.setFont('helvetica', 'normal');
          this.doc!.text("Evidencia registrada,\nimagen no disponible", x + 5, this.currentY + 30);
        }
      } else {
        // Fallback for missing/invalid dataUrl
        this.doc!.setFillColor(241, 245, 249); // slate-100
        this.doc!.rect(x, this.currentY, imgWidth, imgHeight, 'F');
        this.doc!.setFontSize(9);
        this.doc!.setTextColor('#64748b');
        this.doc!.setFont('helvetica', 'normal');
        this.doc!.text("Evidencia registrada,\nimagen no disponible", x + 5, this.currentY + 30);
      }
      
      // Mostrar metadatos bajo la imagen
      const metadataY = this.currentY + imgHeight + 3;
      this.doc!.setFontSize(7);
      this.doc!.setTextColor('#1e293b'); // slate-800
      this.doc!.setFont('helvetica', 'bold');
      
      // Línea 1: Módulo e Ítem
      const line1 = `Módulo: ${normalized.formId} | Ítem: ${normalized.questionId}`;
      this.doc!.text(line1, x, metadataY);
      
      // Línea 2: Descripción (wrappable)
      this.doc!.setFont('helvetica', 'normal');
      const descLines = this.doc!.splitTextToSize(`Desc: ${normalized.caption}`, imgWidth - 2);
      this.doc!.text(descLines, x, metadataY + 4);
      
      // Línea 3: Archivo
      this.doc!.setFont('helvetica', 'italic');
      this.doc!.setTextColor('#64748b'); // slate-500
      this.doc!.text(`Archivo: ${normalized.fileName}`, x, metadataY + 4 + (descLines.length * 3) + 2);

      col++;
    });

    this.currentY += imgHeight + paddingY + 5;
  }

  private addAttachments(attachments: any[]): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle('21. DOCUMENTOS ANEXOS');

    // Normalizar cada adjunto para evitar undefined
    const attData = attachments.map(att => [
      att.type || 'N/A',
      att.formLabel || att.formId || 'General',
      att.fileName || 'Sin nombre',
      att.size || 'N/A',
      att.observacion || att.notes || '-',
      att.date || new Date().toLocaleDateString('es-CO')
    ]);

    autoTable(this.doc, {
      startY: this.currentY,
      head: [['Tipo', 'Módulo', 'Archivo', 'Tamaño', 'Observación', 'Fecha']],
      body: attData,
      theme: 'striped',
      headStyles: { fillColor: this.config.secondaryColor, fontSize: 8 },
      styles: { fontSize: 7 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 35 },
        3: { cellWidth: 20 },
        4: { cellWidth: 35 },
        5: { cellWidth: 25 }
      },
      margin: { left: this.margin, right: this.margin }
    });

    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addDictamen(result?: 'APROBADO' | 'NO APROBADO', inspectorInfo?: InspectorInfo): void {
    if (!this.doc) return;
    this.addPageIfNeeded(80);
    this.addSectionTitle('22. DICTAMEN FINAL');

    const isApproved = result === 'APROBADO';
    const finalColor = isApproved ? '#15803d' : '#b91c1c'; // Green or Red

    this.doc.setDrawColor(finalColor);
    this.doc.setFillColor('#f8fafc');
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25, 3, 3, 'FD');

    this.doc.setFontSize(18);
    this.doc.setTextColor(finalColor);
    this.doc.setFont('helvetica', 'bold');
    
    this.doc.text(
      `RESULTADO: ${result || 'NO DEFINIDO'}`, 
      this.pageWidth / 2, 
      this.currentY + 16, 
      { align: 'center' }
    );

    this.currentY += 45;

    // FIRMAS
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.config.primaryColor);
    this.doc.text('23. FIRMAS DE APROBACIÓN', this.margin, this.currentY);
    this.currentY += 25;

    const signatureY = this.currentY;

    // Line Inspector
    this.doc.setDrawColor('#94a3b8');
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, signatureY, this.margin + 60, signatureY);

    this.doc.setFontSize(9);
    this.doc.setTextColor('#334155');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(inspectorInfo?.inspectorNombre || 'Inspector', this.margin + 30, signatureY + 5, { align: 'center' });
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Matrícula: ${inspectorInfo?.inspectorMatricula || 'N/A'}`, this.margin + 30, signatureY + 10, { align: 'center' });
    this.doc.text('INSPECTOR RETIE', this.margin + 30, signatureY + 15, { align: 'center' });

    // Line Director
    this.doc.line(this.pageWidth - this.margin - 60, signatureY, this.pageWidth - this.margin, signatureY);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(inspectorInfo?.directorNombre || 'Director Técnico', this.pageWidth - this.margin - 30, signatureY + 5, { align: 'center' });
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Matrícula: ${inspectorInfo?.directorMatricula || 'N/A'}`, this.pageWidth - this.margin - 30, signatureY + 10, { align: 'center' });
    this.doc.text('DIRECTOR TÉCNICO', this.pageWidth - this.margin - 30, signatureY + 15, { align: 'center' });

    this.currentY += 30;
  }

  private addFormIN(data: any, projectInfo?: RetieProjectInfo, inspection?: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle('1. PORTADA TÉCNICA (IN)');
    
    if (!data) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario IN no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const inData = [
      ['Instalación', data.in_instalacion || projectInfo?.proyecto || inspection?.siteName || '-'],
      ['Dirección', data.in_direccion || projectInfo?.direccion || inspection?.siteAddress || '-'],
      ['Sistema de Puesta a Tierra (SPT)', data.spt_desc || '-'],
      ['Equipotencialidad', data.equipo_desc || '-'],
      ['Resumen Observaciones', data.in_observaciones || '-']
    ];

    autoTable(this.doc, {
      startY: this.currentY,
      head: [],
      body: inData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3, textColor: '#333333' },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f1f5f9', cellWidth: 70 } },
      margin: { left: this.margin, right: this.margin }
    });
    // @ts-ignore
    this.currentY = this.doc.lastAutoTable.finalY + 10;
  }

  private addFormCarpeta(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle('6. REVISIÓN DOCUMENTAL (CARPETA)');
    
    if (!data) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario CARPETA no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const carpetaKeys = Object.keys(data).filter(k => k.includes('__revision_1') || k.includes('__cierre'));
    if (carpetaKeys.length === 0) {
      this.doc.setFontSize(9);
      this.doc.text('Sin registros de revisión documental.', this.margin, this.currentY);
      this.currentY += 10;
    } else {
      const summaryData = [
        ['Dictamen No.', data.numero_dictamen || '-'],
        ['Subestación', data.dictamen_subestacion || '-'],
        ['Distribución', data.dictamen_distribucion || '-'],
        ['Uso Final', data.dictamen_uso_final || '-'],
        ['Observaciones Documentales', data.observaciones || '-']
      ];
      autoTable(this.doc, {
        startY: this.currentY,
        head: [],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: '#333333' },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f1f5f9', cellWidth: 50 } },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }
  }

  private addFormAislamiento(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle('17. RESISTENCIA DE AISLAMIENTO');
    
    if (!data) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario AISLAMIENTO no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const rows: string[][] = [];
    Object.keys(data).forEach(key => {
      if (key.includes('_row_')) {
        rows.push([key, String(data[key])]);
      }
    });

    if (rows.length > 0) {
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Campo / Celda', 'Valor Registrado']],
        body: rows,
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, textColor: '#333333' },
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    } else {
      this.doc.setFontSize(9);
      this.doc.text('Datos de aislamiento registrados en formato complejo.', this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addFormIluminancia(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(40);
    this.addSectionTitle('18. MEDICIONES DE ILUMINANCIA');
    
    if (!data) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario ILUMINANCIA no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const rows: string[][] = [];
    Object.keys(data).forEach(key => {
      if (key.includes('_row_')) {
        rows.push([key, String(data[key])]);
      }
    });

    if (rows.length > 0) {
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['Punto de Medición', 'Lux Registrados']],
        body: rows.slice(0, 15), // Muestra los primeros 15 como resumen
        theme: 'striped',
        styles: { fontSize: 8, cellPadding: 2, textColor: '#333333' },
        headStyles: { fillColor: [30, 64, 175], textColor: 255 },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc.lastAutoTable.finalY + 10;
      if (rows.length > 15) {
        this.doc.setFontSize(8);
        this.doc.text(`... y ${rows.length - 15} mediciones adicionales registradas.`, this.margin, this.currentY);
        this.currentY += 8;
      }
    } else {
      this.doc.setFontSize(9);
      this.doc.text('Datos de iluminancia registrados en formato complejo.', this.margin, this.currentY);
      this.currentY += 10;
    }
  }

  private addFormDiseno(data: any): void {
    this.addSchemaBasedForm('7. LISTA DE CHEQUEO DISEÑO', RETIE_DISENO_SCHEMA, data);
  }

  private addFormDistribucion(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle('8. LISTA DE CHEQUEO DISTRIBUCIÓN');
    
    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario DISTRIBUCIÓN no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const puntos = ['punto_1', 'punto_2', 'punto_3', 'punto_4', 'punto_5'];
    
    (RETIE_DISTRIBUCION_SCHEMA as any).secciones?.forEach((sec: any) => {
      let secRows: string[][] = [];
      sec.preguntas?.forEach((p: any) => {
        if (p.id === 'DIST-OBS') return;
        
        puntos.forEach(pt => {
          const v1Key = `${p.id}__${pt}__visita_1`;
          const cKey = `${p.id}__${pt}__cierre`;
          const obsKey = `${v1Key}__obs`;
          
          let v1 = this.cleanValue(data[v1Key], '');
          let c = this.cleanValue(data[cKey], '');
          let rawObs = this.cleanValue(data[obsKey], '');
          let obs = rawObs ? `\nObs: ${rawObs}` : '';
          
          if (v1 || c || rawObs) {
            secRows.push([`${p.texto || p.pregunta || p.id} (${pt})` + obs, v1 || '-', c || '-']);
          }

          if (p.id === 'DIST-026') {
             // Handle distance measurement special fields (Item 19)
             p.campos_distancia?.forEach((cd: any) => {
                const k = `${p.id}__${pt}__${cd.id}`;
                if (data[k] !== undefined && data[k] !== null) {
                  secRows.push([`Distancia ${cd.label} (${pt})`, `${data[k]} m`, '-']);
                }
             });
          }

          if (p.id === 'DIST-047') {
             // Handle burial depth special field (Item 47)
             const depthKey = `${p.id}__${pt}__profundidad_medida`;
             if (data[depthKey] !== undefined && data[depthKey] !== null && data[depthKey] !== '') {
               secRows.push([`Prof. enterramiento medida (${pt})`, `${data[depthKey]} m`, '-']);
             }
          }
        });
      });

      if (secRows.length > 0) {
        this.addPageIfNeeded(20);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#1e293b');
        this.doc.text(sec.titulo, this.margin, this.currentY);
        this.currentY += 4;
        
        autoTable(this.doc, {
          startY: this.currentY,
          head: [['Pregunta / Punto', 'Visita 1', 'Cierre']],
          body: secRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 25, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' } },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        // @ts-ignore
        this.currentY = this.doc.lastAutoTable.finalY + 10;
      }
    });
  }

  private addFormUFR(data: any): void {
    this.addSchemaBasedForm('9. USO FINAL RESIDENCIAL (U.F.R)', RETIE_UFR_SCHEMA, data);
  }

  private addFormUFIYC(data: any): void {
    this.addSchemaBasedForm('10. USO FINAL INDUSTRIAL Y COMERCIAL (UF I Y C)', RETIE_UFIYC_SCHEMA, data);
  }

  private addFormACPSDEBCI(data: any): void {
    this.addSchemaBasedForm('11. ACP-SDE-BCI', RETIE_ACP_SDE_BCI_SCHEMA, data);
  }

  private addFormApantallamiento(data: any): void {
    this.addSchemaBasedForm('12. LISTA DE CHEQUEO APANTALLAMIENTO', RETIE_APANTALLAMIENTO_SCHEMA, data);
  }

  private addFormApantallamientoNoCierre(data: any): void {
    this.addSchemaBasedFormNoCierre('12. LISTA DE CHEQUEO APANTALLAMIENTO', RETIE_APANTALLAMIENTO_SCHEMA, data);
  }

  private addFormPiscinas(data: any): void {
    this.addSchemaBasedForm('13. LISTA DE CHEQUEO PISCINAS', RETIE_PISCINAS_SCHEMA, data);
  }

  private addFormPiscinasNoCierre(data: any): void {
    this.addSchemaBasedFormNoCierre('13. LISTA DE CHEQUEO PISCINAS', RETIE_PISCINAS_SCHEMA, data);
  }

  private addFormAscensores(data: any): void {
    this.addSchemaBasedForm('14. LISTA DE CHEQUEO ASCENSORES', RETIE_ASCENSORES_SCHEMA, data);
  }

  private addFormAscensoresNoCierre(data: any): void {
    this.addSchemaBasedFormNoCierre('14. LISTA DE CHEQUEO ASCENSORES', RETIE_ASCENSORES_SCHEMA, data);
  }

  private addSchemaBasedForm(title: string, schema: any, data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle(title);
    
    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text(`Formulario no diligenciado.`, this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    schema.secciones?.forEach((sec: any) => {
      let secRows: string[][] = [];
      sec.preguntas?.forEach((p: any) => {
        const flatKey = p.id;
        const flatObsKey = `${p.id}_obs`;
        const flatCierreKey = `${p.id}_cierre`;

        let v1 = this.cleanValue(data[flatKey], '');
        let cierre = this.cleanValue(data[flatCierreKey], '');
        let rawObs = this.cleanValue(data[flatObsKey], '');
        let obs = rawObs ? `\nObs: ${rawObs}` : '';

        if (v1 || cierre || rawObs) {
          secRows.push([p.pregunta + obs, v1 || '-', cierre || '-']);
        }
      });

      if (secRows.length > 0) {
        this.addPageIfNeeded(20);
        this.doc.setFontSize(10);
        this.doc.setTextColor('#1e293b');
        this.doc.text(sec.titulo, this.margin, this.currentY);
        this.currentY += 4;
        
        autoTable(this.doc, {
          startY: this.currentY,
          head: [['Pregunta', 'Visita 1', 'Cierre']],
          body: secRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 25, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' } },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        // @ts-ignore
        this.currentY = this.doc.lastAutoTable.finalY + 10;
      }
    });
  }

  private cleanValue(val: any, fallback: string = '-'): string {
    if (val === undefined || val === null || val === '') return fallback;
    const str = String(val).trim();
    if (str.toLowerCase() === 'nan' || str.toLowerCase() === 'undefined' || str.toLowerCase() === 'null') {
      return fallback;
    }
    return str;
  }

  /** Limpiar observaciones de diagnóstico del agente AI */
  private cleanObservations(val: any): string {
    if (val === undefined || val === null || val === '') return '';
    const str = String(val).trim();
    
    // Palabras clave que indican texto de diagnóstico del agente
    const diagnosticPatterns = [
      /carga correctamente/i,
      /producto\.\.\./i,
      /r_spt\.\.\./i,
      /r\.spt\.\.\./i,
      /sección \d+/i,
      /consolidación pdf global/i,
      /consolidación de pdf/i,
      /pdf global/i,
      /flujo de datos/i,
      /verificación de/i,
      /registro de observaciones/i,
      /líneas que contienen/i,
      /observaciones reales del usuario/i,
      /diagnóstico del agente/i,
      /texto de diagnóstico/i,
      /logs? de validación/i,
      /logs? o validación/i,
      /agente ai/i,
      /agente ia/i,
      /revisión diagnóstica/i,
      /análisis de consistencia/i,
      /validación de integridad/i,
      /prueba de carga/i
    ];

    // Si el texto contiene patrones de diagnóstico, retornar vacío
    for (const pattern of diagnosticPatterns) {
      if (pattern.test(str)) {
        return '';
      }
    }
    
    return str;
  }

  private addFormProducto(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle('15. REVISIÓN DE PRODUCTOS');

    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario PRODUCTO no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // Support simplified schema (preguntas) and full schema (items)
    const secciones = (RETIE_PRODUCTO_SCHEMA as any).secciones || [];
    
    secciones.forEach((sec: any) => {
      // Schema simplificado: sec.preguntas
      if (sec.preguntas && sec.preguntas.length > 0) {
        let secRows: string[][] = [];
        
        sec.preguntas.forEach((p: any) => {
          const flatKey = p.id;
          const flatObsKey = `${p.id}_obs`;

          let v1 = this.cleanValue(data[flatKey], '');
          let rawObs = this.cleanValue(data[flatObsKey], '');
          let obs = rawObs ? `\nObs: ${rawObs}` : '';

          if (v1 || rawObs) {
            secRows.push([p.pregunta + obs, v1 || '-', '-']);
          }
        });

        if (secRows.length > 0) {
          this.addPageIfNeeded(20);
          this.doc.setFontSize(10);
          this.doc.setTextColor('#1e293b');
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(sec.titulo || 'Preguntas', this.margin, this.currentY);
          this.currentY += 4;
          
          autoTable(this.doc, {
            startY: this.currentY,
            head: [['Pregunta / Observación', 'Visita 1', 'Cierre']],
            body: secRows,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
            columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 25, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' } },
            headStyles: { fillColor: [71, 85, 105], textColor: 255 },
            margin: { left: this.margin, right: this.margin }
          });
          // @ts-ignore
          this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
      }
      
      // Schema completo: sec.items
      if (sec.items && sec.items.length > 0) {
        let itemRows: string[][] = [];
        
        sec.items.forEach((item: any) => {
          const aplicaVal = this.cleanValue(data[`${item.id}_aplica`], '');
          if (aplicaVal === 'SI') {
            itemRows.push([
              this.cleanValue(item.descripcion_producto, 'N/A'),
              aplicaVal
            ]);
          }
        });
        
        if (itemRows.length > 0) {
          this.addPageIfNeeded(20);
          this.doc.setFontSize(10);
          this.doc.setTextColor('#1e293b');
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(sec.titulo || 'Items', this.margin, this.currentY);
          this.currentY += 4;
          
          autoTable(this.doc, {
            startY: this.currentY,
            head: [['Producto / Ítem', '¿Aplica?']],
            body: itemRows,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
            headStyles: { fillColor: [71, 85, 105], textColor: 255 },
            margin: { left: this.margin, right: this.margin }
          });
          // @ts-ignore
          this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
      }
    });
  }

  /** PRODUCTO con evidencias debajo de cada pregunta */
  private addFormProductoRich(title: string, schema: any, data: any, photoEvidence?: any[]): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle(title);

    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario PRODUCTO no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    const formPhotos = photoEvidence || [];
    const secciones = schema.secciones || [];
    
    secciones.forEach((sec: any) => {
      // Schema simplificado: sec.preguntas
      if (sec.preguntas && sec.preguntas.length > 0) {
        let secRows: string[][] = [];
        
        sec.preguntas.forEach((p: any) => {
          const flatKey = p.id;
          const flatObsKey = `${p.id}_obs`;
          let v1 = this.cleanValue(data[flatKey], '');
          let rawObs = this.cleanValue(data[flatObsKey], '');
          let obs = rawObs ? `\nObs: ${rawObs}` : '';

          if (v1 || rawObs) {
            secRows.push([p.pregunta + obs, v1 || '-', '-']);
          }
        });

        if (secRows.length > 0) {
          this.addPageIfNeeded(20);
          this.doc.setFontSize(10);
          this.doc.setTextColor('#1e293b');
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(sec.titulo || 'Preguntas', this.margin, this.currentY);
          this.currentY += 4;
          
          autoTable(this.doc, {
            startY: this.currentY,
            head: [['Pregunta / Observación', 'Visita 1', 'Cierre']],
            body: secRows,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
            columnStyles: { 0: { cellWidth: 110 }, 1: { cellWidth: 25, halign: 'center' }, 2: { cellWidth: 25, halign: 'center' } },
            headStyles: { fillColor: [71, 85, 105], textColor: 255 },
            margin: { left: this.margin, right: this.margin }
          });
          // @ts-ignore
          this.currentY = this.doc.lastAutoTable.finalY + 6;

          // Evidencias de preguntas en esta sección
          const secPregIds = sec.preguntas.map((p: any) => p.id);
          const relatedPhotos = formPhotos.filter(ph => secPregIds.includes(ph.questionId));
          
          if (relatedPhotos.length > 0) {
            this.addPageIfNeeded(30);
            this.doc.setFontSize(8);
            this.doc.setTextColor('#64748b');
            this.doc.setFont('helvetica', 'italic');
            this.doc.text('Evidencias:', this.margin, this.currentY);
            this.currentY += 5;

            const cols = 3;
            const imgW = 55;
            const imgH = 42;
            const padX = 8;
            const padY = 6;
            const rowH = imgH + 18;
            let col = 0;
            let startRowY = this.currentY;
            const pageEnd = this.doc.internal.pageSize.height - this.margin - 10;

            relatedPhotos.forEach((photo: any, idx: number) => {
              const photoPregId = photo.questionId;
              const photoPreg = sec.preguntas.find((p: any) => p.id === photoPregId);
              const pregLabel = photoPreg ? `Preg. ${photoPreg.numero}` : '';
              const pregDesc = photoPreg ? photoPreg.pregunta?.slice(0, 50) || '' : '';

              if (col === cols) {
                col = 0;
                startRowY += rowH + padY;
                this.addPageIfNeeded(rowH + padY + 10);
                this.currentY = startRowY;
              }

              const x = this.margin + (col * (imgW + padX));

              if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
                try {
                  let fmt = 'JPEG';
                  if (photo.dataUrl.startsWith('data:image/png')) fmt = 'PNG';
                  else if (photo.dataUrl.startsWith('data:image/webp')) fmt = 'WEBP';
                  this.doc.addImage(photo.dataUrl, fmt, x, startRowY, imgW, imgH);
                  this.doc.setDrawColor(180, 180, 180);
                  this.doc.rect(x, startRowY, imgW, imgH);
                } catch (e) {
                  this.doc.setFillColor(241, 245, 249);
                  this.doc.rect(x, startRowY, imgW, imgH, 'F');
                  this.doc.setFontSize(7);
                  this.doc.setTextColor('#64748b');
                  this.doc.text("Sin preview", x + 10, startRowY + 25);
                }
              } else {
                this.doc.setFillColor(241, 245, 249);
                this.doc.rect(x, startRowY, imgW, imgH, 'F');
                this.doc.setFontSize(7);
                this.doc.setTextColor('#64748b');
                this.doc.text("Sin imagen", x + 10, startRowY + 25);
              }

              this.doc.setFontSize(6);
              this.doc.setTextColor('#334155');
              this.doc.setFont('helvetica', 'bold');
              this.doc.text(pregLabel, x, startRowY + imgH + 4);

              this.doc.setFontSize(5.5);
              this.doc.setTextColor('#64748b');
              this.doc.setFont('helvetica', 'italic');
              const capLines = this.doc.splitTextToSize(pregDesc, imgW);
              this.doc.text(capLines, x, startRowY + imgH + 9);

              this.doc.setFontSize(5);
              this.doc.setTextColor('#94a3b8');
              this.doc.setFont('helvetica', 'normal');
              this.doc.text(photo.fileName || '', x, startRowY + imgH + 15);

              col++;
            });

            const rowsUsed = Math.ceil(relatedPhotos.length / cols);
            this.currentY = startRowY + (rowsUsed * (rowH + padY)) + 10;
          }
        }
      }
      
      // Schema completo: sec.items
      if (sec.items && sec.items.length > 0) {
        let itemRows: string[][] = [];
        
        sec.items.forEach((item: any) => {
          const aplicaVal = this.cleanValue(data[`${item.id}_aplica`], '');
          if (aplicaVal === 'SI') {
            itemRows.push([
              this.cleanValue(item.descripcion_producto, 'N/A'),
              aplicaVal
            ]);
          }
        });
        
        if (itemRows.length > 0) {
          this.addPageIfNeeded(20);
          this.doc.setFontSize(10);
          this.doc.setTextColor('#1e293b');
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(sec.titulo || 'Items', this.margin, this.currentY);
          this.currentY += 4;
          
          autoTable(this.doc, {
            startY: this.currentY,
            head: [['Producto / Ítem', '¿Aplica?']],
            body: itemRows,
            theme: 'grid',
            styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
            headStyles: { fillColor: [71, 85, 105], textColor: 255 },
            margin: { left: this.margin, right: this.margin }
          });
          // @ts-ignore
          this.currentY = this.doc.lastAutoTable.finalY + 10;
        }
      }
    });
  }

  private addFormRSpt(data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle('16. RESISTENCIA DE PUESTA A TIERRA (R. SPT)');

    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Formulario R. SPT no diligenciado.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // --- INFORMACIÓN DE CONTEXTO ---
    const serviceCode = this.cleanValue(data['codigo_servicio'], '');
    const inspectionDate = this.cleanValue(data['fecha_inspeccion'], '');
    const equipmentCode = this.cleanValue(data['codigo_equipo'], '');
    const methodUsed = this.cleanValue(data['metodo_utilizado'], '');

    if (serviceCode || inspectionDate || equipmentCode || methodUsed) {
      this.addPageIfNeeded(20);
      const contextData = [
        ['Código de Servicio', serviceCode || 'N/A'],
        ['Fecha de Inspección', inspectionDate || 'N/A'],
        ['Código de Equipo (Telurómetro)', equipmentCode || 'N/A'],
        ['Método Utilizado', methodUsed || 'N/A']
      ];
      autoTable(this.doc, {
        startY: this.currentY,
        head: [],
        body: contextData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: '#333333', lineColor: '#cbd5e1', lineWidth: 0.1 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fafc', cellWidth: 70 } },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc.lastAutoTable.finalY + 8;
    }

    // --- TERRENO REGULAR ---
    this.addPageIfNeeded(20);
    this.doc.setFontSize(10);
    this.doc.setTextColor('#1e293b');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Valores medidos - TERRENO REGULAR', this.margin, this.currentY);
    this.currentY += 4;

    const regularRows: string[][] = [];
    const regularSec = RETIE_R_SPT_SCHEMA.secciones[1]; // Valores medidos - TERRENO REGULAR
    regularSec.filas?.forEach((fila: any, filaIdx: number) => {
      const sptDeField = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_spt_de`;
      const distDField = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_distancia_d_m`;
      const distX61Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_distancia_x_61_8`;
      const val61Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_valor_medido_61_8`;
      const distX52Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_distancia_x_52`;
      const val52Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_valor_medido_52`;
      const distX72Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_distancia_x_72`;
      const val72Field = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_valor_medido_72`;
      const cumpleField = `Valores_medidos_-_TERRENO_REGULAR_fila_${filaIdx}_cumple`;

      const sptDe = this.cleanValue(data[sptDeField] ?? fila.spt_de, '');
      const distD = this.cleanValue(data[distDField] ?? fila.distancia_d_m, '');
      const distX61 = this.cleanValue(data[distX61Field] ?? fila.distancia_x_61_8, '');
      const val61 = this.cleanValue(data[val61Field] ?? fila.valor_medido_61_8, '');
      const distX52 = this.cleanValue(data[distX52Field] ?? fila.distancia_x_52, '');
      const val52 = this.cleanValue(data[val52Field] ?? fila.valor_medido_52, '');
      const distX72 = this.cleanValue(data[distX72Field] ?? fila.distancia_x_72, '');
      const val72 = this.cleanValue(data[val72Field] ?? fila.valor_medido_72, '');
      const cumple = this.cleanValue(data[cumpleField] ?? fila.cumple, '');

      if (sptDe || distD) {
        regularRows.push([
          this.cleanValue(sptDe, '-'),
          this.cleanValue(distD, '-'),
          this.cleanValue(distX61, '-'),
          this.cleanValue(val61, '-'),
          this.cleanValue(distX52, '-'),
          this.cleanValue(val52, '-'),
          this.cleanValue(distX72, '-'),
          this.cleanValue(val72, '-'),
          this.cleanValue(cumple, '-')
        ]);
      }
    });

    if (regularRows.length > 0) {
      autoTable(this.doc, {
        startY: this.currentY,
        head: [['SPT de', 'd (m)', 'x 61.8% (m)', 'Med 61.8% (Ω)', 'x 52% (m)', 'Med 52% (Ω)', 'x 72% (m)', 'Med 72% (Ω)', 'Cumple']],
        body: regularRows,
        theme: 'grid',
        styles: { fontSize: 6.5, cellPadding: 1.5, textColor: '#333333' },
        headStyles: { fillColor: [71, 85, 105], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 45 },
          1: { cellWidth: 15, halign: 'center' },
          2: { cellWidth: 18, halign: 'center' },
          3: { cellWidth: 18, halign: 'center' },
          4: { cellWidth: 18, halign: 'center' },
          5: { cellWidth: 18, halign: 'center' },
          6: { cellWidth: 18, halign: 'center' },
          7: { cellWidth: 18, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' }
        },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    } else {
      this.doc.setFontSize(8);
      this.doc.setTextColor('#64748b');
      this.doc.text('No hay registros en Terreno Regular.', this.margin, this.currentY);
      this.currentY += 8;
    }

    // --- TERRENO IRREGULAR ---
    this.addPageIfNeeded(30);
    this.doc.setFontSize(10);
    this.doc.setTextColor('#1e293b');
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Valores medidos - TERRENO IRREGULAR', this.margin, this.currentY);
    this.currentY += 4;

    const irregularSec = RETIE_R_SPT_SCHEMA.secciones[2]; // TERRENO IRREGULAR
    let irregularHasData = false;

    irregularSec.grupos?.forEach((grupo: any) => {
      const gRows: string[][] = [];
      grupo.filas?.forEach((fila: any, filaIdx: number) => {
        const distKey = `TERRENO_IRREGULAR_g_${grupo.id}_fila_${filaIdx}_distancia_d_m`;
        const resKey = `TERRENO_IRREGULAR_g_${grupo.id}_fila_${filaIdx}_resistencia_ohm`;
        const dist = this.cleanValue(data[distKey] ?? fila.distancia_d_m, '');
        const res = this.cleanValue(data[resKey] ?? fila.resistencia_ohm, '');
        if (dist || res) {
          gRows.push([
            this.cleanValue(fila.porcentaje_d, '-'),
            this.cleanValue(dist, '-'),
            this.cleanValue(res, '-')
          ]);
        }
      });

      if (gRows.length > 0) {
        irregularHasData = true;
        this.addPageIfNeeded(20);
        this.doc.setFontSize(8);
        this.doc.setTextColor('#475569');
        this.doc.text(`Grupo ${grupo.id}`, this.margin, this.currentY);
        this.currentY += 3;

        autoTable(this.doc, {
          startY: this.currentY,
          head: [['Porcentaje de d', 'Distancia d (m)', 'Resistencia (Ω)']],
          body: gRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          headStyles: { fillColor: [100, 116, 139], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        // @ts-ignore
        this.currentY = this.doc.lastAutoTable.finalY + 10;
      }
    });

    if (!irregularHasData) {
      this.doc.setFontSize(8);
      this.doc.setTextColor('#64748b');
      this.doc.text('No hay registros en Terreno Irregular.', this.margin, this.currentY);
      this.currentY += 8;
    }

    // --- ANÁLISIS DE RESISTENCIA CONSTANTE (ZONA DE POTENCIAL PLANO) ---
    const resistenciaConstante = this.cleanValue(data['TERRENO_IRREGULAR_grafica_valor_resistencia_constante'], '');
    const cumpleGrafica = this.cleanValue(data['TERRENO_IRREGULAR_grafica_cumple'], '');

    if (resistenciaConstante || cumpleGrafica) {
      this.addPageIfNeeded(30);
      this.doc.setDrawColor('#cbd5e1');
      this.doc.setFillColor('#f8fafc');
      this.doc.setLineWidth(0.3);
      this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 22, 2, 2, 'FD');

      this.doc.setFontSize(8);
      this.doc.setTextColor('#1e293b');
      this.doc.setFont('helvetica', 'bold');
      this.doc.text('Análisis de Resistencia Constante (Potencial Plano):', this.margin + 4, this.currentY + 6);

      this.doc.setFont('helvetica', 'normal');
      this.doc.setTextColor('#334155');
      this.doc.text(
        `• Valor de Resistencia Constante: ${resistenciaConstante ? `${resistenciaConstante} Ω` : 'N/A'}`,
        this.margin + 4,
        this.currentY + 12
      );
      this.doc.text(
        `• ¿Cumple con la zona de potencial plano?: ${cumpleGrafica || 'N/A'}`,
        this.margin + 4,
        this.currentY + 17
      );
      this.currentY += 28;
    }

    // --- CHECKLISTS ---
    const checkSecs = [
      RETIE_R_SPT_SCHEMA.secciones[3],
      RETIE_R_SPT_SCHEMA.secciones[4]
    ];

    checkSecs.forEach((sec: any) => {
      this.addPageIfNeeded(30);
      this.doc.setFontSize(10);
      this.doc.setTextColor('#1e293b');
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(sec.titulo, this.margin, this.currentY);
      this.currentY += 4;

      const chkRows: string[][] = [];
      sec.preguntas.forEach((p: any) => {
        const fieldId = `${sec.titulo.replace(/\s+/g, '_')}_preg_${p.numero}`;
        const val = this.cleanValue(data[fieldId] ?? p.valor_excel, '');
        if (val) {
          chkRows.push([`${p.numero}. ${this.cleanValue(p.pregunta, '-')}`, this.cleanValue(val, '-')]);
        }
      });

      if (chkRows.length > 0) {
        autoTable(this.doc, {
          startY: this.currentY,
          head: [['Pregunta / Requisito', 'Respuesta']],
          body: chkRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          columnStyles: { 0: { cellWidth: 130 }, 1: { cellWidth: 30, halign: 'center' } },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        // @ts-ignore
        this.currentY = this.doc.lastAutoTable.finalY + 10;
      }
    });

    // --- OBSERVACIONES ---
    const obsVal = this.cleanObservations(data['Observaciones_observaciones']);
    if (obsVal) {
      this.addPageIfNeeded(20);
      this.doc.setFontSize(9);
      this.doc.setFont('helvetica', 'bold');
      this.doc.setTextColor('#1e293b');
      this.doc.text('Observaciones:', this.margin, this.currentY);
      this.currentY += 4;
      this.doc.setFont('helvetica', 'normal');
      this.doc.setFontSize(8);
      const splitText = this.doc.splitTextToSize(obsVal, this.pageWidth - this.margin * 2);
      this.doc.text(splitText, this.margin, this.currentY);
      this.currentY += splitText.length * 4 + 5;
    }
  }

  /** R. SPT with evidence photos */
  private addFormRSptWithEvidence(data: any, photoEvidence?: any[]): void {
    // First render the form data
    this.addFormRSpt(data);

    // Then add evidence photos for R_SPT if present
    const formPhotos = (photoEvidence || []).filter(p => !p.formId || p.formId === 'R_SPT');
    if (formPhotos.length > 0) {
      this.addPageIfNeeded(40);
      this.addSectionTitle('Evidencias de R. SPT');
      this.addFormPhotoGrid(formPhotos);
    }
  }

  /** Generic photo grid helper for forms with evidence */
  private addFormPhotoGrid(photos: { dataUrl?: string; caption: string; questionId?: string }[], cols: number = 3): void {
    if (!this.doc || photos.length === 0) return;

    const imgWidth = 60;
    const imgHeight = 45;
    const paddingX = 10;
    const paddingY = 8;
    const rowHeight = imgHeight + 22;

    let col = 0;
    let rowY = this.currentY;

    photos.forEach((photo, idx) => {
      if (col === cols) {
        col = 0;
        rowY += rowHeight;
        this.addPageIfNeeded(rowHeight + 10);
      }

      const x = this.margin + (col * (imgWidth + paddingX));

      if (photo.dataUrl && photo.dataUrl.startsWith('data:image/')) {
        try {
          let fmt = 'JPEG';
          if (photo.dataUrl.startsWith('data:image/png')) fmt = 'PNG';
          else if (photo.dataUrl.startsWith('data:image/webp')) fmt = 'WEBP';
          this.doc.addImage(photo.dataUrl, fmt, x, rowY, imgWidth, imgHeight);
          this.doc.setDrawColor(180, 180, 180);
          this.doc.rect(x, rowY, imgWidth, imgHeight);
        } catch (e) {
          this.doc.setFillColor(241, 245, 249);
          this.doc.rect(x, rowY, imgWidth, imgHeight, 'F');
          this.doc.setFontSize(7);
          this.doc.setTextColor('#64748b');
          this.doc.text("Error rendering image", x + 5, rowY + 22);
        }
      } else {
        this.doc.setFillColor(241, 245, 249);
        this.doc.rect(x, rowY, imgWidth, imgHeight, 'F');
        this.doc.setFontSize(7);
        this.doc.setTextColor('#64748b');
        this.doc.text("Sin imagen", x + 10, rowY + 22);
      }

      this.doc.setFontSize(7);
      this.doc.setTextColor('#64748b');
      this.doc.setFont('helvetica', 'italic');
      const capLines = this.doc.splitTextToSize(photo.caption || '', imgWidth);
      this.doc.text(capLines, x + 2, rowY + imgHeight + 3);

      col++;
    });

    this.currentY = rowY + rowHeight + 5;
  }

  // ==========================================
  // FASE 3.5 — HELPERS DE ALCANCE
  // ==========================================

  /** Sección "Módulos no aplicables" al final del PDF global */
  private addNotApplicableModulesList(modules: string[]): void {
    if (!this.doc || modules.length === 0) return;
    this.addPageIfNeeded(30 + modules.length * 6);
    this.addSectionTitle('MÓDULOS NO APLICABLES AL ALCANCE DE LA INSPECCIÓN');

    this.doc.setFontSize(9);
    this.doc.setTextColor('#64748b');
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(
      'Los siguientes módulos fueron marcados como no aplicables al alcance de la instalación inspeccionada:',
      this.margin, this.currentY
    );
    this.currentY += 6;

    modules.forEach((label, idx) => {
      this.doc!.setFontSize(8);
      this.doc!.setFont('helvetica', 'normal');
      this.doc!.setTextColor('#475569');
      this.doc!.text(`${idx + 1}. ${label}`, this.margin + 4, this.currentY);
      this.currentY += 5;
    });
    this.currentY += 8;
  }

  /** Renderizado enriquecido de formularios basados en schema (sin columna "Visita" vacía) */
  private addSchemaBasedFormRich(title: string, schema: any, data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle(title);

    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Módulo aplicable — pendiente de diligenciamiento.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    schema.secciones?.forEach((sec: any) => {
      const secRows: [string, string, string, string][] = [];
      sec.preguntas?.forEach((p: any) => {
        const flatKey = p.id;
        const flatObsKey = `${p.id}_obs`;
        const flatCierreKey = `${p.id}_cierre`;

        console.log("=== PDFENGINE RICH FIELD ===");
        console.log("- p.id:", p.id);
        console.log("- flatKey:", flatKey);
        console.log("- flatObsKey:", flatObsKey);
        console.log("- flatCierreKey:", flatCierreKey);
        console.log("- data[flatKey]:", data[flatKey]);
        console.log("- data[flatObsKey]:", data[flatObsKey]);
        console.log("- data[flatCierreKey]:", data[flatCierreKey]);

        const v1      = this.cleanValue(data[flatKey], '');
        const cierre  = this.cleanValue(data[flatCierreKey], '');
        const obs     = data[flatObsKey] ? String(data[flatObsKey]) : '';

        if (v1 || cierre || obs) {
          console.log("- ROW AGREGADO:", p.pregunta, "|", v1, "|", cierre, "| obs:", obs);
          secRows.push([
            this.cleanValue(p.pregunta, '-'),
            v1 || '-',
            cierre || '-',
            obs || '-'
          ]);
        } else {
          console.log("- ROW DESCARTADO (sin datos)");
        }
      });

      if (secRows.length > 0) {
        this.addPageIfNeeded(20);
        this.doc!.setFontSize(10);
        this.doc!.setTextColor('#1e293b');
        this.doc!.setFont('helvetica', 'bold');
        this.doc!.text(sec.titulo || '', this.margin, this.currentY);
        this.doc!.setFont('helvetica', 'normal');
        this.currentY += 4;

        autoTable(this.doc!, {
          startY: this.currentY,
          head: [['Pregunta / Requisito', 'Visita 1', 'Cierre', 'Observación']],
          body: secRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          columnStyles: {
            0: { cellWidth: 95 },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 22, halign: 'center' },
            3: { cellWidth: 40 }
          },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        console.log("=== PDFENGINE autoTable RENDERED ===");
        console.log("- section:", sec.titulo);
        console.log("- rows rendered:", secRows.length);
        console.log("- body:", secRows);
        // @ts-ignore
        this.currentY = this.doc!.lastAutoTable.finalY + 10;
      }
    });
  }

  /** Renderizado de formularios basados en schema SIN columna Cierre (para apantallamiento, piscinas, ascensores) */
  private addSchemaBasedFormNoCierre(title: string, schema: any, data: any): void {
    if (!this.doc) return;
    this.addPageIfNeeded(30);
    this.addSectionTitle(title);

    if (!data || Object.keys(data).length === 0) {
      this.doc.setFontSize(9);
      this.doc.setTextColor('#64748b');
      this.doc.text('Módulo aplicable — pendiente de diligenciamiento.', this.margin, this.currentY);
      this.currentY += 10;
      return;
    }

    // --- INFORMACIÓN DE CONTEXTO ---
    const contextFields = ['codigo_servicio', 'fecha_inspeccion', 'fecha_cierre_no_conformidades', 'observaciones', 'tablero'];
    const contextData: string[][] = [];

    const serviceCode = this.cleanValue(data['codigo_servicio'], '');
    const inspectionDate = this.cleanValue(data['fecha_inspeccion'], '');
    const closureDate = this.cleanValue(data['fecha_cierre_no_conformidades'], '');
    const tablero = this.cleanValue(data['tablero'], '');
    const observaciones = this.cleanValue(data['observaciones'], '');

    if (serviceCode) contextData.push(['Código Servicio', serviceCode]);
    if (inspectionDate) contextData.push(['Fecha de Inspección', inspectionDate]);
    if (closureDate) contextData.push(['Fecha Cierre de No Conformidades', closureDate]);
    if (tablero) contextData.push(['Tablero/Ascensor', tablero]);
    if (observaciones) contextData.push(['Observaciones Generales', observaciones]);

    if (contextData.length > 0) {
      this.addPageIfNeeded(20);
      autoTable(this.doc!, {
        startY: this.currentY,
        head: [],
        body: contextData,
        theme: 'grid',
        styles: { fontSize: 8, cellPadding: 3, textColor: '#333333', lineColor: '#cbd5e1', lineWidth: 0.1 },
        columnStyles: { 0: { fontStyle: 'bold', fillColor: '#f8fafc', cellWidth: 70 } },
        margin: { left: this.margin, right: this.margin }
      });
      // @ts-ignore
      this.currentY = this.doc!.lastAutoTable.finalY + 10;
    }

    // --- PREGUNTAS POR SECCIÓN ---
    schema.secciones?.forEach((sec: any) => {
      const secRows: [string, string, string][] = [];
      sec.preguntas?.forEach((p: any) => {
        const flatKey = p.id;
        const flatObsKey = `${p.id}_obs`;

        const v1      = this.cleanValue(data[flatKey], '');
        const obs     = data[flatObsKey] ? String(data[flatObsKey]) : '';

        if (v1 || obs) {
          secRows.push([
            this.cleanValue(p.pregunta, '-'),
            v1 || '-',
            obs || '-'
          ]);
        }
      });

      if (secRows.length > 0) {
        this.addPageIfNeeded(20);
        this.doc!.setFontSize(10);
        this.doc!.setTextColor('#1e293b');
        this.doc!.setFont('helvetica', 'bold');
        this.doc!.text(sec.titulo || '', this.margin, this.currentY);
        this.doc!.setFont('helvetica', 'normal');
        this.currentY += 4;

        autoTable(this.doc!, {
          startY: this.currentY,
          head: [['Pregunta / Requisito', 'Visita 1', 'Observación']],
          body: secRows,
          theme: 'grid',
          styles: { fontSize: 7, cellPadding: 2, textColor: '#333333' },
          columnStyles: {
            0: { cellWidth: 117 },
            1: { cellWidth: 22, halign: 'center' },
            2: { cellWidth: 40 }
          },
          headStyles: { fillColor: [71, 85, 105], textColor: 255 },
          margin: { left: this.margin, right: this.margin }
        });
        // @ts-ignore
        this.currentY = this.doc!.lastAutoTable.finalY + 10;
      }
    });
  }

  // ==========================================
  // HELPERS
  // ==========================================

  private addSectionTitle(title: string): void {
    if (!this.doc) return;
    this.addPageIfNeeded(20);
    this.doc.setFontSize(11);
    this.doc.setTextColor(this.config.primaryColor);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title.toUpperCase(), this.margin, this.currentY);
    this.currentY += 6;
  }

  private addPageIfNeeded(neededSpace: number = 25): void {
    if (!this.doc) return;
    if (this.currentY + neededSpace > this.pageHeight - 20) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  private addWatermark(): void {
    if (!this.doc) return;
    this.doc.setFontSize(60);
    this.doc.setTextColor(241, 245, 249); // slate-100
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(this.config.watermark!, this.pageWidth / 2, this.pageHeight / 2, { angle: 45, align: 'center' });
  }

  private addFooter(orgName?: string): void {
    if (!this.doc) return;
    const pageCount = this.doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(7);
      this.doc.setTextColor('#94a3b8');
      
      const footerY = this.pageHeight - 10;
      this.doc.text(`Página ${i} de ${pageCount}`, this.pageWidth / 2, footerY, { align: 'center' });
      this.doc.text(`Documento generado por ${orgName || 'Plataforma RETIE'}`, this.margin, footerY);

      if (this.config.includeTimestamp) {
        this.doc.text(new Date().toLocaleString('es-CO'), this.pageWidth - this.margin, footerY, { align: 'right' });
      }
    }
  }

  async exportToBlob(): Promise<Blob> {
    if (!this.doc) throw new Error('Documento no generado');
    return this.doc.output('blob');
  }

  async saveToFile(filename: string): Promise<void> {
    if (!this.doc) throw new Error('Documento no generado');
    this.doc.save(filename);
  }
}

export const pdfEngine = new PDFEngine();
export default PDFEngine;