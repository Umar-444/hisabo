import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminCookie = request.cookies.get("hisabo_admin_session")?.value;

  // Security headers to inject on all administrative and application responses
  const response = NextResponse.next();
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

  // Admin route protection
  if (pathname.startsWith("/admin")) {
    const isLoginPage = pathname === "/admin/login";

    let hasValidTokenFormat = false;
    if (adminCookie) {
      try {
        const [base64, signature] = adminCookie.split(".");
        if (base64 && signature) {
          const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
          const session = JSON.parse(json);
          if (session && session.role === "admin" && session.expiresAt > Date.now()) {
            hasValidTokenFormat = true;
          }
        }
      } catch {
        hasValidTokenFormat = false;
      }
    }

    // If authenticated admin visits /admin/login, forward to /admin overview
    if (isLoginPage && hasValidTokenFormat) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }

    // If unauthenticated visitor accesses any protected /admin route, redirect to login
    if (!isLoginPage && !hasValidTokenFormat) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      // Clean up stale or invalid cookie
      if (adminCookie) {
        redirectResponse.cookies.delete("hisabo_admin_session");
      }
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};
