import dotenv from 'dotenv';

dotenv.config();

export const IS_PROD = process.env.NODE_ENV !== 'development';

export const PORT = process.env.PORT ? Number(process.env.PORT) : 5000;

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
export const WEB3_STORAGE_TOKEN = process.env.WEB3_STORAGE_TOKEN!;
