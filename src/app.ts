import express from 'express';
import 'dotenv/config';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error_handler.js';
import router from './routes/index.js';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

// Middleware global
app.use(express.json());
app.use(requestLogger);

setupSwagger(app);
// Rotas
app.use('/api/v1', router);
app.use(errorHandler);

const start = async (): Promise<void> => {
  app.listen(env.PORT, () => {
    // No app.ts, após as rotas
console.log('Rotas carregadas:');
app._router.stack.forEach((r: any) => {
  if (r.route && r.route.path) {
    console.log(`- ${Object.keys(r.route.methods)} ${r.route.path}`);
  } else if (r.name === 'router') {
    // Lista rotas dentro do router /api/v1
    r.handle.stack.forEach((handler: any) => {
      if (handler.route) {
        console.log(`- ${Object.keys(handler.route.methods)} /api/v1${handler.route.path}`);
      }
    });
  }
});
  });
};

start();

export default app;