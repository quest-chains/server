import { Response } from 'express';

export const handleMongoError = (res: Response, err: unknown) => {
  console.log((err as Error).name);
  const { name } = err as Error;
  const { message } = err as Error;
  if (name === 'MongoServerError' && message.includes('duplicate key error')) {
    res.status(400).json({ error: 'Whitelist already exists' });
  } else {
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
