import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import authRouter from './controllers/auth.controller';
import uploadRouter from './controllers/upload.controller';
import formsRouter from './controllers/forms.controller';
import fieldsRouter from './controllers/fields.controller';
import responsesRouter from './controllers/responses.controller';
import { errorHandler } from './middlewares/error.middleware';

dotenv.config();

const app = express();

app.use(cors({
  origin: (process.env.FRONTEND_URL || 'http://localhost:4000').trim().replace(/^["']|["']$/g, ''),
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.get('/debug', (_req, res) => {
  res.json({
    env: process.env.NODE_ENV,
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    hasJwtAccess: !!process.env.JWT_ACCESS_TOKEN_SECRET,
    hasJwtRefresh: !!process.env.JWT_REFRESH_TOKEN_SECRET,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
  });
});

app.use('/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/forms', formsRouter);
app.use('/forms/:id/fields', fieldsRouter);
app.use('/', responsesRouter);

app.use(errorHandler);

export default app;
