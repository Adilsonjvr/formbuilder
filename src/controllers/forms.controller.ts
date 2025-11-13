import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authMiddleware, AuthRequest } from '../middlewares/auth.middleware';
import { validate } from '../middlewares/validate.middleware';
import { CreateFormDTO } from '../dtos/form.dto';
import logger from '../utils/logger';

const router = Router();
const prisma = new PrismaClient();

router.post('/', authMiddleware, validate(CreateFormDTO), async (req: AuthRequest, res: Response) => {
  const { name, description } = req.body;

  const form = await prisma.form.create({
    data: {
      name,
      description,
      userId: req.user!.id,
    },
  });

  logger.info('form_created', { userId: req.user!.id, formId: form.id, name: form.name });

  return res.status(201).json({
    id: form.id,
    name: form.name,
    description: form.description,
    createdAt: form.createdAt,
  });
});

router.get('/', authMiddleware, async (req: AuthRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.form.findMany({
      where: {
        userId: req.user!.id,
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
    }),
    prisma.form.count({
      where: {
        userId: req.user!.id,
        deletedAt: null,
      },
    }),
  ]);

  const hasMore = page * limit < total;

  return res.json({ items, total, page, limit, hasMore });
});

router.get('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await prisma.form.findFirst({
    where: {
      id: id,
      userId: req.user!.id,
      deletedAt: null,
    },
    include: {
      fields: {
        orderBy: { order: 'asc' },
      },
      responses: true,
    },
  } as any);

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  const stats = {
    responses: (form as any).responses?.length ?? 0,
  };

  return res.json({
    id: form.id,
    name: form.name,
    description: form.description,
    fields: (form as any).fields ?? [],
    isPublic: false,
    createdAt: form.createdAt,
    stats,
  });
});

router.put('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  const { name, description } = req.body;

  const form = await prisma.form.findFirst({
    where: { id, userId: req.user!.id, deletedAt: null },
  });

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  const updated = await prisma.form.update({
    where: { id: form.id },
    data: { name: name ?? form.name, description: description ?? form.description },
  });

  logger.info('form_updated', { userId: req.user!.id, formId: updated.id });

  return res.json({
    id: updated.id,
    name: updated.name,
    description: updated.description,
    createdAt: updated.createdAt,
  });
});

router.delete('/:id', authMiddleware, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;

  const form = await prisma.form.findFirst({
    where: { id, userId: req.user!.id, deletedAt: null },
  });

  if (!form) {
    return res.status(404).json({ message: 'Form not found' });
  }

  await prisma.form.update({
    where: { id: form.id },
    data: { deletedAt: new Date() },
  });

  logger.info('form_deleted', { userId: req.user!.id, formId: form.id });

  return res.status(204).send();
});

export default router;
