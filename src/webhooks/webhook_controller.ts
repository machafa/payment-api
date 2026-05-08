import { Request,Response,NextFunction, response } from "express";
import * as WebhookService from "./webhooks_services.js";
import { webhookPayload } from '../modules/payments/payment_types.js';

export const handleWebhook=async(
    req:Request,
    res:Response,
    next:NextFunction):Promise<void> =>{
        try{
            const payload:webhookPayload=req.body;

            //make sure we have all required fields
            if(!payload.output_ResponseCode||!payload.output_ThirdPartyReference){
                res.status(400).json({error:'Invalid payload'});
                return;
            }

            //log the received webhooks
            console.log('Received webhook:',{
                response_code:payload.output_ResponseCode,
                transaction_id:payload.output_TransactionID,
                third_party_reference:payload.output_ThirdPartyReference,
            });

            //process the webhook
            await WebhookService.processWebhook(payload);

            //respond with 200 OK - mandatory for M-Pesa to consider the webhook delivered
            res.status(200).json({message:'Webhook processed successfully'});
        }catch(error){
            next(error);
        }
    };