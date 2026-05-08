import { Router } from 'express';
import * as paymentController from '../modules/payments/payment_controller.js';
import * as webhookController from '../webhooks/webhook_controller.js';
import { authenticate } from '../middleware/auth.js';
import { validateIdempotency } from '../middleware/idempotencia.js';

const router = Router();

// Health check — sem autenticação
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

router.post(
  '/payments', 
  authenticate, 
  validateIdempotency, // validates the header'
  paymentController.createPayment
);

// payment routes with auth
router.get('/payments/:id', authenticate, paymentController.getPayment);
router.post('/payments/callback', paymentController.handleCallback);

// Webhook called by mpesa without auth
router.post('/webhooks/provider', webhookController.handleWebhook);

export default router;