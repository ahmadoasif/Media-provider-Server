import { Request, Response } from 'express';

export interface IApiResponse<T> {
    status: number;
    message?: string;
    data?: T | null;
    success: boolean
}
export const successResponse = (res:Response, message: string, data: any,) => {
    return res.status(200).json({
        status: 200,
        message,
        data,
        success: true
    })
}
export const createdResponse = (res:Response, message: string, data:any) => {
    return res.status(201).json({
        status: 201,
        message,
        data,
        success: true
    })
}
export const conflictResponse = (res: Response, message: string, data: any ) => {
    return res.status(409).json({
        status: 409,
        message,
        data,
        success: false
        
    })
}
export const forbiddenResponse = (res: Response, message: string, data: any ) => {
    return res.status(403).json({
        status: 403,
        message,
        data,
        success: false
        
    })
}
export const notFoundResponse = (res: Response, message: string, data: any) => {
    return res.status(404).json({
        status: 404,
        message,
        data,
        success: false
    })
}
export const serverErrorResponse = (res: Response, data: any)=>{
    return res.status(500).json({
        status: 500,
        message: 'Internal Server Error',
        data,
        success: false
    })
}
export const unAuthorizedResponse = (res: Response, message: string, data: any)=>{
    return res.status(401).json({
        status: 401,
        message,
        data,
        success: false
    })
}
export const badRequestResponse = (res: Response, message: string, data: any)=>{
    return res.status(400).json({
        status: 400,
        message,
        data,
        success: false
    })
    
}
export const notModifiedResponse = (res: Response, message: string, data: any)=>{
    return res.status(304).json({
        status: 304,
        message,
        data,
        success: false
    })
    
}