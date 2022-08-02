import { Application } from 'express';

import { createServer } from '@/server';
import { PORT } from '@/utils/constants';

createServer().then((app: Application) => {
  app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
});
