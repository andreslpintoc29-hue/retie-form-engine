import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR R. AISLAMIENTO (RESISTENCIA DE AISLAMIENTO)
// ============================================================================

interface RAislamientoPDFData {
  schema: any;
  answers: Record<string, any>;
}

export async function downloadRAislamientoPDF({ schema, answers }: RAislamientoPDFData) {
  // Create document: portrait, millimeters, letter size
  const doc = new jsPDF('p', 'mm', 'letter');
  
  let currentY = 39;

  // 1. Draw Context Info Block
  drawContextInfo(doc, currentY, answers);
  currentY += 23; // Spacing after context block

  // 2. Section Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('1. VALORES MEDIDOS DE RESISTENCIA DE AISLAMIENTO (MΩ)', 15, currentY);
  currentY += 3;

  // 3. Prepare rows for the circuits table
  const rowsData: any[] = [];
  const secValores = schema.secciones.find((s: any) => s.titulo === 'Valores medidos (MΩ)');
  const prefix = 'Valores_medidos_(MΩ)';
  
  if (secValores && secValores.filas) {
    secValores.filas.forEach((fila: any, idx: number) => {
      const getVal = (field: string) => {
        const id = `${prefix}_fila_${idx}_${field}`;
        return answers[id] !== undefined ? String(answers[id]) : (fila[field] || '');
      };
      
      const circuito = getVal('circuito');
      const fases = getVal('fases');
      
      // Render row if it has content
      if (circuito || fases || getVal('l1_t') || getVal('cumple')) {
        rowsData.push([
          circuito || '—',
          fases || '—',
          getVal('l1_t') || '—',
          getVal('l2_t') || '—',
          getVal('l3_t') || '—',
          getVal('l1_l2') || '—',
          getVal('l1_l3') || '—',
          getVal('l2_l3') || '—',
          getVal('cumple') || '—'
        ]);
      }
    });
  }

  // 4. Render Table
  (doc as any).autoTable({
    startY: currentY,
    head: [['Medida realizada en:', 'Fases', 'L1-T', 'L2-T', 'L3-T', 'L1-L2', 'L1-L3', 'L2-L3', 'Cumple']],
    body: rowsData,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 54, 93], // dark blue
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 6.5,
      textColor: [51, 65, 85]
    },
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
        if (val === 'SI') {
          data.cell.styles.textColor = [22, 163, 74]; // green-600
        } else if (val === 'NO') {
          data.cell.styles.textColor = [220, 38, 38]; // red-600
        }
      }
    },
    margin: { left: 15, right: 15, top: 39, bottom: 20 }
  });

  let nextY = (doc as any).lastAutoTable?.finalY || currentY;

  // 5. Render Criterios de Aceptación Block (Informativo con Imagen)
  nextY += 8;
  const secCriterio = schema.secciones.find((s: any) => s.titulo === 'Criterio de Aceptación');
  if (secCriterio) {
    // Check if we need to push to next page
    if (nextY > 170) {
      doc.addPage();
      nextY = 39;
    }

    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text('2. CRITERIOS DE ACEPTACIÓN SEGÚN IEC 60364-6 Y RETIE', 15, nextY);
    nextY += 4;

    // Text box for norma description
    const textNorma = secCriterio.campos?.[0]?.valor_excel || '';
    const splitNorma = doc.splitTextToSize(textNorma, 185.9);
    
    doc.setFont('Helvetica', 'Normal');
    doc.setFontSize(7.5);
    doc.setTextColor(51, 65, 85);
    doc.text(splitNorma, 15, nextY);
    
    nextY += (splitNorma.length * 3.5) + 4;

    // Incrustar infografía R_AISLAMIENTO_IMAGEN_CRITERIO.png
    const imgWidth = 110;
    const imgHeight = 40;
    const imgX = 15 + (185.9 - imgWidth) / 2; // Center the image

    try {
      const base64 = await getBase64ImageFromUrl('/R_AISLAMIENTO_IMAGEN_CRITERIO.png');
      doc.addImage(base64, 'PNG', imgX, nextY, imgWidth, imgHeight);
    } catch (e) {
      console.warn("Could not load criteria image for PDF, drawing placeholder:", e);
      doc.setFillColor(241, 245, 249); // slate-100
      doc.rect(imgX, nextY, imgWidth, imgHeight, 'F');
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text("Tabla de Criterios de Aceptación (IEC 60364-6 / RETIE)", imgX + imgWidth / 2, nextY + imgHeight / 2, { align: 'center' });
    }

    nextY += imgHeight + 8;
  }

  // 6. Observaciones
  const secObs = schema.secciones.find((s: any) => s.titulo === 'Observaciones');
  if (secObs) {
    if (nextY > 215) {
      doc.addPage();
      nextY = 39;
    }

    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text('3. OBSERVACIONES GENERALES', 15, nextY);
    nextY += 3;

    const obsKey = `Observaciones_observaciones`;
    const obsVal = answers[obsKey] ?? '';

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFillColor(255, 255, 255);
    doc.setLineWidth(0.25);
    doc.roundedRect(15, nextY, 185.9, 18, 1, 1, 'FD');

    doc.setFont('Helvetica', 'Normal');
    doc.setFontSize(7.5);
    doc.setTextColor(15, 23, 42);

    if (obsVal) {
      const splitObs = doc.splitTextToSize(String(obsVal), 185.9 - 8);
      doc.text(splitObs, 19, nextY + 5);
    } else {
      doc.setTextColor(148, 163, 184); // slate-400
      doc.text('Sin observaciones registradas.', 19, nextY + 5);
    }

    nextY += 24;
  }

  // 7. Signature Block
  if (nextY > 230) {
    doc.addPage();
    nextY = 39;
  }
  drawSignatureBlock(doc, nextY, answers);

  // 8. Post-process: draw headers & page numbers on ALL pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages);
  }

  // 9. Save the generated document
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Reporte_R_AISLAMIENTO_${serviceCode}.pdf`);
}

// ----------------------------------------------------------------------------
// RENDER HELPERS
// ----------------------------------------------------------------------------

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number) {
  const startY = 10;
  const startX = 15;
  const width = 185.9;
  
  // Outer Border Box
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
  doc.text('MEDIDA RESISTENCIA DE AISLAMIENTO', startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-18', startX + 138, startY + 6);
  doc.text('Versión: 3', startX + 138, startY + 11);
  doc.text('Fecha: 11/03/2019', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextInfo(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;
  
  // Background Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, width, 18, 1.5, 1.5, 'FD');

  // Fields and values
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8);
  doc.setTextColor(71, 85, 105);
  
  // Row 1
  doc.text('Código servicio:', startX + 5, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['codigo_servicio'] || 'R&F-0467-10-20'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  
  // Parse date safely
  let rawDate = answers['fecha_inspeccion'] || '2020-10-29';
  if (rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];
  doc.text(String(rawDate), startX + 135, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Código del equipo:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['codigo_equipo'] || 'R&F-MI2088-01'), startX + 33, y + 13);
}

function drawSignatureBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;

  // Draw signature line on the right
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

  // Matrícula Profesional
  const mpVal = answers?.matricula_profesional || answers?.matricula || '';
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.setTextColor(71, 85, 105);
  if (mpVal) {
    doc.text(`M.P. No. ${mpVal}`, sigX + 30, y + 21, { align: 'center' });
  } else {
    doc.text('M.P. No. ________________________', sigX + 30, y + 21, { align: 'center' });
  }

  // Draw info on the left
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 12);
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Formato F-GI-18 normalizado.', startX, y + 15.5);
}

// Helper: Fetch image as dynamic base64 URL
async function getBase64ImageFromUrl(imageUrl: string): Promise<string> {
  const res = await fetch(imageUrl);
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
      resolve(reader.result as string);
    }, false);
    reader.onerror = () => {
      reject(new Error("Failed to load image"));
    };
    reader.readAsDataURL(blob);
  });
}
