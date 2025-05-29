import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

import getOrCreateDB from './models/server/dbSetup'
import getOrCreateStorage from './models/server/storageSetup'

// This function can be marked `async` if using `await` inside
export async function middleware(request: NextRequest) {
  console.log('Middleware hit:', request.nextUrl.pathname)
  try {
    await Promise.all([
      getOrCreateDB(),
      getOrCreateStorage()
    ])
    console.log('DB and Storage setup complete')
  } catch (error) {
    console.error('Middleware error:', error)
    // Optionally, return an error response here
    // return new NextResponse('Internal Server Error', { status: 500 })
  }
  return NextResponse.next()
}
 
// See "Matching Paths" below to learn more
export const config = {
  /* match all request paths except for the the ones that starts with:
  - api
  - _next/static
  - _next/image
  - favicon.com

  */
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}