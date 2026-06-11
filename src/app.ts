import express, { Request, Response, NextFunction } from 'express';
import 'dotenv/config';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error_handler.js';
import router from './routes/index.js';
import { env } from './config/env.js';
import { setupSwagger } from './config/swagger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

app.use(cors());
app.use(express.json());
app.use(requestLogger);
app.use(express.static(path.join(__dirname, '../public')));

setupSwagger(app);

// -> ADICIONA ESTA ROTA AQUI: Garante que a raiz do domínio entrega o index.html reativo
app.get('/', (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.use('/api/v1', router);

app.use(errorHandler);

const start = async (): Promise<void> => {
  try {
    app.listen(Number(env.PORT), '0.0.0.0', () => {
      console.log('-------------------------------------------');
      console.log(`Server running on port ${env.PORT}`);
      console.log(`Environment: ${env.NODE_ENV}`);
      console.log('-------------------------------------------');

      console.log('Rotas carregadas:');
      
      const stack = (app as any)._router?.stack;
      
      if (stack) {
        stack.forEach((layer: any) => {
          if (layer.route) {
            const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
            console.log(`[Direct] ${methods} ${layer.route.path}`);
          } else if (layer.name === 'router' && layer.handle.stack) {
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