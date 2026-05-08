-- 1. Tabela de Clientes (Simples, conforme pediste)
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 2. Tabela de Sessões
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    token TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Pagamentos (Inspirada no teu Payment Interface)
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL, -- Ligação opcional se for guest
    
    -- Dados do createPaymentDTO
    amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'MZN',
    method VARCHAR(20) NOT NULL DEFAULT 'MPESA', -- paymentMethod
    customer_msisdn VARCHAR(20) NOT NULL,
    transaction_reference VARCHAR(100) NOT NULL,
    third_party_reference VARCHAR(100) NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,

    -- Dados do updatePaymentDTO / Webhook
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, COMPLETED, FAILED
    mpesa_transaction_id VARCHAR(100),
    mpesa_conversation_id VARCHAR(100),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Trigger para atualizar o 'updated_at' automaticamente (Padrão SQL)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_payment_modtime
    BEFORE UPDATE ON payments
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();