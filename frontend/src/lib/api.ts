// Using relative paths for API routes in the same Next.js app
const API_URL = '';

export async function api(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
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

    const error = new Error(errorMessage);
    (error as any).status = res.status;
    throw error;
  }

  return res.json();
}
