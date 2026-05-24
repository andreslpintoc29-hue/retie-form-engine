import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR HOJA DISEÑO (REVISIÓN DOCUMENTAL DE DISEÑOS)
// ============================================================================

interface DisenoPDFData {
  schema: any;
  answers: Record<string, any>;
}

export async function downloadDisenoPDF({ schema, answers }: DisenoPDFData) {
  const doc = new jsPDF('p', 'mm', 'letter');
  let currentY = 39;

  // ── 1. DATOS GENERALES ──
  drawContextBlock(doc, currentY, answers);
  currentY += 28;

  // ── 2. SECCIONES DE CHEQUEO ──
  const secciones = schema.secciones || [];

  for (const seccion of secciones) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 39;
    }

    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text(seccion.titulo, 15, currentY);
    currentY += 3;

    const rows: any[] = [];
    seccion.preguntas?.forEach((p: any) => {
      const v1 = answers[`${p.id}__visita_1`] || '—';
      const cierre = answers[`${p.id}__cierre`] || '—';
      rows.push([
        p.numero,
        p.pregunta,
        p.norma,
        v1,
        cierre
      ]);
    });

    (doc as any).autoTable({
      startY: currentY,
      head: [['#', 'Ítem de Inspección', 'Norma', 'Visita 1', 'Cierre']],
      body: rows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 58, 138], // blue-900
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
        0: { cellWidth: 10, halign: 'center', fontStyle: 'bold' },
        1: { cellWidth: 105, halign: 'left' },
        2: { cellWidth: 25, halign: 'center' },
        3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' },
        4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data: any) => {
        if ((data.column.index === 3 || data.column.index === 4) && data.cell.section === 'body') {
          const val = data.cell.raw;
          if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
          else if (val === 'N/A') data.cell.styles.textColor = [217, 119, 6];
        }
      },
      margin: { left: 15, right: 15, top: 39, bottom: 20 }
    });

    currentY = (doc as any).lastAutoTable?.finalY || currentY;
    currentY += 8;
  }

  // ── 3. OBSERVACIONES ──
  if (currentY > 210) { doc.addPage(); currentY = 39; }
  
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216);
  doc.text('3. OBSERVACIONES GENERALES', 15, currentY);
  currentY += 4;

  const obs = answers['observaciones'] || 'No se presentan observaciones adicionales.';
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  const splitObs = doc.splitTextToSize(obs, 185.9);
  doc.text(splitObs, 15, currentY);
  currentY += (splitObs.length * 4) + 10;

  // ── 4. FIRMAS ──
  if (currentY > 230) { doc.addPage(); currentY = 39; }
  drawSignatureBlock(doc, currentY, answers);

  // ── 5. HEADERS EN TODAS LAS PÁGINAS ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages, schema);
  }

  // ── 6. GUARDAR ──
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Hoja_DISENO_Revision_${serviceCode}.pdf`);
}

// ============================================================================
// RENDER HELPERS
// ============================================================================

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number, schema: any) {
  const startY = 10;
  const startX = 15;
  const width = 185.9;

  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.3);
  doc.rect(startX, startY, width, 24);

  // Vertical separators
  doc.line(startX + 45, startY, startX + 45, startY + 24);
  doc.line(startX + 135, startY, startX + 135, startY + 24);

  // Logo Placeholder (Text-based)
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
  doc.text(`PROCESO: ${schema.proceso}`, startX + 90, startY + 7, { align: 'center' });
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const splitTitle = doc.splitTextToSize(schema.titulo, 85);
  doc.text(splitTitle, startX + 90, startY + 14, { align: 'center' });

  // Meta
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Hoja: ${schema.hoja}`, startX + 138, startY + 6);
  doc.text(`Código: ${schema.codigo}`, startX + 138, startY + 11);
  doc.text(`Fecha: ${schema.fecha_formato}`, startX + 138, startY + 16);
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
  doc.text(String(answers['codigo_servicio'] || 'N/A'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  let rawDate = answers['fecha_inspeccion'] || '';
  if (rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];
  doc.text(String(rawDate), startX + 135, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha cierre no conform.:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_cierre_no_conformidades'] || 'N/A'), startX + 47, y + 13);
}

function drawSignatureBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;

  // Inspector
  const sig1X = startX + 10;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sig1X, y + 20, sig1X + 60, y + 20);
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(String(answers['firma_inspector'] || 'FIRMA INSPECTOR'), sig1X + 30, y + 24, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Inspector Autorizado', sig1X + 30, y + 28, { align: 'center' });

  // Director
  const sig2X = startX + 115;
  doc.line(sig2X, y + 20, sig2X + 60, y + 20);
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(String(answers['firma_director'] || 'FIRMA DIRECTOR TÉCNICO'), sig2X + 30, y + 24, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Director Técnico', sig2X + 30, y + 28, { align: 'center' });

  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 40);
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Revisión Documental de Diseños.', startX, y + 43.5);
}
