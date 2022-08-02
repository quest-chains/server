import { Request, Response, Router } from 'express';

import uploadRouter from '@/controllers/upload';

const ROUTES = Router();

ROUTES.use('/upload', uploadRouter);

ROUTES.get('/', (_req: Request, res: Response) => res.json('Quest Chains API'));

export { ROUTES };
