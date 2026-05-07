import {Request, Response, NextFunction } from 'express';
interface AppError extends Error{
    status?:number;
}

export const errorHandler=(
    error:AppError,
    req:Request,
    res:Response,
    next:NextFunction
): void => {

    console.error('Error:',{
        massage:error.message,
        stack:error.stack,
        path:req.path,
        method:req.method,
    });

    const status=error.status||500;
    const message=status===500?'Internal server error':error.message;

    res.status(status).json({
        error: message,
        path: req.path,
        timestamp: new Date().toISOString(),
    });
};