import cors from 'cors';
import express, { Application } from 'express';
import morgan from 'morgan';

import { ROUTES } from '@/server/routes';

export const createServer = async (): Promise<Application> => {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use(morgan('tiny'));

  app.use('/', ROUTES);

  return app;
};
