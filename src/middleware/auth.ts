import {Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';

export const authenticate=(req:Request,
    res:Response,
    next:NextFunction
): void =>{
    const auth_header=req.headers['authorization'];

    if(!auth_header|| !auth_header.startsWith('Bearer')){
        res.status(401).json({error:'Unauthorized - Bearer token required'});
        return;
    }
    
    const token=auth_header.split(' ')[1];

    if(token!==env.API_KEY){
        res.status(403).json({error:'Forbidden - Invalid API key'});
        return;
    }
    next();
}
