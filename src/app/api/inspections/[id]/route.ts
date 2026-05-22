// ============================================
// INSPECTIONS API
// ============================================

import { NextRequest } from 'next/server';
import { 
  successResponse, 
  errorResponse, 
  withAuth 
} from '../../helpers';
import { firebaseService } from '@/engines/firebase/firebaseServices';
import { offlineEngine } from '@/engines/offline/indexedDB';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;
      const inspection = await firebaseService.getInspection(id);

      if (!inspection) {
        return errorResponse('Inspection not found', 404);
      }

      return successResponse(inspection);
    } catch (error) {
      return errorResponse(`Failed to get inspection: ${error}`);
    }
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { id } = await params;
      const body = await request.json();

      await firebaseService.updateInspection(id, body);

      return successResponse({ id, ...body }, 'Inspection updated');
    } catch (error) {
      return errorResponse(`Failed to update inspection: ${error}`);
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
      
      await firebaseService.deleteInspection(id);

      return successResponse({ id }, 'Inspection deleted');
    } catch (error) {
      return errorResponse(`Failed to delete inspection: ${error}`);
    }
  });
}