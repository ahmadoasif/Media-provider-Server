import {Request, Response} from 'express';
import path from 'path';
import fs from 'fs';
import multer from 'multer';
import { badRequestResponse, notFoundResponse, successResponse } from '../utils/apiResponses/apiResponses.js';
import { generateThumbnail } from '../utils/thumbnailProvider.js';

// Configure multer for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userName = req.params.userName as string;
    const folder = (req.body.folder as string) || '';
    const videosDir = path.join('C:', 'Users', userName, 'Videos', folder);

    // Ensure directory exists
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true });
    }

    cb(null, videosDir);
  },
  filename: (req, file, cb) => {
    // Keep original filename
    cb(null, file.originalname);
  }
});

export const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp4|mkv|avi|mov|wmv|webm/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only video files are allowed!'));
    }
  }
});
export const videosProvider = async (req: Request, res: Response) =>
{
    const userName = req.params.userName as string;

    if (!userName)
    {
        return badRequestResponse(res, 'User Name is required', null);
    }

    const videosDir = path.join('C:', 'Users', userName, 'Videos');
    const thumbnailsDir = path.join(process.cwd(), 'thumbnails');

    if (!fs.existsSync(videosDir))
    {
        return notFoundResponse(res, 'Videos directory not found.', null);
    }

    if (!fs.existsSync(thumbnailsDir))
    {
        fs.mkdirSync(thumbnailsDir);
    }

    const files = fs.readdirSync(videosDir)
        .filter(file => /\.(mp4|mkv|avi|mov)$/i.test(file));

    const videos = [];

    for (const file of files)
    {
        const videoPath = path.join(videosDir, file);
        const thumbName = file.replace(path.extname(file), '.jpg');
        const thumbPath = path.join(thumbnailsDir, thumbName);

        if (!fs.existsSync(thumbPath))
        {
            await generateThumbnail(videoPath, thumbPath);
        }

        videos.push({
            name: file,
            thumbnail: `/thumbnails/${thumbName}`
        });
    }

    return successResponse(res, 'Videos fetched successfully', videos);
};

export const videoUpload = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;
    const title = req.body.title as string;
    const folder = req.body.folder as string || '';

    if (!userName || !title) {
        return badRequestResponse(res, 'User name and title are required', null);
    }

    if (!req.file) {
        return badRequestResponse(res, 'Video file is required', null);
    }

    // File is already saved by multer to the correct directory
    const filePath = req.file.path;

    // Generate thumbnail
    const thumbnailsDir = path.join(process.cwd(), 'thumbnails');
    if (!fs.existsSync(thumbnailsDir)) {
        fs.mkdirSync(thumbnailsDir);
    }

    const thumbName = req.file.filename.replace(path.extname(req.file.filename), '.jpg');
    const thumbPath = path.join(thumbnailsDir, thumbName);

    try {
        await generateThumbnail(filePath, thumbPath);
    } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Continue without thumbnail
    }

    return successResponse(res, 'Video uploaded successfully', {
        filename: req.file.filename,
        path: filePath,
        thumbnail: `/thumbnails/${thumbName}`,
        title
    });
};
