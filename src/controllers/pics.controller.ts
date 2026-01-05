import {Request, Response} from 'express';
import path from 'path';
import fs from 'fs';
import { badRequestResponse, notFoundResponse, successResponse } from '../utils/apiResponses/apiResponses.js';

export const picsProvider = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;

    if (!userName) {
        return badRequestResponse(res, 'User Name is required', null);
    }

    const picsDir = path.join('C:', 'Users', userName, 'Pictures');

    if (!fs.existsSync(picsDir)) {
        return notFoundResponse(res, 'Pictures directory not found.', null);
    }

    const files = fs.readdirSync(picsDir)
        .filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file));

    const pictures = files.map((file, index) => {
        const filePath = path.join(picsDir, file);
        const stats = fs.statSync(filePath);
        return {
            id: `${userName}-pic-${index}`,
            title: file,
            path: `pictures/${file}`,
            createdAt: stats.birthtime.toISOString()
        };
    });

    return successResponse(res, 'Pictures fetched successfully', pictures);
};
