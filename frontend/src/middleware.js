import { NextResponse } from "next/server";

export function middleware(request) {
  // const token = request.cookies.get("access_token")?.value;

  // const isAuthPage = request.nextUrl.pathname.startsWith("/login");
  // const isProtectedRoute =request.nextUrl.pathname.startsWith("/cart");

  // // اگر لاگین نکرده و رفت صفحه محافظت‌شده
  // if (isProtectedRoute && !token) {
  //   return NextResponse.redirect(new URL("/login", request.url));
  // }

  // // اگر لاگین کرده و رفت login
  // if (isAuthPage && token) {
  //   return NextResponse.redirect(new URL("/", request.url));
  // }

  // return NextResponse.next();

  return ;
}



// مسیرهایی که middleware روی آن اجرا شود
// export const config = {
//   matcher: ["/cart/:path*", "/login"],
// };