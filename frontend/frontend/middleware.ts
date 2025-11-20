import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("auth_token")?.value;

  // Jika tidak ada token dan mencoba akses protected route
  if (!token && !request.nextUrl.pathname.startsWith("/login")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Jika sudah login dan mencoba akses login page
  if (token && request.nextUrl.pathname === "/login") {
    return NextResponse.redirect(new URL("/admin/beranda", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/akuntan/:path*", "/auditor/:path*", "/login"],
};