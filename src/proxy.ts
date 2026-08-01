import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, isAuthed } from '@/lib/studio/auth';

/**
 * Next 16 renamed middleware.ts -> proxy.ts (export `proxy`).
 *
 * First gate on /studio. It is not the only one: every /api/studio route
 * re-checks the session itself, because a gate that lives only in routing
 * config fails open the moment a matcher is edited.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // The login page and its POST handler must stay reachable unauthenticated.
  if (pathname === '/studio/login' || pathname === '/api/studio/login') {
    return NextResponse.next();
  }

  if (await isAuthed(request.cookies.get(SESSION_COOKIE)?.value)) {
    return NextResponse.next();
  }

  if (pathname.startsWith('/api/')) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const login = new URL('/studio/login', request.url);
  // Come back to where they were headed after signing in. Only a same-site
  // path is ever echoed back, so this cannot be used as an open redirect.
  if (pathname !== '/studio') login.searchParams.set('next', pathname);
  return NextResponse.redirect(login);
}

export const config = {
  matcher: ['/studio/:path*', '/api/studio/:path*'],
};
