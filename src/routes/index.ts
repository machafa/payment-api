import { Router } from 'express';
import * as paymentController from '../modules/payments/payment_controller.js';
import * as webhookController from '../webhooks/webhook_controller.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Health check — sem autenticação
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
  });
});

// Rotas de pagamentos — com autenticação
router.post('/payments', authenticate, paymentController.createPayment);
router.get('/payments/:id', authenticate, paymentController.getPayment);

// Webhook — sem autenticação (chamado pelo M-Pesa)
router.post('/webhooks/provider', webhookController.handleWebhook);

export default router;