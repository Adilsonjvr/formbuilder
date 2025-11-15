import { NextResponse, NextRequest } from 'next/server'

const RATE_LIMIT_WINDOW_MS = 60_000
const RATE_LIMIT_MAX_REQUESTS = 120
const RATE_LIMIT_KEY_PREFIX = 'rl:'

const rateLimitStore = new Map<string, { count: number; expires: number }>()

const CSRF_COOKIE = 'csrfToken'
const CSRF_HEADER = 'x-csrf-token'

const SECURITY_HEADERS: Record<string, string> = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' https://vercel.live",
    "connect-src 'self' https://vercel.live https://*.vercel.app",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob:",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

const isUnsafeMethod = (method: string) => !['GET', 'HEAD', 'OPTIONS'].includes(method.toUpperCase())

const getClientIp = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim()
  }
  return request.ip ?? 'unknown'
}

const isRateLimited = (key: string) => {
  const now = Date.now()
  const record = rateLimitStore.get(key)

  if (!record || record.expires < now) {
    rateLimitStore.set(key, { count: 1, expires: now + RATE_LIMIT_WINDOW_MS })
    return false
  }

  record.count += 1
  if (record.count > RATE_LIMIT_MAX_REQUESTS) {
    return true
  }

  rateLimitStore.set(key, record)
  return false
}

const applySecurityHeaders = (response: NextResponse) => {
  Object.entries(SECURITY_HEADERS).forEach(([header, value]) => {
    response.headers.set(header, value)
  })
}

const ensureCsrfCookie = (request: NextRequest, response: NextResponse) => {
  const hasToken = request.cookies.get(CSRF_COOKIE)?.value
  if (hasToken) {
    return hasToken
  }

  const token = crypto.randomUUID()
  response.cookies.set(CSRF_COOKIE, token, {
    httpOnly: false,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  })
  return token
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next()
  applySecurityHeaders(response)

  const csrfToken = ensureCsrfCookie(request, response)

  const pathname = request.nextUrl.pathname
  const method = request.method.toUpperCase()

  if (pathname.startsWith('/api/')) {
    const clientIp = getClientIp(request)
    const rateLimitKey = `${RATE_LIMIT_KEY_PREFIX}${clientIp}`

    if (isRateLimited(rateLimitKey)) {
      const limitResponse = NextResponse.json(
        { message: 'Too many requests. Please slow down.' },
        { status: 429 }
      )
      applySecurityHeaders(limitResponse)
      return limitResponse
    }

    if (isUnsafeMethod(method)) {
      const headerToken = request.headers.get(CSRF_HEADER)
      const cookieToken = request.cookies.get(CSRF_COOKIE)?.value ?? csrfToken

      if (!headerToken || !cookieToken || headerToken !== cookieToken) {
        const csrfResponse = NextResponse.json({ message: 'Invalid CSRF token' }, { status: 403 })
        applySecurityHeaders(csrfResponse)
        if (!request.cookies.get(CSRF_COOKIE)?.value && csrfToken) {
          csrfResponse.cookies.set(CSRF_COOKIE, csrfToken, {
            httpOnly: false,
            sameSite: 'lax',
            secure: process.env.NODE_ENV === 'production',
            path: '/',
          })
        }
        return csrfResponse
      }
    }
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
