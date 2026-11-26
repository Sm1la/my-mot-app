import { type NextRequest } from "next/server";
import { createDemoToken, demoCookieName, isDemoToken } from "@/lib/demo-session";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const trackerRoute = pathname === "/" || pathname.startsWith("/files/") || pathname.startsWith("/projects/");
  const currentToken = request.cookies.get(demoCookieName)?.value;
  const newToken = trackerRoute && !isDemoToken(currentToken) ? createDemoToken() : null;
  if (newToken) request.cookies.set(demoCookieName, newToken);

  const response = await updateSession(request);
  if (newToken) {
    response.cookies.set(demoCookieName, newToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  }
  if (trackerRoute) response.headers.set("Cache-Control", "private, no-store");
  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
