import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET as string) as {
      userId: string;
      email: string;
    };

    req.user = { id: decoded.userId, email: decoded.email };
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};