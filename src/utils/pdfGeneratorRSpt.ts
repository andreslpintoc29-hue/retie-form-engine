import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

// ============================================================================
// PDF GENERATOR FOR R.SPT (RESISTENCIA DE PUESTA A TIERRA)
// ============================================================================

interface RSptPDFData {
  schema: any;
  answers: Record<string, any>;
}

export function downloadRSptPDF({ schema, answers }: RSptPDFData) {
  // Create document: portrait, millimeters, letter size
  const doc = new jsPDF('p', 'mm', 'letter');
  
  // Total pages is fixed at 2
  const totalPages = 2;

  // --- PAGE 1 ---
  drawHeader(doc, 1, totalPages);
  
  let currentY = 39;

  // Context Info
  drawContextInfo(doc, currentY, answers);
  currentY += 23; // spacing

  // Definitions and Method Block
  drawMethodBlock(doc, currentY, answers);
  currentY += 45; // spacing

  // Title of Terreno Regular Table
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('2. VALORES MEDIDOS - TERRENO REGULAR', 15, currentY);
  currentY += 3;

  // Render Terreno Regular Table
  drawTerrenoRegularTable(doc, currentY, schema, answers);

  // --- PAGE 2 ---
  doc.addPage();
  drawHeader(doc, 2, totalPages);
  
  currentY = 39;

  // Title of Terreno Irregular
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('3. VALORES MEDIDOS - TERRENO IRREGULAR', 15, currentY);
  currentY += 4;

  // Render Terreno Irregular 2x2 Grid Tables
  const endYIrregular = drawTerrenoIrregularTables(doc, currentY, schema, answers);
  currentY = endYIrregular + 5;

  // Analysis block
  drawAnalysisBlock(doc, currentY, answers);
  currentY += 23;

  // Combined Checklists Section
  drawChecklists(doc, currentY, schema, answers);
  
  // Get final Y of the checklist table
  const finalTableY = (doc as any).lastAutoTable?.finalY || (currentY + 65);
  currentY = finalTableY + 8;

  // Observaciones
  drawObservaciones(doc, currentY, answers);
  currentY += 25;

  // Signature and Date block
  drawSignatureBlock(doc, currentY);

  // Save the generated document
  const serviceCode = answers['codigo_servicio'] || 'DEMO';
  doc.save(`Reporte_R_SPT_${serviceCode}.pdf`);
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
  doc.text('MEDIDA RESISTENCIA DE PUESTA A TIERRA', startX + 90, startY + 15, { align: 'center' });

  // Meta section (Code, Version, Date, Page)
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text('Código: F-GI-17', startX + 138, startY + 6);
  doc.text('Versión: 1', startX + 138, startY + 11);
  doc.text('Fecha: 30/01/2018', startX + 138, startY + 16);
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
  doc.text(String(answers['codigo_servicio'] || 'R&F-0467-10-20'), startX + 33, y + 6);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Fecha de la inspección:', startX + 100, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['fecha_inspeccion'] || '2020-10-29'), startX + 135, y + 6);

  // Row 2
  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Código del equipo:', startX + 5, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['codigo_equipo'] || 'R&F-MI2088-01'), startX + 33, y + 13);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(71, 85, 105);
  doc.text('Método utilizado:', startX + 100, y + 13);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(15, 23, 42);
  doc.text(String(answers['metodo_utilizado'] || 'CAIDA DE TENSION'), startX + 135, y + 13);
}

function drawMethodBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;

  // Section Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('1. DEFINICIONES DEL MÉTODO UTILIZADO', startX, y);

  // Left Column: Definitions
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85); // slate-700
  
  const textD = "d: Es la distancia de ubicación del electrodo (estaca) auxiliar de corriente, la cual debe ser 6,5 veces la mayor dimensión de la puesta a tierra a medir.";
  const textX = "x: Es la distancia del electrodo (estaca) auxiliar de tensión.";

  const splitD = doc.splitTextToSize(textD, 80);
  const splitX = doc.splitTextToSize(textX, 80);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Distancia "d":', startX, y + 6);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(71, 85, 105);
  doc.text(splitD, startX, y + 9.5);

  doc.setFont('Helvetica', 'Bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Distancia "x":', startX, y + 22);
  doc.setFont('Helvetica', 'Normal');
  doc.setTextColor(71, 85, 105);
  doc.text(splitX, startX, y + 25.5);

  // Right Column: Diagram Vectorial
  drawMethodDiagram(doc, startX + 85, y + 3, 100.9, 36);
}

function drawMethodDiagram(doc: jsPDF, x: number, y: number, width: number, height: number) {
  // Container Box with light background
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.roundedRect(x, y, width, height, 2, 2, 'FD');

  // Ground Line
  doc.setDrawColor(100, 116, 139); // slate-500
  doc.setLineWidth(0.8);
  doc.line(x + 10, y + 24, x + width - 10, y + 24);

  // Earth diagonal hatchings
  doc.setLineWidth(0.25);
  doc.setDrawColor(203, 213, 225); // slate-300
  for (let i = x + 15; i < x + width - 15; i += 15) {
    doc.line(i, y + 24, i - 2, y + 28);
    doc.line(i + 3, y + 24, i + 1, y + 28);
  }

  // Instrument (Telurómetro) Box
  doc.setFillColor(30, 41, 59); // slate-800
  doc.setDrawColor(59, 130, 246); // blue-500
  doc.setLineWidth(0.5);
  doc.roundedRect(x + width / 2 - 20, y + 4, 40, 11, 1, 1, 'FD');
  doc.setTextColor(96, 165, 250); // blue-400
  doc.setFontSize(6.5);
  doc.setFont('Helvetica', 'Bold');
  doc.text('TELURÓMETRO', x + width / 2, y + 8, { align: 'center' });

  // Instrument small lights
  doc.setFillColor(239, 68, 68); // red-500
  doc.circle(x + width / 2 - 8, y + 11.5, 0.6, 'F');
  doc.setFillColor(234, 179, 8); // yellow-500
  doc.circle(x + width / 2, y + 11.5, 0.6, 'F');
  doc.setFillColor(34, 197, 94); // green-500
  doc.circle(x + width / 2 + 8, y + 11.5, 0.6, 'F');

  // Electrode SPT (Bajo Prueba)
  doc.setDrawColor(245, 158, 11); // amber-500
  doc.setLineWidth(1.2);
  doc.line(x + 20, y + 20, x + 20, y + 31); // Rod
  doc.line(x + 17, y + 20, x + 23, y + 20); // Top T-bar
  doc.setTextColor(217, 119, 6); // amber-600
  doc.setFontSize(5.5);
  doc.text('SPT (Prueba)', x + 20, y + 34, { align: 'center' });

  // Electrode P (Tensión)
  doc.setDrawColor(168, 85, 247); // purple-500
  doc.setLineWidth(0.9);
  doc.line(x + width * 0.58, y + 22, x + width * 0.58, y + 30); // Rod
  doc.line(x + width * 0.58 - 2, y + 22, x + width * 0.58 + 2, y + 22); // Top
  doc.setTextColor(147, 51, 234); // purple-600
  doc.text('Estaca P (V)', x + width * 0.58, y + 33, { align: 'center' });

  // Electrode C (Corriente)
  doc.setDrawColor(239, 68, 68); // red-500
  doc.setLineWidth(0.9);
  doc.line(x + width - 20, y + 22, x + width - 20, y + 30); // Rod
  doc.line(x + width - 22, y + 22, x + width - 18, y + 22); // Top
  doc.setTextColor(220, 38, 38); // red-600
  doc.text('Estaca C (I)', x + width - 20, y + 33, { align: 'center' });

  // Reset dashes before drawing wires
  doc.setLineDashPattern([], 0);
  doc.setLineWidth(0.35);

  // SPT to Telurómetro Wire (dashed amber)
  doc.setDrawColor(245, 158, 11);
  doc.setLineDashPattern([1, 1], 0);
  doc.line(x + 20, y + 20, x + 20, y + 9);
  doc.line(x + 20, y + 9, x + width / 2 - 20, y + 9);
  
  // P to Telurómetro Wire (purple)
  doc.setDrawColor(168, 85, 247);
  doc.setLineDashPattern([], 0);
  doc.line(x + width * 0.58, y + 22, x + width * 0.58, y + 13);
  doc.line(x + width * 0.58, y + 13, x + width / 2, y + 13);
  doc.line(x + width / 2, y + 13, x + width / 2, y + 15);

  // C to Telurómetro Wire (red)
  doc.setDrawColor(239, 68, 68);
  doc.line(x + width - 20, y + 22, x + width - 20, y + 7);
  doc.line(x + width - 20, y + 7, x + width / 2 + 20, y + 7);

  // Distances indicators
  doc.setLineWidth(0.2);
  doc.setDrawColor(147, 51, 234); // purple
  doc.line(x + 20, y + 28, x + width * 0.58, y + 28);
  doc.setFontSize(5);
  doc.setTextColor(147, 51, 234);
  doc.text('x = 61.8% · d', x + (20 + width * 0.58) / 2, y + 27.2, { align: 'center' });

  doc.setDrawColor(220, 38, 38); // red
  doc.line(x + 20, y + 2.5, x + width - 20, y + 2.5);
  doc.setTextColor(220, 38, 38);
  doc.text('Distancia d', x + (20 + width - 20) / 2, y + 2.0, { align: 'center' });
  
  // Reset dash pattern and line width
  doc.setLineDashPattern([], 0);
}

