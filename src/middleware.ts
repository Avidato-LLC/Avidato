import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    // This function runs when user is authenticated
    // We can add additional logic here if needed
    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user has a valid token (is authenticated)
        if (req.nextUrl.pathname.startsWith('/dashboard')) {
          return !!token // Require authentication for dashboard routes
        }
        
        // Allow access to all other routes
        return true
      },
    },
    pages: {
      signIn: '/login', // Redirect unauthenticated users to login
    }
  }
)

// Configure which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)  
     * - favicon.ico (favicon file)
     * - public folder files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}