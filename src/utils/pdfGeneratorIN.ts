import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR HOJA IN (ÍNDICE Y RESUMEN DEL SERVICIO)
// ============================================================================

interface INPDFData {
  schema: any;
  answers: Record<string, any>;
}

export async function downloadINPDF({ schema, answers }: INPDFData) {
  const doc = new jsPDF('p', 'mm', 'letter');
  let currentY = 39;

  // ── 1. DATOS GENERALES ──
  drawContextBlock(doc, currentY, answers);
  currentY += 28;

  // ── 2. MÓDULOS APLICABLES ──
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text('1. SELECCIÓN DE MÓDULOS APLICABLES', 15, currentY);
  currentY += 3;

  const modulosRows: any[] = [];
  (schema.modulos || []).forEach((m: any, idx: number) => {
    const aplica = answers[`${m.id}__aplica`] || '—';
    modulosRows.push([
      String(idx + 1).padStart(2, '0'),
      m.descripcion || '',
      aplica
    ]);
  });

  // Características acometida sub-rows
  const acometidaAluminio = answers['acometida_aluminio'] || '—';
  const acometidaAerea = answers['acometida_aerea'] || '—';
  const acometidaSubterranea = answers['acometida_subterranea'] || '—';

  (doc as any).autoTable({
    startY: currentY,
    head: [['#', 'Módulo / Descripción', 'Aplica']],
    body: modulosRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110], // teal-700
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 6.8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center', fontStyle: 'bold' },
      1: { cellWidth: 140, halign: 'left' },
      2: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 2 && data.cell.section === 'body') {
        const val = data.cell.raw;
        if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
        else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
        else if (val === 'N.A') data.cell.styles.textColor = [217, 119, 6];
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY;

  // Características acometida block
  currentY += 3;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.roundedRect(15, currentY, 185.9, 14, 1, 1, 'FD');

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(13, 148, 136);
  doc.text('Características Acometida:', 19, currentY + 5);

  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7);
  doc.setTextColor(51, 65, 85);
  doc.text(`Aluminio: ${acometidaAluminio}`, 65, currentY + 5);
  doc.text(`Aérea: ${acometidaAerea}`, 105, currentY + 5);
  doc.text(`Subterránea: ${acometidaSubterranea}`, 140, currentY + 5);

  // Dictamen numbers
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(13, 148, 136);
  doc.text('Dictámenes:', 19, currentY + 11);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(51, 65, 85);
  doc.text(`UF: ${answers['dictamen_uf'] || '—'}`, 50, currentY + 11);
  doc.text(`DI: ${answers['dictamen_di'] || '—'}`, 90, currentY + 11);
  doc.text(`SE: ${answers['dictamen_se'] || '—'}`, 130, currentY + 11);

  currentY += 20;

  // ── 3. RESUMEN SPT ──
  if (currentY > 210) { doc.addPage(); currentY = 39; }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text('2. RESUMEN MEDIDA RESISTENCIA DE PUESTA A TIERRA', 15, currentY);
  currentY += 3;

  const sptDesc = answers['spt_desc'] || 'PUNTO NEUTRO DE ACOMETIDA EN BT';
  const sptValor = answers['spt_valor_d'] || '—';
  const sptCumple = answers['spt_cumple'] || '—';

  (doc as any).autoTable({
    startY: currentY,
    head: [['Descripción / Punto Medido', 'Valor D (Ω)', 'Cumple']],
    body: [[sptDesc, sptValor, sptCumple]],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 110, halign: 'left' },
      1: { cellWidth: 35, halign: 'center', fontStyle: 'bold' },
      2: { cellWidth: 30, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 2 && data.cell.section === 'body') {
        const val = data.cell.raw;
        if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
        else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY += 8;

  // ── 4. RESUMEN AISLAMIENTO ──
  if (currentY > 180) { doc.addPage(); currentY = 39; }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text('3. RESUMEN MEDIDA RESISTENCIA DE AISLAMIENTO (MΩ)', 15, currentY);
  currentY += 3;

  const aislamientoRows: any[] = [];
  (schema.aislamiento || []).forEach((item: any) => {
    const lugar = answers[`${item.id}__lugar`] || item.lugar || '—';
    const fases = item.fases || '—';
    const getV = (k: string) => answers[`${item.id}__${k}`] || '—';
    const cumple = getV('cumple');

    aislamientoRows.push([
      lugar,
      fases,
      getV('l1_t'), getV('l2_t'), getV('l3_t'),
      getV('l1_l2'), getV('l1_l3'), getV('l2_l3'),
      cumple
    ]);
  });

  (doc as any).autoTable({
    startY: currentY,
    head: [['Medida en', 'Fases', 'L1-T', 'L2-T', 'L3-T', 'L1-L2', 'L1-L3', 'L2-L3', 'Cumple']],
    body: aislamientoRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 6.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { fontSize: 6, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 50, halign: 'left' },
      1: { cellWidth: 12, halign: 'center' },
      2: { cellWidth: 16, halign: 'center' },
      3: { cellWidth: 16, halign: 'center' },
      4: { cellWidth: 16, halign: 'center' },
      5: { cellWidth: 16, halign: 'center' },
      6: { cellWidth: 16, halign: 'center' },
      7: { cellWidth: 16, halign: 'center' },
      8: { cellWidth: 16, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 8 && data.cell.section === 'body') {
        const val = data.cell.raw;
        if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
        else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY += 8;

  // ── 5. RESUMEN ILUMINANCIA ──
  if (currentY > 180) { doc.addPage(); currentY = 39; }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text('4. RESUMEN MEDIDA DE ILUMINANCIA (lx)', 15, currentY);
  currentY += 3;

  const iluminanciaRows: any[] = [];
  (schema.iluminancia || []).forEach((item: any) => {
    const lugar = answers[`${item.id}__lugar`] || item.lugar || '—';
    const m1 = parseFloat(answers[`${item.id}__m1`] || '0');
    const m2 = parseFloat(answers[`${item.id}__m2`] || '0');
    const m3 = parseFloat(answers[`${item.id}__m3`] || '0');
    let count = 0, sum = 0;
    if (m1 > 0) { count++; sum += m1; }
    if (m2 > 0) { count++; sum += m2; }
    if (m3 > 0) { count++; sum += m3; }
    const prom = count > 0 ? (sum / count).toFixed(2) : '0.00';
    const cumple = answers[`${item.id}__cumple`] || '—';

    iluminanciaRows.push([
      lugar,
      m1 > 0 ? String(m1) : '—',
      m2 > 0 ? String(m2) : '—',
      m3 > 0 ? String(m3) : '—',
      `${prom} lx`,
      cumple
    ]);
  });

  (doc as any).autoTable({
    startY: currentY,
    head: [['Lugar de Medida', 'Medida 1', 'Medida 2', 'Medida 3', 'Promedio', 'Cumple']],
    body: iluminanciaRows,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 7,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { fontSize: 6.5, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 55, halign: 'left' },
      1: { cellWidth: 24, halign: 'center' },
      2: { cellWidth: 24, halign: 'center' },
      3: { cellWidth: 24, halign: 'center' },
      4: { cellWidth: 28, halign: 'center', fontStyle: 'bold', textColor: [13, 148, 136] },
      5: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 5 && data.cell.section === 'body') {
        const val = data.cell.raw;
        if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
        else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY += 8;

  // ── 6. EQUIPOS ──
  if (currentY > 230) { doc.addPage(); currentY = 39; }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(13, 148, 136);
  doc.text('5. CÓDIGO DE EQUIPOS UTILIZADOS', 15, currentY);
  currentY += 3;

  (doc as any).autoTable({
    startY: currentY,
    head: [['Equipo', 'Código']],
    body: [
      ['Tierra (SPT)', answers['equipo_tierra'] || '—'],
      ['Aislamiento', answers['equipo_aislamiento'] || '—'],
      ['Iluminancia (Luxómetro)', answers['equipo_iluminancia'] || '—'],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [15, 118, 110],
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: { fontSize: 7, textColor: [51, 65, 85] },
    columnStyles: {
      0: { cellWidth: 80, halign: 'left' },
      1: { cellWidth: 80, halign: 'center', fontStyle: 'bold' }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  currentY = (doc as any).lastAutoTable?.finalY || currentY;
  currentY += 10;

  // ── 7. FIRMA ──
  if (currentY > 230) { doc.addPage(); currentY = 39; }
  drawSignatureBlock(doc, currentY, answers);

  // ── 8. HEADERS EN TODAS LAS PÁGINAS ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages);
  }

  // ── 9. GUARDAR ──
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Hoja_IN_Indice_${serviceCode}.pdf`);
}

// ============================================================================
// RENDER HELPERS
// ============================================================================

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number) {
  const startY = 10;
  const startX = 15;
  const width = 185.9;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.rect(startX, startY, width, 24);

  // Vertical separators
  doc.line(startX + 45, startY, startX + 45, startY + 24);
  doc.line(startX + 135, startY, startX + 135, startY + 24);

  // Logo
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59);
  doc.text('DESARROLLADO POR', startX + 22.5, startY + 9, { align: 'center' });
  doc.text('DIMOTIK SOLUTIONS', startX + 22.5, startY + 13, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('NIT: 901324134', startX + 22.5, startY + 18, { align: 'center' });

  // Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('PROCESO: GESTION DE INSPECCION', startX + 90, startY + 7, { align: 'center' });
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('INFORMACIÓN GENERAL / ÍNDICE Y', startX + 90, startY + 14, { align: 'center' });
  doc.text('RESUMEN DEL SERVICIO', startX + 90, startY + 19, { align: 'center' });

  // Meta
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Hoja: IN', startX + 138, startY + 6);
  doc.text('Tipo: Índice/Resumen', startX + 138, startY + 11);
  doc.text('Fecha: 11/03/2019', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;

  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, width, 22, 1.5, 1.5, 'FD');

  // Row 1
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  doc.text('Código servicio:', startX + 5, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['codigo_servicio'] || 'R&F-0467-10-20'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  let rawDate = answers['fecha_inspeccion'] || '2020-10-29';
  if (rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];
  doc.text(String(rawDate), startX + 135, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha cierre no conform.:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_cierre_no_conformidades'] || 'N/A'), startX + 47, y + 13);

  // Row 3
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Dictámenes:', startX + 5, y + 19);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(`UF: ${answers['dictamen_uf'] || '—'}  |  DI: ${answers['dictamen_di'] || '—'}  |  SE: ${answers['dictamen_se'] || '—'}`, startX + 30, y + 19);
}

function drawSignatureBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;

  const sigX = startX + 115;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sigX, y + 10, sigX + 60, y + 10);

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Firma del Inspector Autorizado', sigX + 30, y + 14, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Dictamen de Inspección RETIE', sigX + 30, y + 17.5, { align: 'center' });

  const mpVal = answers?.matricula_profesional || answers?.matricula || '';
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  if (mpVal) {
    doc.text(`M.P. No. ${mpVal}`, sigX + 30, y + 21, { align: 'center' });
  } else {
    doc.text('M.P. No. ________________________', sigX + 30, y + 21, { align: 'center' });
  }

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 12);
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Hoja IN Índice y Resumen.', startX, y + 15.5);
}
