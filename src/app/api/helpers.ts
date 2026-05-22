// ============================================
// BASE API ROUTE - Shared API Utilities
// ============================================

import { NextRequest } from 'next/server';

// ==========================================
// TYPES
// ==========================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
  };
}

// ==========================================
// RESPONSE HELPERS
// ==========================================

export function successResponse<T>(data: T, message?: string, status = 200): Response {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  };
  return Response.json(body, { status });
}

export function errorResponse(error: string, status = 500): Response {
  const body: ApiResponse = {
    success: false,
    error,
    timestamp: new Date().toISOString()
  };
  return Response.json(body, { status });
}

// ==========================================
// AUTH MIDDLEWARE
// ==========================================

type AuthHandler = (
  req: NextRequest,
  userId: string
) => Promise<Response>;

/**
 * Wraps a handler with basic auth validation.
 * Reads the Authorization header (Bearer token).
 * In production, validate against Firebase Auth or similar.
 */
export async function withAuth(
  request: NextRequest,
  handler: AuthHandler
): Promise<Response> {
  try {
    const authHeader = request.headers.get('Authorization');

    // Allow open access in development / offline-first mode
    if (process.env.NODE_ENV === 'development' || !authHeader) {
      return handler(request, 'dev-user');
    }

    if (!authHeader.startsWith('Bearer ')) {
      return errorResponse('Unauthorized: missing Bearer token', 401);
    }

    const token = authHeader.slice(7);

    // TODO: Validate Firebase ID token here when backend auth is enabled.
    // For now, use token string as userId placeholder.
    const userId = token || 'anonymous';

    return handler(request, userId);
  } catch (err) {
    return errorResponse(`Auth error: ${err}`, 401);
  }
}