function drawTerrenoRegularTable(doc: jsPDF, y: number, schema: any, answers: any) {
  const rowsData: any[] = [];
  const secRegular = schema.secciones.find((s: any) => s.titulo === 'Valores medidos - TERRENO REGULAR');
  
  if (secRegular) {
    const titleKey = secRegular.titulo.replace(/\s+/g, '_');
    secRegular.filas.forEach((fila: any, idx: number) => {
      const getRowValue = (field: string) => {
        const fieldId = `${titleKey}_fila_${idx}_${field.replace(/\./g, '_')}`;
        return answers[fieldId] !== undefined ? String(answers[fieldId]) : (fila[field] || '');
      };
      
      rowsData.push([
        getRowValue('spt_de') || '—',
        getRowValue('distancia_d_m') || '—',
        getRowValue('distancia_x_61_8') || '—',
        getRowValue('valor_medido_61_8') || '—',
        getRowValue('distancia_x_52') || '—',
        getRowValue('valor_medido_52') || '—',
        getRowValue('distancia_x_72') || '—',
        getRowValue('valor_medido_72') || '—',
        getRowValue('cumple') || '—',
      ]);
    });
  }

  (doc as any).autoTable({
    startY: y,
    head: [['SPT de', 'Distancia d (m)', 'Dist. x 61.8%', 'Valor 61.8% (Ω)', 'Dist. x 52%', 'Valor 52% (Ω)', 'Dist. x 72%', 'Valor 72% (Ω)', 'Cumple']],
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
      fontSize: 6.8,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 55 },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' },
      5: { halign: 'center' },
      6: { halign: 'center' },
      7: { halign: 'center' },
      8: { halign: 'center', fontStyle: 'bold' }
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
    margin: { left: 15, right: 15 }
  });
}

