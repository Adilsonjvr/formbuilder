import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

function signTokens(userId: string, email: string) {
  const accessToken = jwt.sign(
    { userId, email },
    process.env.JWT_ACCESS_TOKEN_SECRET as string,
    { expiresIn: ACCESS_TOKEN_EXPIRES_IN },
  );

  const refreshToken = jwt.sign(
    { userId, email },
    process.env.JWT_REFRESH_TOKEN_SECRET as string,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN },
  );

  return { accessToken, refreshToken };
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get('refreshToken')?.value || (await req.json()).refreshToken;

    if (!token) {
      return NextResponse.json(
        { message: 'Refresh token missing' },
        { status: 401 }
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
    ) as { userId: string; email: string };

    const { accessToken, refreshToken } = signTokens(decoded.userId, decoded.email);

    const isProd = process.env.NODE_ENV === 'production';
    const response = NextResponse.json({ accessToken, refreshToken });

    response.cookies.set('accessToken', accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 15 * 60,
    });

    response.cookies.set('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Refresh error:', error);
    return NextResponse.json(
      { message: 'Invalid or expired refresh token' },
      { status: 401 }
    );
  }
}
