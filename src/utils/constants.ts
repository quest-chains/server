import dotenv from 'dotenv';

dotenv.config();

export const IS_PROD: boolean = process.env.NODE_ENV !== 'development';

export const PORT: number = process.env.PORT ? Number(process.env.PORT) : 5000;

export const UPLOAD_FILE_SIZE_LIMIT: number = process.env.UPLOAD_FILE_SIZE_LIMIT
  ? Number(process.env.UPLOAD_FILE_SIZE_LIMIT)
  : 100 * 1024 * 1024;
