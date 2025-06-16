export { auth as middleware } from "@/auth";

// // Role-based protection
// const path = req.nextUrl.pathname;
// if (path.startsWith("/teacher") && role !== "TEACHER")
//   return NextResponse.redirect(new URL("/unauthorized", req.url));

// if (path.startsWith("/student") && role !== "STUDENT")
//   return NextResponse.redirect(new URL("/unauthorized", req.url));

// if (path.startsWith("/admin") && role !== "ADMIN")
//   return NextResponse.redirect(new URL("/unauthorized", req.url));

// if (path.startsWith("/editor") && role !== "EDITOR")
//   return NextResponse.redirect(new URL("/unauthorized", req.url));

// return NextResponse.next();
// }

// export const config = {
//   matcher: [
//     "/teacher/:path*",
//     "/student/:path*",
//     "/admin/:path*",
//     "/editor/:path*",
//   ],
// };
