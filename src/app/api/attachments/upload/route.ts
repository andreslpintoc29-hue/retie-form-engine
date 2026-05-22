// ============================================
// ATTACHMENTS UPLOAD API
// ============================================

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withAuth } from '../../helpers';
import { firebaseService } from '@/engines/firebase/firebaseServices';

export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const formData = await request.formData();
      
      const file = formData.get('file') as File;
      const inspectionId = formData.get('inspectionId') as string;
      const type = formData.get('type') as any;
      const fieldId = formData.get('fieldId') as string | undefined;

      if (!file || !inspectionId) {
        return errorResponse('File and inspectionId are required', 400);
      }

      const attachment = await firebaseService.uploadAttachment(
        inspectionId,
        file,
        type || 'photo',
        fieldId
      );

      return successResponse(attachment, 'File uploaded');
    } catch (error) {
      return errorResponse(`Upload failed: ${error}`);
    }
  });
}