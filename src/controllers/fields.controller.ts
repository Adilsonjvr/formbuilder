import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { AddFormFieldDTO } from '../dtos/field.dto';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';

const router = Router({ mergeParams: true });
const prisma = new PrismaClient();

router.post('/', authMiddleware, validate(AddFormFieldDTO), async (req: AuthRequest, res: Response) => {
  const { id: formId } = req.params as { id: string };
  const { type, label, required, order, settings } = req.body;

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  const field = await prisma.formField.create({
    data: { formId, type, label, required, order, createdAt: new Date() },
  });

  logger.info('field_created', { userId: req.user!.id, formId, fieldId: field.id });

  return res.status(201).json(field);
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id: formId } = req.params as { id: string };

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  const fields = await prisma.formField.findMany({
    where: { formId },
    orderBy: { order: 'asc' },
  });

  return res.json(fields);
});

router.delete('/:fieldId', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id: formId, fieldId } = req.params as { id: string; fieldId: string };

  const form = await prisma.form.findFirst({ where: { id: formId, userId: req.user!.id, deletedAt: null } });
  if (!form) {
    throw new AppError('Form not found', 404, 'FORM_NOT_FOUND');
  }

  await prisma.formField.delete({ where: { id: fieldId } });

  logger.info('field_deleted', { userId: req.user!.id, formId, fieldId });

  return res.status(204).send();
});

export default router;
