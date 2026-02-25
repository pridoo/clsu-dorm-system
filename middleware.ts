import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {

  const session = request.cookies.get('session')?.value;
  const userRole = request.cookies.get('user_role')?.value; 

  const { pathname } = request.nextUrl;

  if (pathname === '/login' || pathname === '/') {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }


  if (pathname.startsWith('/admin') && userRole !== 'admin') {
    return NextResponse.redirect(new URL('/manager/dashboard', request.url));
  }


  if (pathname.startsWith('/manager') && userRole !== 'dorm_manager') {
    return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  return NextResponse.next();
}


export const config = {
  matcher: ['/admin/:path*', '/manager/:path*'],
};