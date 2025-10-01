import { NextResponse, NextRequest } from 'next/server';

const allowedOrigins = [
  'https://strivetech.ai',
  'https://www.strivetech.ai',
  'http://localhost:5173',
  'http://localhost:3000',
];

export function handleCORS(request: NextRequest): NextResponse | null {
  const path = request.nextUrl.pathname;

  if (!path.startsWith('/api/analytics/')) {
    return null;
  }

  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && allowedOrigins.includes(origin);

  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': isAllowedOrigin ? origin : allowedOrigins[0],
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  const response = NextResponse.next();
  if (isAllowedOrigin) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
  }
  return response;
}
