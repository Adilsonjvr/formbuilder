// Using relative paths for API routes in the same Next.js app
const API_URL = '';

const getCsrfToken = () => {
  if (typeof document === 'undefined') {
    return undefined
  }

  const match = document.cookie
    ?.split(';')
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith('csrfToken='))

  if (!match) {
    return undefined
  }

  return decodeURIComponent(match.split('=')[1] || '')
}

class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

export async function api<TResponse = unknown>(path: string, options: RequestInit = {}) {
  const csrfToken = getCsrfToken()
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(csrfToken ? { 'X-CSRF-Token': csrfToken } : {}),
      ...(options.headers || {}),
    },
    credentials: 'include',
  });

  if (!res.ok) {
    const text = await res.text();
    let errorMessage = res.statusText;

    try {
      const json = JSON.parse(text);
      errorMessage = json.message || errorMessage;
    } catch {
      errorMessage = text || errorMessage;
    }

    throw new ApiError(errorMessage, res.status);
  }

  return res.json() as Promise<TResponse>;
}