function drawTerrenoIrregularTables(doc: jsPDF, y: number, schema: any, answers: any): number {
  const secIrregular = schema.secciones.find((s: any) => s.titulo === 'TERRENO IRREGULAR');
  if (!secIrregular) return y;
  
  const titleKey = secIrregular.titulo.replace(/\s+/g, '_');
  
  const getGroupData = (groupId: number) => {
    const group = secIrregular.grupos.find((g: any) => g.id === groupId);
    if (!group) return [];
    
    return group.filas.map((fila: any, idx: number) => {
      const getVal = (field: string) => {
        const fieldId = `${titleKey}_g_${groupId}_fila_${idx}_${field}`;
        return answers[fieldId] !== undefined ? String(answers[fieldId]) : (fila[field] || '');
      };
      return [
        getVal('porcentaje_d') || '—',
        getVal('distancia_d_m') || '—',
        getVal('resistencia_ohm') || '—'
      ];
    });
  };

  const renderGroupTable = (data: any[], x: number, groupY: number, width: number, title: string) => {
    // Title above table
    doc.setFont('Helvetica', 'Bold');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    doc.text(title, x, groupY - 1.5);
    
    (doc as any).autoTable({
      startY: groupY,
      head: [['Porcentaje de d', 'Distancia d (m)', 'Resistencia (Ω)']],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 85, 105], // slate-600
        textColor: [255, 255, 255],
        fontSize: 6.2,
        fontStyle: 'bold',
        halign: 'center',
        valign: 'middle'
      },
      bodyStyles: {
        fontSize: 6.0,
        textColor: [51, 65, 85]
      },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 26, halign: 'center' },
        2: { cellWidth: 26, halign: 'center' }
      },
      margin: { left: x },
      tableWidth: width,
      styles: { cellPadding: 1.2 }
    });
  };

  const tableWidth = 90;
  const colGap = 5.9;
  const tableHeight = 28; // estimate table height
  
  // Row 1 of grid: Groups 1 & 2
  const g1Data = getGroupData(1);
  renderGroupTable(g1Data, 15, y + 2, tableWidth, 'Grupo 1');

  const g2Data = getGroupData(2);
  renderGroupTable(g2Data, 15 + tableWidth + colGap, y + 2, tableWidth, 'Grupo 2');

  // Row 2 of grid: Groups 3 & 4
  const g3Data = getGroupData(3);
  renderGroupTable(g3Data, 15, y + 2 + tableHeight + 4, tableWidth, 'Grupo 3');

  const g4Data = getGroupData(4);
  renderGroupTable(g4Data, 15 + tableWidth + colGap, y + 2 + tableHeight + 4, tableWidth, 'Grupo 4');

  // Return the bottom boundary Y
  return y + 2 + (tableHeight * 2) + 8;
}

function drawAnalysisBlock(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;

  // Background Box
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y, width, 18, 1, 1, 'FD');

  // Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(8);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('Análisis de Resistencia Constante (Potencial Plano)', startX + 4, y + 5);

  // Description
  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const descText = "Se puede observar si existe una zona de potencial plano, equivalente a un valor constante de resistencia el cual es la resistencia del terreno.";
  doc.text(descText, startX + 4, y + 9);

  // Constant resistance value
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('Valor resistencia constante:', startX + 4, y + 14);
  doc.setFont('Helvetica', 'Normal');
  
  const constResVal = answers['TERRENO_IRREGULAR_grafica_valor_resistencia_constante'] ?? '';
  doc.text(constResVal ? `${constResVal} Ω` : '—', startX + 41, y + 14);

  // Compliance
  doc.setFont('Helvetica', 'Bold');
  doc.text('¿Cumple con la zona de potencial plano?:', startX + 100, y + 14);
  
  const cumpleVal = answers['TERRENO_IRREGULAR_grafica_cumple'] ?? '';
  if (cumpleVal === 'SI') {
    doc.setTextColor(22, 163, 74); // green-600
  } else if (cumpleVal === 'NO') {
    doc.setTextColor(220, 38, 38); // red-600
  } else {
    doc.setTextColor(100, 116, 139);
  }
  doc.text(String(cumpleVal || '—'), startX + 155, y + 14);
}

