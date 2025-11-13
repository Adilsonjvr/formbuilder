import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import rateLimit from 'express-rate-limit';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const prisma = new PrismaClient();

const publicLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
});

const router = Router({ mergeParams: true });

// Public submit
router.post('/public/forms/:id/responses', publicLimiter, async (req: Request, res: Response) => {
  const { id: formId } = req.params as { id: string };
  const { fields } = req.body as { fields: { fieldId: string; value: any }[] };

  const form = await prisma.form.findFirst({ where: { id: formId, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  // Basic validation only for MVP
  if (!Array.isArray(fields) || fields.length === 0) {
    throw new AppError('fields is required', 400, 'VALIDATION_ERROR');
  }

  const response = await prisma.formResponse.create({
    data: {
      formId,
      data: fields as any,
      createdAt: new Date(),
    },
  });

  logger.info('response_submitted', { formId, responseId: response.id });

  return res.status(201).json({ id: response.id });
});

// Owner: list responses
router.get('/forms/:id/responses', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id: formId } = req.params as { id: string };
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 25;
  const offset = (page - 1) * limit;

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  const [items, total] = await Promise.all([
    prisma.formResponse.findMany({
      where: { formId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.formResponse.count({ where: { formId, deletedAt: null } }),
  ]);

  return res.json({ items, total, page, limit });
});

// Owner: get single response
router.get('/forms/:id/responses/:responseId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id: formId, responseId } = req.params as { id: string; responseId: string };

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  const response = await prisma.formResponse.findFirst({ where: { id: responseId, formId, deletedAt: null } });
  if (!response) {
    throw new AppError('Response not found', 404, 'RESPONSE_NOT_FOUND');
  }

  return res.json(response);
});

// Owner: soft delete response
router.delete('/forms/:id/responses/:responseId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id: formId, responseId } = req.params as { id: string; responseId: string };

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  await prisma.formResponse.update({
    where: { id: responseId },
    data: { deletedAt: new Date() },
  });

  logger.info('response_deleted', { formId, responseId });

  return res.status(204).send();
});

export default router;
