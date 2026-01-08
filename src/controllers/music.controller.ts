import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { badRequestResponse, notFoundResponse, successResponse } from '../utils/apiResponses/apiResponses.js';

// Configure multer for music uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const userName = req.params.userName as string;
        const folder = (req.body.folder as string) || '';
        const musicDir = path.join('C:', 'Users', userName, 'Music', folder);

        // Ensure directory exists
        if (!fs.existsSync(musicDir)) {
            fs.mkdirSync(musicDir, { recursive: true });
        }

        cb(null, musicDir);
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

export const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit per song
    fileFilter: (req, file, cb) => {
        const allowedTypes = /mp3|wav|ogg|flac|m4a|aac/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        // mimetype check might be tricky for some audio formats, relying mostly on extension
        const mimetype = file.mimetype.startsWith('audio/') || file.mimetype === 'application/octet-stream';

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'));
        }
    }
});

export const musicProvider = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;

    if (!userName) {
        return badRequestResponse(res, 'User Name is required', null);
    }

    const musicDir = path.join('C:', 'Users', userName, 'Music');

    if (!fs.existsSync(musicDir)) {
        return notFoundResponse(res, 'Music directory not found.', null);
    }

    // Recursive function to get all music files
    const getMusicFiles = (dir: string, fileList: any[] = []) => {
        const files = fs.readdirSync(dir);
        for (const file of files) {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat.isDirectory()) {
                getMusicFiles(filePath, fileList);
            } else {
                if (/\.(mp3|wav|ogg|flac|m4a|aac)$/i.test(file)) {
                    fileList.push({
                        name: file,
                        path: path.relative(path.join('C:', 'Users', userName, 'Music'), filePath).replace(/\\/g, '/'),
                        size: stat.size,
                        createdAt: stat.birthtime
                    });
                }
            }
        }
        return fileList;
    };

    try {
        const music = getMusicFiles(musicDir).map((item, index) => ({
            id: `${userName}-music-${index}`,
            title: item.name,
            path: item.path, // Relative path for serving
            size: item.size,
            createdAt: item.createdAt
        }));
        return successResponse(res, 'Music fetched successfully', music);
    } catch (error) {
        console.error('Error fetching music:', error);
        return successResponse(res, 'Music fetched (empty or error)', []);
    }
};

export const musicUpload = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;
    const title = req.body.title as string;

    if (!userName || !title) {
        return badRequestResponse(res, 'User name and title are required', null);
    }

    if (!req.file) {
        return badRequestResponse(res, 'Music file is required', null);
    }

    return successResponse(res, 'Music uploaded successfully', {
        filename: req.file.filename,
        path: req.file.path,
        title
    });
};
