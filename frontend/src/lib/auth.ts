import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

export interface AuthUser {
  id: string;
  email: string;
}

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  // Try to get token from cookie first, then from Authorization header
  let token = req.cookies.get('accessToken')?.value;

  if (!token) {
    const authHeader = req.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
  }

  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string) as {
      userId: string;
      email: string;
    };

    return { id: decoded.userId, email: decoded.email };
  } catch {
    return null;
  }
}

export function requireAuth(user: AuthUser | null): asserts user is AuthUser {
  if (!user) {
    throw new Error('Unauthorized');
  }
}
