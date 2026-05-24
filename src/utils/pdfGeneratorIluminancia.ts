import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR ILUMINANCIA (MEDIDA ILUMINANCIA)
// ============================================================================

interface IluminanciaPDFData {
  schema: any;
  answers: Record<string, any>;
}

export async function downloadIluminanciaPDF({ schema, answers }: IluminanciaPDFData) {
  // Create document: portrait, millimeters, letter size
  const doc = new jsPDF('p', 'mm', 'letter');
  
  // Iterate through all secciones (4 sheets/pages)
  for (let idx = 0; idx < schema.secciones.length; idx++) {
    if (idx > 0) {
      doc.addPage();
    }
    
    const activeSec = schema.secciones[idx];
    let currentY = 39;
    
    // 1. Draw Context Info Block for this page/sheet
    drawContextInfo(doc, currentY, activeSec, answers);
    currentY += 23; // Spacing after context block
    
    // 2. Section Title
    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(9);
    doc.setTextColor(29, 78, 216); // blue-700
    doc.text(`1. VALORES MEDIDOS DE ILUMINANCIA - ${activeSec.titulo}`, 15, currentY);
    currentY += 4;
    
    // 3. Prepare rows for the measurements table
    const rowsData: any[] = [];
    const tableInfo = activeSec.tabla_valores_medidos;
    // Prefix matches what we will use in page.tsx:
    const prefix = `Valores_medidos_${activeSec.titulo.replace(/\s+/g, '_')}`;
    
    if (tableInfo && tableInfo.filas) {
      tableInfo.filas.forEach((fila: any, fIdx: number) => {
        const getVal = (field: string) => {
          const id = `${prefix}_fila_${fIdx}_${field}`;
          return answers[id] !== undefined ? String(answers[id]) : (fila[field]?.valor_excel ?? fila[field] ?? '');
        };
        
        const sitio = getVal('sitio_principal');
        const m1 = getVal('medida_1_lux');
        const m2 = getVal('medida_2_lux');
        const m3 = getVal('medida_3_lux');
        const prom = getVal('promedio_lux');
        const cumple = getVal('cumple');
        
        // Render row if any fields contain text or numeric entries
        if (sitio || m1 || m2 || m3 || prom || cumple) {
          rowsData.push([
            sitio || '—',
            m1 || '—',
            m2 || '—',
            m3 || '—',
            prom !== '' && !isNaN(Number(prom)) ? Number(prom).toFixed(2) : (prom || '—'),
            cumple || '—'
          ]);
        }
      });
    }
    
    // 4. Render Table
    (doc as any).autoTable({
      startY: currentY,
      head: [['Medida realizada en / Sitio', 'Medida 1 (Lux)', 'Medida 2 (Lux)', 'Medida 3 (Lux)', 'Promedio (Lux)', 'Cumple']],
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
        0: { cellWidth: 70, halign: 'left' },
        1: { cellWidth: 23, halign: 'center' },
        2: { cellWidth: 23, halign: 'center' },
        3: { cellWidth: 23, halign: 'center' },
        4: { cellWidth: 23, halign: 'center', fontStyle: 'bold' },
        5: { cellWidth: 23, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data: any) => {
        if (data.column.index === 5 && data.cell.section === 'body') {
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
    
    currentY = (doc as any).lastAutoTable?.finalY || currentY;
    currentY += 8;
    
    // 5. Criterios de Medición Block
    if (activeSec.instrucciones) {
      if (currentY > 175) {
        doc.addPage();
        currentY = 39;
      }
      
      doc.setFont('Helvetica', 'Bold');
      doc.setFontSize(8.5);
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text('2. CRITERIOS DE MEDICIÓN', 15, currentY);
      currentY += 4;
      
      const textoInstr = activeSec.instrucciones.texto || '';
      const splitInstr = doc.splitTextToSize(textoInstr, 185.9);
      doc.setFont('Helvetica', 'Normal');
      doc.setFontSize(7);
      doc.setTextColor(71, 85, 105);
      doc.text(splitInstr, 15, currentY);
      
      currentY += (splitInstr.length * 3.2) + 6;
      
      // Visual resources (luxometer & distribution method diagrams)
      const visualResources = activeSec.instrucciones.recursos_visuales;
      if (visualResources && visualResources.length > 0) {
        if (currentY > 200) {
          doc.addPage();
          currentY = 39;
        }
        
        const colWidth = 88;
        const colHeight = 35;
        
        for (let rIdx = 0; rIdx < Math.min(2, visualResources.length); rIdx++) {
          const rImg = visualResources[rIdx];
          const xOffset = 15 + rIdx * (colWidth + 9.9);
          
          try {
            const base64 = await getBase64ImageFromUrl(`/${rImg.file}`);
            doc.addImage(base64, 'PNG', xOffset, currentY, colWidth, colHeight);
          } catch (e) {
            console.warn(`Could not load image ${rImg.file} for PDF:`, e);
            doc.setFillColor(241, 245, 249);
            doc.rect(xOffset, currentY, colWidth, colHeight, 'F');
            doc.setFontSize(6.5);
            doc.setTextColor(148, 163, 184);
            doc.text(rImg.descripcion, xOffset + colWidth / 2, currentY + colHeight / 2, { align: 'center', maxWidth: colWidth - 4 });
          }
        }
        currentY += colHeight + 8;
      }
    }
    
    // 6. Observaciones
    if (activeSec.observaciones) {
      if (currentY > 225) {
        doc.addPage();
        currentY = 39;
      }
      
      doc.setFont('Helvetica', 'Bold');
      doc.setFontSize(8.5);
      doc.setTextColor(29, 78, 216); // blue-700
      doc.text('3. OBSERVACIONES TÉCNICAS', 15, currentY);
      currentY += 4;
      
      const obsKey = activeSec.observaciones.campo.id;
      const obsVal = answers[obsKey] ?? '';
      
      doc.setDrawColor(203, 213, 225);
      doc.setFillColor(255, 255, 255);
      doc.setLineWidth(0.25);
      doc.roundedRect(15, currentY, 185.9, 15, 1, 1, 'FD');
      
      doc.setFont('Helvetica', 'Normal');
      doc.setFontSize(7);
      
      if (obsVal) {
        doc.setTextColor(15, 23, 42);
        const splitObs = doc.splitTextToSize(String(obsVal), 185.9 - 8);
        doc.text(splitObs, 19, currentY + 4);
      } else {
        doc.setTextColor(148, 163, 184);
        doc.text('Sin observaciones registradas para este espacio.', 19, currentY + 4);
      }
      
      currentY += 20;
    }
    
    // 7. Signature block (drawn at the end of each page)
    if (currentY > 230) {
      doc.addPage();
      currentY = 39;
    }
    drawSignatureBlock(doc, currentY, answers);
  }
  
  // 8. Post-process: draw headers & page numbers on ALL pages
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    drawHeader(doc, i, totalPages, schema.secciones[i - 1]);
  }
  
  // 9. Save generated document
  const serviceCode = answers['ILUMINANCIA_context_codigo_servicio'] || answers['codigo_servicio'] || 'DEMO';
  doc.save(`Reporte_ILUMINANCIA_${serviceCode}.pdf`);
}

// ----------------------------------------------------------------------------
// RENDER HELPERS
// ----------------------------------------------------------------------------

function drawHeader(doc: jsPDF, pageNum: number, totalPages: number, activeSec: any) {
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
  doc.setFontSize(7);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text('PROCESO: GESTION DE INSPECCION', startX + 90, startY + 7, { align: 'center' });
  
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(`MEDIDA ILUMINANCIA (${activeSec.titulo})`, startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-19', startX + 138, startY + 6);
  doc.text('Versión: 1', startX + 138, startY + 11);
  doc.text('Fecha: 01/02/2018', startX + 138, startY + 16);
  doc.text(`Página: ${pageNum} de ${totalPages}`, startX + 138, startY + 21);
}

function drawContextInfo(doc: jsPDF, y: number, activeSec: any, answers: any) {
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
  
  // Retrieve context answers dynamically, falling back to schema default values if unset
  const getContextVal = (key: string, defaultVal: string) => {
    const specificId = `${activeSec.titulo}_context_${key}`;
    return answers[specificId] !== undefined ? String(answers[specificId]) : defaultVal;
  };
  
  // Row 1
  doc.text('Código servicio:', startX + 5, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(getContextVal('codigo_servicio', 'R&F-0467-10-20'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 90, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  
  let rawDate = getContextVal('fecha_inspeccion', '2020-10-29');
  if (rawDate.includes(' ')) rawDate = rawDate.split(' ')[0];
  doc.text(String(rawDate), startX + 125, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Código del equipo:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(getContextVal('codigo_equipo', 'R&F-EL200-008'), startX + 33, y + 13);
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
  doc.text('DESARROLLADO POR DIMOTIK SOLUTIONS - Formato F-GI-19 normalizado.', startX, y + 15.5);
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
