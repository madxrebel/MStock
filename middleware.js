// middleware.ts
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(req) {
  const token = await getToken({ req });
  const url = req.nextUrl.clone();

  if (!token) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
