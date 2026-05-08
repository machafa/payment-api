import crypto from 'crypto';
import { env } from '../config/env.js';

export const generateMpesaToken = (): string | null => {
    try {
        // A chave pública deve vir do teu env ou de um ficheiro de certificado
        const publicKey = env.MPESA_PUBLIC_KEY; 
        const apiKey = env.MPESA_API_KEY;

        const pk = `-----BEGIN PUBLIC KEY-----\n${publicKey}\n-----END PUBLIC KEY-----`;
        
        return crypto.publicEncrypt(
            { key: pk, padding: crypto.constants.RSA_PKCS1_PADDING },
            Buffer.from(apiKey)
        ).toString('base64');
    } catch (e:any) {
        console.error("Erro na Criptografia RSA:", e.message);
        return null;
    }
};