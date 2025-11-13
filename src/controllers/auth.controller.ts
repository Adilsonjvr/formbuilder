import { Router, Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
});

const signupLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
});

const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';
const SALT_ROUNDS = 10;

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

function setAuthCookies(res: Response, accessToken: string, refreshToken: string) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

router.post('/signup', signupLimiter, async (req: Request, res: Response) => {
  const { email, password, name } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: { email, name, passwordHash },
  });

  const { accessToken, refreshToken } = signTokens(user.id, user.email);
  setAuthCookies(res, accessToken, refreshToken);

  return res.status(201).json({
    id: user.id,
    email: user.email,
    name: user.name,
  });
});

router.post('/login', loginLimiter, async (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const { accessToken, refreshToken } = signTokens(user.id, user.email);
  setAuthCookies(res, accessToken, refreshToken);

  return res.json({
    accessToken,
    refreshToken,
  });
});

router.post('/refresh', async (req: Request, res: Response) => {
  const token = (req.cookies?.refreshToken || req.body.refreshToken) as string | undefined;
  if (!token) {
    return res.status(401).json({ message: 'Refresh token missing' });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_REFRESH_TOKEN_SECRET as string,
    ) as { userId: string; email: string };

    const { accessToken, refreshToken } = signTokens(decoded.userId, decoded.email);
    setAuthCookies(res, accessToken, refreshToken);

    return res.json({ accessToken, refreshToken });
  } catch {
    return res.status(401).json({ message: 'Invalid or expired refresh token' });
  }
});

router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  return res.status(204).send();
});

export default router;
