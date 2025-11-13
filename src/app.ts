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
  origin: 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/auth', authRouter);
app.use('/api/upload', uploadRouter);
app.use('/forms', formsRouter);
app.use('/forms/:id/fields', fieldsRouter);
app.use('/', responsesRouter);

app.use(errorHandler);

export default app;
