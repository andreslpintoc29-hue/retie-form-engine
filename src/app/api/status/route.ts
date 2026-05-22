// ============================================
// INSPECTIONS ROUTES
// ============================================

import { NextRequest } from 'next/server';

export async function GET(request: NextRequest): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');

  // Redirect to demo pages
  if (path === 'demo') {
    return Response.redirect(new URL('/demo', request.url));
  }
  if (path === 'piscinas') {
    return Response.redirect(new URL('/piscinas', request.url));
  }

  return Response.json({ 
    message: 'RETIE Platform API',
    version: '1.0.0',
    endpoints: {
      '/inspections': 'List inspections',
      '/inspections/[id]': 'Get inspection',
      '/piscinas': 'Demo PISCINAS schema',
      '/demo': 'General demo'
    }
  });
}