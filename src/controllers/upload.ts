import { Router, Request, Response } from 'express';
import Busboy from 'busboy';
import concat from 'concat-stream';
import { Readable } from 'stream';

import { pinFilesToIPFS, pinJsonToIPFS } from '@/utils/ipfs';

const router = Router();

class HttpError extends Error {
  status = 500;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

router.post('/files', async (req: Request, res: Response) => {
  const busboy = Busboy({
    headers: req.headers,
    limits: { fileSize: 50 * 1024 * 1024 }
  });
  const files: {
    name: string;
    stream: () => ReadableStream;
  }[] = [];
  let truncated = false;

  busboy.on('file', async (fieldname: string, fileStream: Readable) => {
    fileStream.pipe(
      concat({ encoding: 'buffer' }, function (data: Buffer) {
        const file = {
          name: fieldname,
          stream: () => Readable.from(data) as unknown as ReadableStream
        };
        if (!(fileStream as unknown as { truncated: boolean }).truncated) {
          files.push(file);
        } else {
          truncated = true;
        }
      })
    );
  });

  busboy.on('finish', async () => {
    try {
      if (truncated) {
        throw new HttpError(400, 'File size too large');
      }
      if (files.length === 0) {
        throw new HttpError(400, 'No files uploaded');
      }

      const result = await pinFilesToIPFS(files);
      res.json({ response: result });
    } catch (error) {
      console.error('Failed to upload files:', error);
      const status = (error as HttpError).status ?? 500;
      res.status(status).json({
        response: 'Error: Failed to upload files',
        error:
          status === 500
            ? 'Internal Server Error'
            : (error as Error)?.message ?? error
      });
    }
  });

  req.pipe(busboy);
});

router.post('/json', async (req: Request, res: Response) => {
  try {
    const result = await pinJsonToIPFS(req.body);
    res.json({ response: result });
  } catch (error) {
    console.error('Failed to upload json:', error);
    const status = (error as HttpError).status ?? 500;
    res.status(status).json({
      response: 'Error: Failed to upload files',
      error:
        status === 500
          ? 'Internal Server Error'
          : (error as Error)?.message ?? error
    });
  }
});

export default router;
