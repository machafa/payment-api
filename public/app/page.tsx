'use client';

import React, { useState, FormEvent } from 'react';

// Mapeamento de erros do M-Pesa
const ERROR_MAP: Record<string, string> = {
  'INS-10': 'Pedido já enviado.',
  'INS-6': 'Transacção recusada.',
  'INS-2051': 'Número inválido.',
  'INS-2006': 'Saldo insuficiente.',
  'INS-5': 'Serviço temporariamente indisponível.',
};

const API_URL = 'https://payment-api-p1ta.onrender.com/api/v1/payments';

export default function PaymentPage() {
  const [phone, setPhone] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Estado para gerir o feedback visível
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    setLoading(true);
    setMessage(null);
    setPaymentId(null);

    const fullPhone = `258${phone}`;
    const formattedAmount = parseFloat(amount);
    const reference = `TXN_${Date.now()}`;

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Idempotency-Key': crypto.randomUUID(),
        },
        body: JSON.stringify({
          amount: formattedAmount,
          currency: 'MZN',
          method: 'MPESA',
          customer_msisdn: fullPhone,
          transaction_reference: reference,
          third_party_reference: reference,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: 'success', text: 'Verifique o seu telemóvel!' });
        if (data.payment_id) {
          setPaymentId(data.payment_id);
        }
        // Reset dos inputs
        setPhone('');
        setAmount('');
      } else {
        const code = data.code || '';
        const errorText = ERROR_MAP[code] || data.error || 'Erro ao processar.';
        setMessage({ type: 'error', text: errorText });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Servidor offline.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="bg-white flex items-center justify-center min-h-screen antialiased">
      <div className="w-full max-w-sm bg-white p-8 shadow-xl border border-gray-100">
        <h2 className="text-[#000000] text-xl font-bold mb-6 text-center">
          Pagamento M-Pesa
        </h2>

        {/* Bloco de Mensagens Reativo */}
        {message && (
          <div
            className={`text-center text-sm font-medium p-2 mb-4 rounded ${
              message.type === 'success'
                ? 'text-green-600 bg-green-50'
                : 'text-red-600 bg-red-50'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
              258
            </span>
            <input
              type="tel"
              maxLength={9}
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))} // Apenas números
              className="w-full pl-14 pr-5 py-4 bg-gray-50 focus:ring-2 focus:ring-[#000000] outline-none text-[#000000] font-medium"
              placeholder="8XXXXXXXX"
              disabled={loading}
            />
          </div>

          <div>
            <input
              type="number"
              step="0.01"
              min="1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-6 py-4 bg-gray-50 focus:ring-2 focus:ring-[#000000] outline-none text-[#000000] font-medium"
              placeholder="Valor (MZN)"
              disabled={loading}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#c30010] text-white py-4 font-bold shadow-xl shadow-blue-100 active:scale-95 transition-all disabled:opacity-70 disabled:scale-100"
          >
            {loading ? 'A processar...' : 'Confirmar Pagamento'}
          </button>
        </form>

        {/* Exibição do ID de Pagamento */}
        {paymentId && (
          <p className="text-center text-xs text-gray-400 mt-4 font-mono">
            ID: {paymentId}
          </p>
        )}
      </div>
    </main>
  );
}