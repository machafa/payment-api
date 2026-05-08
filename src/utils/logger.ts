import pino from 'pino';

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  // Configuração para tornar os logs legíveis em desenvolvimento
  // e JSON puro em produção (essencial para o Kubernetes no Wolke Host)
  transport: process.env.NODE_ENV !== 'production' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'HH:MM:ss Z',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
  base: {
    service: 'payment-api',
  },
});

export default logger;