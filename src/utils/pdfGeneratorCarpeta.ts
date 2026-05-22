import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR CARPETA (LISTA DE CHEQUEO DOCUMENTOS CARPETA)
// ============================================================================

interface CarpetaPDFData {
  schema: any;
  answers: Record<string, any>;
}

export function downloadCarpetaPDF({ schema, answers }: CarpetaPDFData) {
  // Create document: portrait, millimeters, letter size
  const doc = new jsPDF('p', 'mm', 'letter');
  
  let currentY = 39;

  // 1. Draw Context Info Block
  drawContextBlock(doc, currentY, answers);
  currentY += 28; // Spacing after context block

  // 2. Section Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('1. DOCUMENTOS CARPETA DE INSPECCIÓN', 15, currentY);
  currentY += 3;

  // 3. Prepare rows for the questions table (Items 1 to 34)
  const rowsData: any[] = [];
  const items = schema.items || [];
  
  items.forEach((item: any) => {
    const digitalVal = item.archivo_digital ? (answers[`${item.id}__digital`] || '—') : '—';
    const rev1Val = answers[`${item.id}__revision_1`] || '—';
    const cierreVal = answers[`${item.id}__cierre`] || '—';
    
    rowsData.push([
      String(item.numero),
      item.descripcion || '—',
      digitalVal,
      rev1Val,
      cierreVal
    ]);
  });

  // 4. Render Questions Table using autoTable
  (doc as any).autoTable({
    startY: currentY,
    head: [['#', 'Documento / Ítem de Carpeta a Evaluar', 'Archivo Digital', 'Revisión 1', 'Cierre']],
    body: rowsData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 54, 93], // navy blue
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 105, halign: 'left' },
      2: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      // Color coding for Digital, Rev1, Cierre values
      if (data.cell.section === 'body') {
        const val = data.cell.raw;
        if (data.column.index === 2) {
          if (val === 'SI') data.cell.styles.textColor = [37, 99, 235]; // blue-600
          else if (val === 'NO') data.cell.styles.textColor = [100, 116, 139]; // slate-500
        } else if (data.column.index === 3) {
          if (val === 'SI') data.cell.styles.textColor = [22, 163, 74]; // green-600
          else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38]; // red-600
          else if (val === 'N/A') data.cell.styles.textColor = [217, 119, 6]; // amber-600
        } else if (data.column.index === 4) {
          if (val === 'SI') data.cell.styles.textColor = [22, 163, 74]; // green-600
          else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38]; // red-600
        }
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  // Get current Y position after the table
  let nextY = (doc as any).lastAutoTable?.finalY || currentY;

  // 5. Section 35: Otros Documentos
  nextY += 8;
  if (nextY > 200) {
    doc.addPage();
    nextY = 39;
  }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  
  const sec35Rev1 = answers['CARP-035__revision_1'] || '—';
  const sec35Cierre = answers['CARP-035__cierre'] || '—';
  doc.text(`2. OTROS DOCUMENTOS (Revisión 1: ${sec35Rev1} | Cierre: ${sec35Cierre})`, 15, nextY);
  nextY += 3;

  const otrosRows: any[] = [];
  const otrosDocs = schema.otros_documentos || [];
  
  otrosDocs.forEach((item: any) => {
    const descVal = answers[`${item.id}__desc`] || item.descripcion || '—';
    const rev1Val = answers[`${item.id}__revision_1`] || '—';
    const cierreVal = answers[`${item.id}__cierre`] || '—';
    
    // Only push if there is description or it's filled
    otrosRows.push([
      item.ordinal || '',
      descVal,
      rev1Val,
      cierreVal
    ]);
  });

  (doc as any).autoTable({
    startY: nextY,
    head: [['#', 'Descripción del Documento', 'Revisión 1', 'Cierre']],
    body: otrosRows,
    theme: 'grid',
    headStyles: {
      fillColor: [71, 85, 105], // slate-600
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 129, halign: 'left' },
      2: { cellWidth: 24, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 22, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.cell.section === 'body') {
        const val = data.cell.raw;
        if (data.column.index === 2) {
          if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
          else if (val === 'N/A') data.cell.styles.textColor = [217, 119, 6];
        } else if (data.column.index === 3) {
          if (val === 'SI') data.cell.styles.textColor = [22, 163, 74];
          else if (val === 'NO') data.cell.styles.textColor = [220, 38, 38];
        }
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  nextY = (doc as any).lastAutoTable?.finalY || nextY;

  // 6. Observations Block
  nextY += 8;
  if (nextY > 210) {
    doc.addPage();
    nextY = 39;
  }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('3. OBSERVACIONES GENERALES', 15, nextY);
  nextY += 3;

  const obsText = answers['observaciones'] || 'Sin observaciones registradas.';
  const splitObs = doc.splitTextToSize(obsText, 185.9);
  const obsHeight = Math.max(12, splitObs.length * 4.5 + 4);

  doc.setFillColor(250, 250, 250);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.25);
  doc.rect(15, nextY, 185.9, obsHeight, 'FD');

  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  doc.text(splitObs, 18, nextY + 5.5);

  nextY += obsHeight + 8;

  // 7. Signature Block
  if (nextY > 210) {
    doc.addPage();
    nextY = 39;
  }
  drawSignatureBlock(doc, nextY, answers);

  // 8. Post-process to draw headers and footers on ALL pages (Multi-page decoration)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages);
  }

  // 9. Save the generated document
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Lista_Chequeo_Carpeta_${serviceCode}.pdf`);
}

// ----------------------------------------------------------------------------
// RENDER HELPERS
// ----------------------------------------------------------------------------

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number) {
  const startY = 10;
  const startX = 15;
  const width = 185.9; // 215.9 - 30 (printable width)
  
  // Draw outer border box
  doc.setDrawColor(100, 116, 139); // slate-500
  doc.setLineWidth(0.3);
  doc.rect(startX, startY, width, 24);

  // Vertical separators
  doc.line(startX + 45, startY, startX + 45, startY + 24); // Logo separator
  doc.line(startX + 135, startY, startX + 135, startY + 24); // Title separator

  // Logo / Empresa section
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text('RYF ENERGY', startX + 22.5, startY + 9, { align: 'center' });
  doc.text('INSPECTION SAS', startX + 22.5, startY + 13, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('NIT: 901.379.529-6', startX + 22.5, startY + 18, { align: 'center' });

  // Process and Title section
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('PROCESO: GESTION DE INSPECCION', startX + 90, startY + 7, { align: 'center' });
  
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('LISTA DE CHEQUEO DOCUMENTOS CARPETA', startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-02', startX + 138, startY + 6);
  doc.text('Versión: 3', startX + 138, startY + 11);
  doc.text('Fecha: 15/01/2018', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;
  
  // Background box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, width, 24, 1.5, 1.5, 'FD');

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  // Row 1
  doc.text('Código servicio:', startX + 5, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['codigo_servicio'] || 'N/A'), startX + 32, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_inspeccion'] || 'N/A'), startX + 138, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Número dictamen:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['numero_dictamen'] || 'N/A'), startX + 32, y + 13);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Subestación:', startX + 100, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['dictamen_subestacion'] || 'N/A'), startX + 138, y + 13);

  // Row 3
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Distribución:', startX + 5, y + 20);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['dictamen_distribucion'] || 'N/A'), startX + 32, y + 20);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Uso Final:', startX + 100, y + 20);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['dictamen_uso_final'] || 'N/A'), startX + 138, y + 20);
}

function drawSignatureBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  
  // Left signature: Ingeniero Inspector
  const sigLeftX = startX + 15;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sigLeftX, y + 15, sigLeftX + 55, y + 15);
  
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const inspectorName = answers?.firma_ingeniero_inspector || '________________________';
  doc.text(inspectorName, sigLeftX + 27.5, y + 19, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Ingeniero Inspector', sigLeftX + 27.5, y + 22.5, { align: 'center' });
  
  // Right signature: Director Técnico
  const sigRightX = startX + 115;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sigRightX, y + 15, sigRightX + 55, y + 15);
  
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const directorName = answers?.firma_director_tecnico || '________________________';
  doc.text(directorName, sigRightX + 27.5, y + 19, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Director Técnico', sigRightX + 27.5, y + 22.5, { align: 'center' });
  
  // Footer text
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 32);
  doc.text('RYF ENERGY INSPECTION SAS - Formato F-GI-02 Lista Chequeo Carpeta.', startX, y + 35);
}
