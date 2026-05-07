import express from 'express';
import { requestLogger } from './middleware/logger.js';
import { errorHandler } from './middleware/error_handler.js';
import router from './routes/index.js';
import { env } from './config/env.js';

const app = express();

// Middleware global
app.use(express.json());
app.use(requestLogger);

// Rotas
app.use('/api/v1', router);

// Error handler — deve ser o último middleware
app.use(errorHandler);

const start = async (): Promise<void> => {
  app.listen(env.PORT, () => {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      message: `Server running on port ${env.PORT}`,
      environment: env.NODE_ENV,
    }));
  });
};

start();

export default app;