import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  // 1. Kunin ang auth token mula sa cookies (Dapat i-save mo 'to pag login)
  const session = request.cookies.get('session')?.value;
  const userRole = request.cookies.get('user_role')?.value; // 'admin' or 'dorm_manager'

  const { pathname } = request.nextUrl;

  // 2. Public paths (Walang harang)
  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  // 3. Kung walang session, balik sa login
  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 4. ROLE PROTECTION LOGIC
  // Proteksyon para sa Admin Pages
  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url));
  }

  // Proteksyon para sa Manager Pages
  if (pathname.startsWith('/manager') && userRole !== 'dorm_manager') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}

// I-specify kung anong mga paths ang babantayan ng middleware
export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
};