import {Request, Response} from 'express';
import path from 'path';
import fs from 'fs';
import { badRequestResponse, notFoundResponse, successResponse } from '../utils/apiResponses/apiResponses.js';

export const picsProvider = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    if (!userName) {
        return badRequestResponse(res, 'User Name is required', null);
    }

    const picsDir = path.join('C:', 'Users', userName, 'Pictures');

    try {
        await fs.promises.access(picsDir);
    } catch (error) {
        return notFoundResponse(res, 'Pictures directory not found.', null);
    }

    const allFiles = await fs.promises.readdir(picsDir);
    const picFiles = allFiles.filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file));
    
    const totalPics = picFiles.length;
    const pagedFiles = picFiles.slice(skip, skip + limit);

    const pictures = await Promise.all(pagedFiles.map(async (file, index) => {
        const filePath = path.join(picsDir, file);
        let createdAt = new Date().toISOString();
        try {
            const stats = await fs.promises.stat(filePath);
            createdAt = stats.birthtime.toISOString();
        } catch (e) {
            console.error(`Error getting stats for ${file}:`, e);
        }
        
        return {
            id: `${userName}-pic-${skip + index}`,
            title: file,
            path: `pictures/${file}`,
            createdAt: createdAt
        };
    }));

    return res.status(200).json({
        success: true,
        message: 'Pictures fetched successfully',
        data: pictures,
        pagination: {
            total: totalPics,
            page,
            limit,
            totalPages: Math.ceil(totalPics / limit)
        }
    });
};
