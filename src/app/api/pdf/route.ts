// ============================================
// PDF API - Report Generation
// ============================================

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withAuth } from '../helpers';
import { pdfEngine } from '@/engines/pdf/pdfEngine';
import { firebaseService } from '@/engines/firebase/firebaseServices';

export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await request.json();
      const { inspectionId, reportType, options } = body;

      if (!inspectionId) {
        return errorResponse('inspectionId is required', 400);
      }

      // Get inspection data
      const inspection = await firebaseService.getInspection(inspectionId);
      if (!inspection) {
        return errorResponse('Inspection not found', 404);
      }

      // Generate PDF
      const pdfBlob = await pdfEngine.generateReport({
        inspection: inspection as any,
        sheets: [],
        compliance: undefined,
        generatedBy: options?.generatedBy || 'System'
      });

      // Return as base64 or upload to storage
      const base64 = await blobToBase64(pdfBlob);

      return successResponse({
        pdf: base64,
        inspectionId,
        generatedAt: new Date().toISOString()
      });
    } catch (error) {
      return errorResponse(`PDF generation failed: ${error}`);
    }
  });
}

async function blobToBase64(blob: Blob): Promise<string> {
  const arrayBuffer = await blob.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}