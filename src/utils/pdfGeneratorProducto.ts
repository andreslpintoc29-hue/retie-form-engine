import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR PRODUCTO (REVISIÓN DE PRODUCTOS)
// ============================================================================

interface ProductoPDFData {
  schema: any;
  answers: Record<string, any>;
  photoEvidence: any[];
}

export function downloadProductoPDF({ schema, answers, photoEvidence }: ProductoPDFData) {
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
  doc.text('1. VERIFICACIÓN DE REQUISITOS DE PRODUCTO', 15, currentY);
  currentY += 3;

  // 3. Prepare rows for the questions table
  const rowsData: any[] = [];
  const preguntas = schema.secciones[0]?.preguntas || [];
  
  preguntas.forEach((p: any) => {
    const val = answers[p.id] || '—';
    const obs = answers[`${p.id}_obs`] || '—';
    rowsData.push([
      String(p.numero),
      p.pregunta || '—',
      val,
      obs
    ]);
  });

  // 4. Render Questions Table using autoTable
  (doc as any).autoTable({
    startY: currentY,
    head: [['#', 'Requisito / Ítem a Evaluar', 'Evaluación', 'Observación / Detalles']],
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
      1: { cellWidth: 95, halign: 'left' },
      2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' },
      3: { cellWidth: 55, halign: 'left' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 2 && data.cell.section === 'body') {
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

  // Get current Y position after the table
  let nextY = (doc as any).lastAutoTable?.finalY || currentY;

  // 5. Render Photo Evidence if any exist
  const formPhotos = photoEvidence || [];
  if (formPhotos.length > 0) {
    nextY += 8;
    
    // Add page break if not enough space for title and first row of photos
    if (nextY > 200) {
      doc.addPage();
      nextY = 39;
    }

    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text('2. REGISTRO FOTOGRÁFICO DE EVIDENCIAS', 15, nextY);
    nextY += 5;

    const imgWidth = 85;
    const imgHeight = 60;
    const colGap = 10;
    const rowGap = 12;
    let col = 0;

    formPhotos.forEach((photo: any) => {
      // Look up associated question number/text
      const assocPreg = preguntas.find((q: any) => q.id === photo.questionId);
      const labelText = assocPreg ? `Preg. ${assocPreg.numero}: ${assocPreg.pregunta}` : 'Evidencia registrada';
      
      const splitLabel = doc.splitTextToSize(labelText, imgWidth);
      const splitCaption = doc.splitTextToSize(photo.caption || '', imgWidth);
      const textHeight = (splitLabel.length * 3.5) + (splitCaption.length * 3) + 6;

      // Check if image + text will fit on page
      if (nextY + imgHeight + textHeight > 255) {
        doc.addPage();
        nextY = 39;
        col = 0;
      }

      const x = 15 + col * (imgWidth + colGap);

      // Render image box & image
      const imageData = photo.dataUrl || photo.foto || photo.src;
      const hasValidImage = imageData && (imageData.startsWith('data:image/') || imageData.startsWith('http') || imageData.startsWith('/'));

      if (hasValidImage) {
        try {
          let fmt = 'JPEG';
          if (imageData.startsWith('data:image/png')) fmt = 'PNG';
          else if (imageData.startsWith('data:image/webp')) fmt = 'WEBP';
          doc.addImage(imageData, fmt, x, nextY, imgWidth, imgHeight);
        } catch (e) {
          console.warn('Error rendering image:', e);
          drawPlaceholderBox(doc, x, nextY, imgWidth, imgHeight);
        }
      } else {
        drawPlaceholderBox(doc, x, nextY, imgWidth, imgHeight);
      }

      // Border around image
      doc.setDrawColor(203, 213, 225); // slate-300
      doc.setLineWidth(0.25);
      doc.rect(x, nextY, imgWidth, imgHeight);

      // Render details below image
      let labelY = nextY + imgHeight + 4;
      doc.setFont('Helvetica', 'Bold');
      doc.setFontSize(7.5);
      doc.setTextColor(51, 65, 85);
      doc.text(splitLabel, x, labelY);
      
      labelY += (splitLabel.length * 3.5);
      if (photo.caption) {
        doc.setFont('Helvetica', 'Italic');
        doc.setFontSize(6.5);
        doc.setTextColor(100, 116, 139);
        doc.text(splitCaption, x, labelY);
        labelY += (splitCaption.length * 3);
      }

      doc.setFont('Helvetica', 'Normal');
      doc.setFontSize(5.5);
      doc.setTextColor(148, 163, 184);
      doc.text(photo.fileName || '', x, labelY + 1);

      col++;
      if (col === 2) {
        col = 0;
        nextY += imgHeight + textHeight + rowGap;
      }
    });

    if (col > 0) {
      nextY += imgHeight + 20; // safe spacing
    }
  }

  // 6. Signature Block
  if (nextY > 210) {
    doc.addPage();
    nextY = 39;
  } else {
    nextY += 8;
  }
  drawSignatureBlock(doc, nextY, answers);

  // 7. Post-process to draw headers and footers on ALL pages (Multi-page decoration)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages);
  }

  // 8. Save the generated document
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Reporte_PRODUCTO_${serviceCode}.pdf`);
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
  doc.text('LISTA DE CHEQUEO CERTIFICADO DE PRODUCTO', startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-16', startX + 138, startY + 6);
  doc.text('Versión: 2', startX + 138, startY + 11);
  doc.text('Fecha: 08/08/2018', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextInfo(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;
  
  // Background box
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
  doc.text(String(answers['codigo_servicio'] || 'N/A'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_inspeccion'] || 'N/A'), startX + 138, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de cierre N.C.:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_cierre_no_conformidades'] || 'N/A'), startX + 37, y + 13);
}

function drawPlaceholderBox(doc: jsPDF, x: number, y: number, w: number, h: number) {
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(x, y, w, h, 'F');
  doc.setFontSize(7);
  doc.setTextColor('#94a3b8');
  doc.setFont('Helvetica', 'Normal');
  doc.text("Imagen no disponible", x + w/2, y + h/2, { align: 'center' });
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
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Formato F-GI-16 normalizado.', startX, y + 15.5);
}
