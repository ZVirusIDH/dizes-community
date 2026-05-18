import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const hostname = request.headers.get('host') || '';

  // Clean the hostname if it has ports (for local development testing)
  const cleanHost = hostname.split(':')[0].toLowerCase();

  // If the request comes from the LumiMine subdomain
  if (cleanHost === 'lumimine.zetavirus.com' || cleanHost === 'lumimine.localhost') {
    // If requesting static files, API routes, or Next.js internal assets, let them pass through
    if (
      url.pathname.startsWith('/_next') ||
      url.pathname.startsWith('/api') ||
      url.pathname.includes('.')
    ) {
      return NextResponse.next();
    }

    // Internally rewrite any pages (like / or /privacy or /privacy-policy) to the LumiMine privacy page
    url.pathname = `/lumimine-privacy`;
    return NextResponse.rewrite(url);
  }

  // Otherwise, proceed normally
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
