// middleware.js
import { NextResponse } from "next/server";

export function middleware(request) {
  const appType = process.env.APP_TYPE;

  console.log(appType, 'appType');

  // remove locale prefix (/en , /ar)
  const pathname = request.nextUrl.pathname.replace(
    /^\/(en|ar)(?=\/|$)/,
    ""
  );

  // منع /setting وأي route جواه
  if (
    appType !== "Form Builder" &&
    pathname.startsWith("/setting")
  ) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/setting/:path*",
    "/en/setting/:path*",
    "/ar/setting/:path*",
  ],
};