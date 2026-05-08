import { Request, Response, NextFunction } from 'express';

export const validateIdempotency = (req: Request, res: Response, next: NextFunction) => {
  const key = req.headers['idempotency-key'];

  if (!key) {
    // Isto faz o teu teste 'deve retornar 400 sem Idempotency-Key' PASSAR
    return res.status(400).json({ 
      error: 'Bad Request', 
      message: 'Idempotency-Key header is required' 
    });
  }

  next();
};