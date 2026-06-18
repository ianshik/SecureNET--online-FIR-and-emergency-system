import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Protected routes mapping. Any route starting with these paths requires authentication.
const protectedRoutes = ['/citizen', '/officer', '/control-room', '/authority'];

function getTokenPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const payload = JSON.parse(jsonPayload);
    
    // Check expiration (exp is in seconds, Date.now() is in milliseconds)
    if (payload.exp && payload.exp * 1000 < Date.now()) {
      return null;
    }
    return payload;
  } catch (error) {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const token = request.cookies.get('auth_token')?.value;
  
  const payload = token ? getTokenPayload(token) : null;
  const valid = !!payload;
  
  if (isProtectedRoute) {
    // If no token exists or invalid, redirect to login page
    if (!valid) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      // Clean up the invalid token
      if (token) {
        response.cookies.delete('auth_token');
      }
      return response;
    }
  }
  
  // If the user tries to go to login or register while already logged in
  if (pathname === '/login' || pathname === '/register') {
    if (valid) {
      const role = payload?.role;
      const roleDashboards: Record<string, string> = {
        CITIZEN: '/citizen/dashboard',
        OFFICER: '/officer/dashboard',
        CONTROL_ROOM: '/control-room/dashboard',
        AUTHORITY: '/authority/dashboard',
      };
      
      const redirectUrl = role && roleDashboards[role] ? roleDashboards[role] : '/';
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    } else if (token) {
      // Token exists but is invalid, we should remove the cookie
      const response = NextResponse.next();
      response.cookies.delete('auth_token');
      return response;
    }
  }

  return NextResponse.next();
}

// Config to optimize middleware performance
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
