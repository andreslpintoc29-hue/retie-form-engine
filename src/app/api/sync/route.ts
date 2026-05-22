// ============================================
// SYNC API - Offline Sync Endpoint
// ============================================

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withAuth } from '../helpers';
import { offlineEngine } from '@/engines/offline/indexedDB';

export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await request.json();
      const { inspectionId, operation, data } = body;

      if (!inspectionId || !operation) {
        return errorResponse('inspectionId and operation are required', 400);
      }

      await offlineEngine.queueOperation({
        type: operation as any,
        entity: 'inspection',
        entityId: inspectionId,
        payload: data,
        priority: 'normal',
        maxRetries: 3
      });

      // If online, try to sync immediately
      if (offlineEngine.getStatus().isOnline) {
        const result = await offlineEngine.forceSync();
        return successResponse(result, 'Synced');
      }

      return successResponse({ queued: true }, 'Added to sync queue');
    } catch (error) {
      return errorResponse(`Sync failed: ${error}`);
    }
  });
}

export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const status = offlineEngine.getStatus();
      const queue = await offlineEngine.getAllOperations();
      const inspections = await offlineEngine.getAllInspections();

      return successResponse({
        status,
        pendingOperations: queue.length,
        localInspections: inspections.length
      });
    } catch (error) {
      return errorResponse(`Failed to get sync status: ${error}`);
    }
  });
}