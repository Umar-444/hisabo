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

  // User application route protection
  const isUserPanelRoute =
    pathname === "/dashboard" ||
    pathname.startsWith("/dashboard/") ||
    pathname === "/expenses" ||
    pathname.startsWith("/expenses/") ||
    pathname === "/groups" ||
    pathname.startsWith("/groups/") ||
    pathname === "/balances" ||
    pathname.startsWith("/balances/") ||
    pathname === "/settlements" ||
    pathname.startsWith("/settlements/") ||
    pathname === "/notifications" ||
    pathname.startsWith("/notifications/") ||
    pathname === "/settings" ||
    pathname.startsWith("/settings/");

  const isAuthPage = pathname === "/login" || pathname === "/register";

  const userCookie = request.cookies.get("hisabo_user_session")?.value;
  let hasValidUserToken = false;
  if (userCookie) {
    try {
      const [base64, signature] = userCookie.split(".");
      if (base64 && signature) {
        const json = atob(base64.replace(/-/g, "+").replace(/_/g, "/"));
        const session = JSON.parse(json);
        if (session && session.id && session.expiresAt > Date.now()) {
          hasValidUserToken = true;
        }
      }
    } catch {
      hasValidUserToken = false;
    }
  }

  // Redirect authenticated user away from login/register
  if (isAuthPage && hasValidUserToken) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Protect user panel routes
  if (isUserPanelRoute && !hasValidUserToken) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    const redirectResponse = NextResponse.redirect(loginUrl);
    if (userCookie) {
      redirectResponse.cookies.delete("hisabo_user_session");
    }
    return redirectResponse;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/dashboard",
    "/expenses/:path*",
    "/expenses",
    "/groups/:path*",
    "/groups",
    "/balances/:path*",
    "/balances",
    "/settlements/:path*",
    "/settlements",
    "/notifications/:path*",
    "/notifications",
    "/settings/:path*",
    "/settings",
    "/login",
    "/register",
  ],
};
