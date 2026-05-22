// ============================================
// ATTACHMENTS API
// ============================================

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withAuth } from '../../helpers';
import { firebaseService } from '@/engines/firebase/firebaseServices';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;
      const attachments = await firebaseService.getAttachments(id);
      
      return successResponse(attachments);
    } catch (error) {
      return errorResponse(`Failed to get attachments: ${error}`);
    }
  });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;
      
      await firebaseService.deleteAttachment(id);

      return successResponse({ id }, 'Attachment deleted');
    } catch (error) {
      return errorResponse(`Failed to delete attachment: ${error}`);
    }
  });
}