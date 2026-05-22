// ============================================
// INSPECTIONS LIST API
// ============================================

import { NextRequest } from 'next/server';
import { 
  successResponse, 
  errorResponse, 
  withAuth,
  PaginatedResponse 
} from '../helpers';
import { firebaseService } from '@/engines/firebase/firebaseServices';

export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get('status');
      const page = parseInt(searchParams.get('page') || '1');
      const limit = parseInt(searchParams.get('limit') || '20');
      const tenantId = searchParams.get('tenantId');

      let inspections;
      
      if (status) {
        inspections = await firebaseService.getInspectionsByStatus(status as any, tenantId || undefined);
      } else {
        inspections = await firebaseService.getInspections();
      }

      const total = inspections.length;
      const start = (page - 1) * limit;
      const paginatedItems = inspections.slice(start, start + limit);

      const response: PaginatedResponse<any> = {
        success: true,
        data: paginatedItems,
        pagination: {
          page,
          limit,
          total,
          hasMore: start + limit < total
        },
        timestamp: new Date().toISOString()
      };

      return Response.json(response);
    } catch (error) {
      return errorResponse(`Failed to list inspections: ${error}`);
    }
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await request.json();
      
      const inspectionId = await firebaseService.createInspection({
        ...body,
        inspectorId: userId,
        tenantId: body.tenantId || 'default',
        status: 'draft'
      });

      return successResponse({ inspectionId }, 'Inspection created');
    } catch (error) {
      return errorResponse(`Failed to create inspection: ${error}`);
    }
  });
}