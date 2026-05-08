import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error_handler.js';
import router from './routes/index.js';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';

const app = express();

// 1. Middlewares globais (sempre antes das rotas)
app.use(express.json());
app.use(requestLogger);

// 2. Configuração do Swagger
setupSwagger(app);

// 3. Montagem das Rotas
app.use('/api/v1', router);

// 4. Error Handler (sempre depois das rotas)
app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    app.listen(env.PORT, () => {
      console.log('-------------------------------------------');
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log('-------------------------------------------');

      // Debug de rotas seguro (sem quebrar o servidor)
      console.log('Rotas carregadas:');
      
      const stack = (app as any)._router?.stack;
      
      if (stack) {
        stack.forEach((layer: any) => {
          if (layer.route) {

            // health check
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`[Direct] ${methods} ${layer.route.path}`);
          } else if (layer.name === 'router' && layer.handle.stack) {

            // routes that are in /api/v1
            layer.handle.stack.forEach((handler: any) => {
              if (handler.route) {
                const methods = Object.keys(handler.route.methods).join(',').toUpperCase();
                console.log(`[API v1] ${methods} /api/v1${handler.route.path}`);
              }
            });
          }
        });
      }
      console.log('-------------------------------------------');
    });
  } catch (error) {
    console.error('Error starting server:', error);
    process.exit(1);
  }
};

start();

export default app;