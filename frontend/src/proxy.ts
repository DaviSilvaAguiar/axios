import { type NextRequest, NextResponse } from 'next/server';

// Rotas acessíveis apenas sem autenticação
const AUTH_ONLY_PATHS = ['/', '/login'];

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('axios_token');

  const isAuthOnly = AUTH_ONLY_PATHS.includes(pathname);

  if (isAuthOnly && token) {
    // Autenticado tentando acessar rota pública → redireciona para o app
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (!isAuthOnly && !token) {
    // Não autenticado tentando acessar rota protegida → redireciona para landing
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\..*).*)'],
};