function drawChecklists(doc: jsPDF, y: number, schema: any, answers: any) {
  const startX = 15;
  const rows: any[] = [];
  
  // Section 1: Las pruebas...
  const sec1 = schema.secciones.find((s: any) => s.titulo.startsWith('Las pruebas que deben realizarse'));
  if (sec1) {
    const secTitleKey = sec1.titulo.replace(/\s+/g, '_');
    sec1.preguntas.forEach((p: any) => {
      const fieldId = `${secTitleKey}_preg_${p.numero}`;
      const value = answers[fieldId] !== undefined ? String(answers[fieldId]) : (p.valor_excel || '');
      rows.push([
        String(p.numero),
        p.pregunta,
        value
      ]);
    });
  }

  // Section 2: La inspección...
  const sec2 = schema.secciones.find((s: any) => s.titulo.startsWith('La inspeccion del SPT debe documentar'));
  if (sec2) {
    const secTitleKey = sec2.titulo.replace(/\s+/g, '_');
    sec2.preguntas.forEach((p: any) => {
      const fieldId = `${secTitleKey}_preg_${p.numero}`;
      const value = answers[fieldId] !== undefined ? String(answers[fieldId]) : (p.valor_excel || '');
      rows.push([
        String(p.numero),
        p.pregunta,
        value
      ]);
    });
  }

  // Draw Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('4. REQUISITOS DE INSPECCIÓN Y PRUEBAS RETIE', startX, y);

  (doc as any).autoTable({
    startY: y + 2.5,
    head: [['#', 'Requisito / Pregunta de Inspección RETIE', 'Evaluación']],
    body: rows,
    theme: 'grid',
    headStyles: {
      fillColor: [26, 54, 93], // navy blue
      textColor: [255, 255, 255],
      fontSize: 7.2,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: {
      fontSize: 6.6,
      textColor: [51, 65, 85]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 'auto', halign: 'left' },
      2: { cellWidth: 25, halign: 'center', fontStyle: 'bold' }
    },
    didParseCell: (data: any) => {
      if (data.column.index === 2 && data.cell.section === 'body') {
        const val = data.cell.raw;
        if (val === 'SI') {
          data.cell.styles.textColor = [22, 163, 74]; // green-600
        } else if (val === 'NO') {
          data.cell.styles.textColor = [220, 38, 38]; // red-600
        } else if (val === 'N/A') {
          data.cell.styles.textColor = [100, 116, 139]; // slate-500
        }
      }
    },
    margin: { left: 15, right: 15 }
  });
}

function drawObservaciones(doc: jsPDF, y: number, answers: any) {
  const startX = 15;
  const width = 185.9;

  // Title
  doc.setFont('Helvetica', 'Bold');
  doc.setFontSize(9);
  doc.setTextColor(29, 78, 216); // blue-700
  doc.text('5. OBSERVACIONES GENERALES', startX, y);

  const obsVal = answers['Observaciones_observaciones'] ?? '';
  
  // Draw textarea box
  doc.setDrawColor(203, 213, 225); // slate-300
  doc.setFillColor(255, 255, 255);
  doc.setLineWidth(0.25);
  doc.roundedRect(startX, y + 2, width, 18, 1, 1, 'FD');

  doc.setFont('Helvetica', 'Normal');
  doc.setFontSize(7.5);
  doc.setTextColor(15, 23, 42);
  
  if (obsVal) {
    const splitObs = doc.splitTextToSize(String(obsVal), width - 8);
    doc.text(splitObs, startX + 4, y + 7);
  } else {
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text('Sin observaciones registradas.', startX + 4, y + 7);
  }
}

function drawSignatureBlock(doc: jsPDF, y: number) {
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
  doc.setFontSize(6);
  doc.text('Dictamen de Inspección RETIE', sigX + 30, y + 17.5, { align: 'center' });

  // Draw info on the left
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  const genDate = new Date().toLocaleString('es-CO', { timeZone: 'America/Bogota' });
  doc.text(`Documento generado electrónicamente el: ${genDate}`, startX, y + 12);
  doc.text('RYF ENERGY INSPECTION SAS - Formato F-GI-17 normalizado.', startX, y + 15.5);
}
