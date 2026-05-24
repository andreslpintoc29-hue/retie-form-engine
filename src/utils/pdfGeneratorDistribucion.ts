import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR DISTRIBUCIÓN (LISTA DE CHEQUEO DISTRIBUCIÓN MULTIPUNTO)
// ============================================================================

interface DistribucionPDFData {
  schema: any;
  answers: Record<string, any>;
}

const PUNTOS = [
  { id: 'punto_1', label: 'P1' },
  { id: 'punto_2', label: 'P2' },
  { id: 'punto_3', label: 'P3' },
  { id: 'punto_4', label: 'P4' },
  { id: 'punto_5', label: 'P5' },
];

export function downloadDistribucionPDF({ schema, answers }: DistribucionPDFData) {
  const doc = new jsPDF('p', 'mm', 'letter');
  
  let currentY = 39;

  // 1. Draw Context Info Block
  drawContextBlock(doc, currentY, answers);
  currentY += 25; // Spacing after context block

  // 2. Section Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(109, 40, 217); // purple-700
  doc.text('1. VERIFICACIÓN DE REQUISITOS DE DISTRIBUCIÓN (MULTIPUNTO)', 15, currentY);
  currentY += 3;

  // 3. Prepare rows for the questions table
  const rowsData: any[] = [];
  const secciones = schema.secciones || [];
  
  secciones.forEach((sec: any) => {
    if (sec.id === 'OBSERVACIONES') return; // Skip observations section as it goes in its own box
    
    // Push section header row
    rowsData.push([
      'SECTION',
      sec.titulo || '',
      '', '', '', '', '', ''
    ]);

    (sec.preguntas || []).forEach((p: any) => {
      // Collect answers for P1 to P5
      const pAnswers = PUNTOS.map(pt => {
        const v1 = answers[`${p.id}__${pt.id}__visita_1`] || '—';
        const cierre = answers[`${p.id}__${pt.id}__cierre`] || '—';
        if (v1 === 'NO' && cierre !== '—') {
          return `${v1}/${cierre}`;
        }
        return v1;
      });

      // Collect specific observations for NO answers across all points
      const obsArr: string[] = [];
      PUNTOS.forEach(pt => {
        const obsVal = answers[`${p.id}__${pt.id}__visita_1__obs`];
        if (obsVal) {
          obsArr.push(`${pt.label}: ${obsVal}`);
        }
      });
      const consolidatedObs = obsArr.join(' | ') || '—';

      rowsData.push([
        String(p.numero),
        p.texto || '—',
        pAnswers[0],
        pAnswers[1],
        pAnswers[2],
        pAnswers[3],
        pAnswers[4],
        consolidatedObs
      ]);
    });
  });

  // 4. Render Questions Table using autoTable
  (doc as any).autoTable({
    startY: currentY,
    head: [['#', 'Requisito de Distribución a Evaluar', 'P1', 'P2', 'P3', 'P4', 'P5', 'Observación / Detalle N.C.']],
    body: rowsData,
    theme: 'grid',
    headStyles: {
      fillColor: [88, 28, 135], // purple-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 8, halign: 'center' },
      1: { cellWidth: 80, halign: 'left' },
      2: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
      4: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
      5: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
      6: { cellWidth: 13, halign: 'center', fontStyle: 'bold' },
      7: { cellWidth: 32, halign: 'left' }
    },
    didParseCell: (data: any) => {
      if (data.cell.section === 'body') {
        const rawRow = data.row.raw;
        
        // Style Section Header rows
        if (rawRow[0] === 'SECTION') {
          data.cell.styles.fillColor = [243, 232, 255]; // purple-100
          data.cell.styles.textColor = [88, 28, 135]; // purple-800
          data.cell.styles.fontStyle = 'bold';
          data.cell.styles.fontSize = 7;
          
          // Span the description cell across all columns (except index 0 which we blank out)
          if (data.column.index === 1) {
            data.cell.colSpan = 7;
          }
        } else {
          // Color code evaluation answers
          if (data.column.index >= 2 && data.column.index <= 6) {
            const val = data.cell.raw;
            if (val === 'SI') {
              data.cell.styles.textColor = [22, 163, 74]; // green-600
            } else if (val.startsWith('NO')) {
              data.cell.styles.textColor = [220, 38, 38]; // red-600
            } else if (val === 'N.A') {
              data.cell.styles.textColor = [217, 119, 6]; // amber-600
            }
          }
        }
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  let nextY = (doc as any).lastAutoTable?.finalY || currentY;

  // 5. Special Distances Table (from DIST-026)
  nextY += 8;
  if (nextY > 200) {
    doc.addPage();
    nextY = 39;
  }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8.5);
  doc.setTextColor(109, 40, 217); // purple-700
  doc.text('2. MEDIDAS DE DISTANCIAS DE SEGURIDAD REGISTRADAS (m) - ÍTEM 19', 15, nextY);
  nextY += 3;

  const distanceRows: any[] = [];
  const distFields = [
    { id: 'dist_a', label: 'a: Suelo (Residencial)' },
    { id: 'dist_b', label: 'b: Suelo (Vía Pública)' },
    { id: 'dist_c', label: 'c: Horizontal Edific.' },
    { id: 'dist_d', label: 'd: Cruce Conductores' },
    { id: 'dist_d1', label: 'd1: En Retenidas' },
    { id: 'dist_e', label: 'e: A Arborización' },
  ];

  distFields.forEach(f => {
    const pValues = PUNTOS.map(pt => {
      const v = answers[`DIST-026__${pt.id.replace('punto_', 'punto_')}__${f.id}`];
      return v !== undefined && v !== null && v !== '' ? `${v} m` : '—';
    });
    distanceRows.push([
      f.label,
      pValues[0],
      pValues[1],
      pValues[2],
      pValues[3],
      pValues[4]
    ]);
  });

  (doc as any).autoTable({
    startY: nextY,
    head: [['Distancia Evaluada', 'P1', 'P2', 'P3', 'P4', 'P5']],
    body: distanceRows,
    theme: 'grid',
    headStyles: {
      fillColor: [109, 40, 217], // purple-700
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 75, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  nextY = (doc as any).lastAutoTable?.finalY || nextY;

  // 6. Burial Depth Table (from DIST-047)
  nextY += 8;
  if (nextY > 200) {
    doc.addPage();
    nextY = 39;
  }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8.5);
  doc.setTextColor(30, 64, 175); // blue-800
  doc.text('3. MEDIDAS DE PROFUNDIDAD DE ENTERRAMIENTO REGISTRADAS (m) - ÍTEM 47', 15, nextY);
  nextY += 3;

  const depthRows: any[] = [
    [
      'Profundidad medida (m)',
      ...PUNTOS.map(pt => {
        const v = answers[`DIST-047__${pt.id}__profundidad_medida`];
        return v !== undefined && v !== null && v !== '' ? `${v} m` : '—';
      })
    ]
  ];

  (doc as any).autoTable({
    startY: nextY,
    head: [['Medida Evaluada', 'P1', 'P2', 'P3', 'P4', 'P5']],
    body: depthRows,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 64, 175], // blue-800
      textColor: [255, 255, 255],
      fontSize: 7.5,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 7,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 75, halign: 'left', fontStyle: 'bold' },
      1: { cellWidth: 22, halign: 'center' },
      2: { cellWidth: 22, halign: 'center' },
      3: { cellWidth: 22, halign: 'center' },
      4: { cellWidth: 22, halign: 'center' },
      5: { cellWidth: 22, halign: 'center' }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  nextY = (doc as any).lastAutoTable?.finalY || nextY;

  // 7. Observations Block
  nextY += 8;
  if (nextY > 215) {
    doc.addPage();
    nextY = 39;
  }

  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text('4. OBSERVACIONES GENERALES', 15, nextY);
  nextY += 3;

  const obsText = answers['DIST-OBS'] || 'Sin observaciones registradas.';
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
  doc.save(`Lista_Chequeo_Distribucion_${serviceCode}.pdf`);
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
  doc.text('DESARROLLADO POR', startX + 22.5, startY + 9, { align: 'center' });
  doc.text('DIMOTIK SOLUTIONS', startX + 22.5, startY + 13, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('NIT: 901324134', startX + 22.5, startY + 18, { align: 'center' });

  // Process and Title section
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('PROCESO: GESTION DE INSPECCION', startX + 90, startY + 7, { align: 'center' });
  
  doc.setFontSize(9.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text('LISTA DE CHEQUEO DISTRIBUCIÓN', startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-11', startX + 138, startY + 6);
  doc.text('Versión: 2', startX + 138, startY + 11);
  doc.text('Fecha: 01/08/2018', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;
  
  // Background box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, width, 18, 1.5, 1.5, 'FD');

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
  doc.text('Cierre de no conformidades:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_cierre_no_conformidades'] || 'N/A'), startX + 44, y + 13);
}

function drawSignatureBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  
  // Left signature: Inspector
  const sigLeftX = startX + 15;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sigLeftX, y + 15, sigLeftX + 55, y + 15);
  
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const inspectorName = answers?.firma_inspector || '________________________';
  doc.text(inspectorName, sigLeftX + 27.5, y + 19, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Inspector Autorizado', sigLeftX + 27.5, y + 22.5, { align: 'center' });
  
  // Right signature: Director Técnico
  const sigRightX = startX + 115;
  doc.setDrawColor(100, 116, 139);
  doc.setLineWidth(0.5);
  doc.line(sigRightX, y + 15, sigRightX + 55, y + 15);
  
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  const directorName = answers?.firma_director || '________________________';
  doc.text(directorName, sigRightX + 27.5, y + 19, { align: 'center' });
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.text('Director Técnico', sigRightX + 27.5, y + 22.5, { align: 'center' });
  
  // Footer text
  doc.setFontSize(6);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 32);
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Formato F-GI-11 Lista Chequeo Distribución.', startX, y + 35);
}
