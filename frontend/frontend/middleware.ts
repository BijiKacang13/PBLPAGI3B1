import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Middleware di-disable sementara karena kita menggunakan localStorage (Client Side) untuk menyimpan token.
  // Auth check akan dilakukan di masing-masing page/layout secara client-side atau menggunakan HOC.

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/akuntan/:path*", "/auditor/:path*", "/login"],
};