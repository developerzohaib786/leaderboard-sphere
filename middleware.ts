import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl;

        // Protect only dashboard routes
        if (pathname.startsWith("/dashboard") && !req.nextauth.token) {
            return NextResponse.redirect(new URL("/login", req.url));
        }

        return NextResponse.next();


    },
    {
        callbacks: {
            authorized({ req, token }) {
                const { pathname } = req.nextUrl;

                // If accessing dashboard, require login
                if (pathname.startsWith("/dashboard")) {
                    return !!token;
                }

                // All other routes are public
                return true;
            },
        },
    }
);

export const config = {
    matcher: [
        /*
        * Match all request paths except:
        * - _next/static (static files)
        * - _next/image (image optimization files)
        * - favicon.ico (favicon file)
        * - public folder
        */
        "/((?!_next/static|_next/image|favicon.ico|public/).*)",
    ],
};