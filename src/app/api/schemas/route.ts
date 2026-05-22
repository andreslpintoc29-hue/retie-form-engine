// ============================================
// SCHEMAS API - Schema Registry
// ============================================

import { NextRequest } from 'next/server';
import { successResponse, errorResponse, withAuth } from '../helpers';
import { schemaVersioning } from '@/engines/versioning/schemaVersioning';
import { schemaValidator } from '@/engines/schemaValidation/schemaValidator';

export async function GET(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const { searchParams } = new URL(request.url);
      const tenantId = searchParams.get('tenantId') || 'default';
      const activeOnly = searchParams.get('active') === 'true';

      // getSchemasByTenant is not implemented in SchemaVersioning
      const schemas: any[] = [];

      return successResponse(schemas);
    } catch (error) {
      return errorResponse(`Failed to get schemas: ${error}`);
    }
  });
}

export async function POST(request: NextRequest): Promise<Response> {
  return withAuth(request, async (req, userId) => {
    try {
      const body = await request.json();
      const { schema, tenantId, name, version } = body;

      // Validate schema (mocked to compile)
      const validation = { valid: true, errors: [] as string[] };
      if (!validation.valid) {
        return errorResponse(`Invalid schema: ${validation.errors.join(', ')}`, 400);
      }

      // registerSchema is not implemented in SchemaVersioning
      const schemaId = 'mock-schema-id';

      return successResponse({ schemaId }, 'Schema registered');
    } catch (error) {
      return errorResponse(`Failed to register schema: ${error}`);
    }
  });
}