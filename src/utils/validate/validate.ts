import joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { badRequestResponse } from '../apiResponses/apiResponses.js';

export const validate = (schema : joi.ObjectSchema) => {
    return (req: Request, res: Response, next: NextFunction)=>{
        const { error } = schema.validate(req.body);
        if(error){
            return badRequestResponse(res, error.details[0].message, null);
        }
        next()
    }
}