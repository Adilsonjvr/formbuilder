import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  const isAppError = err instanceof AppError;
  const statusCode = isAppError ? err.statusCode : 500;
  const code = isAppError ? err.code : 'INTERNAL_SERVER_ERROR';

  logger.error('request_error', {
    code,
    message: err.message,
    stack: !isAppError ? err.stack : undefined,
    method: req.method,
    url: req.originalUrl,
    userId: (req as any).user?.id,
  });

  res.status(statusCode).json({
    code,
    message: isAppError ? err.message : 'Internal server error',
  });
};
