import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import multer from 'multer';
import { spawn } from 'child_process';
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
export const videosProvider = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;

    if (!userName) {
        return badRequestResponse(res, 'User Name is required', null);
    }

    const videosDir = path.join('C:', 'Users', userName, 'Videos');
    const thumbnailsDir = path.join(process.cwd(), 'thumbnails');

    try {
        await fs.promises.access(videosDir);
    } catch (error) {
        return notFoundResponse(res, 'Videos directory not found.', null);
    }

    if (!fs.existsSync(thumbnailsDir)) {
        await fs.promises.mkdir(thumbnailsDir, { recursive: true });
    }

    const allFiles = await fs.promises.readdir(videosDir);
    const videoFiles = allFiles.filter(file => /\.(mp4|mkv|avi|mov)$/i.test(file));
    
    const totalVideos = videoFiles.length;
    const pagedFiles = videoFiles.slice(skip, skip + limit);

    const videos = await Promise.all(pagedFiles.map(async (file) => {
        const videoPath = path.join(videosDir, file);
        const thumbName = file.replace(path.extname(file), '.jpg');
        const thumbPath = path.join(thumbnailsDir, thumbName);

        // Check if thumbnail exists asynchronously
        let hasThumbnail = false;
        try {
            await fs.promises.access(thumbPath);
            hasThumbnail = true;
        } catch (e) {
            // Thumbnail doesn't exist, trigger generation in background
            generateThumbnail(videoPath, thumbPath).catch(err => {
                console.error(`Background thumbnail generation failed for ${file}:`, err);
            });
        }

        return {
            name: file,
            thumbnail: `/thumbnails/${thumbName}`,
            hasThumbnail: hasThumbnail
        };
    }));

    return res.status(200).json({
        success: true,
        message: 'Videos fetched successfully',
        data: videos,
        pagination: {
            total: totalVideos,
            page,
            limit,
            totalPages: Math.ceil(totalVideos / limit)
        }
    });
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

export const videoDownloadFromUrl = async (req: Request, res: Response) => {
    const userName = req.params.userName as string;
    const { url, title, quality = 'best', folder = '', downloadId } = req.body;

    if (!userName || !url || !title) {
        return badRequestResponse(res, 'User name, URL, and title are required', null);
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return badRequestResponse(res, 'Invalid URL format', null);
    }

    // Validate quality (allow any quality string)
    if (!quality || typeof quality !== 'string') {
        return badRequestResponse(res, 'Quality is required', null);
    }

    // Use provided downloadId or generate new one
    const finalDownloadId = downloadId || crypto.randomUUID();
    const videosDir = path.join('C:', 'Users', userName, 'Videos', folder);

    // Ensure directory exists
    if (!fs.existsSync(videosDir)) {
        fs.mkdirSync(videosDir, { recursive: true });
    }

    // Initialize download progress
    activeDownloads.set(finalDownloadId, {
        progress: 0,
        status: 'downloading',
        statusText: 'Starting download...'
    });

    try {
        // Clean YouTube URLs by extracting video ID
        let cleanUrl = url;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                // Short URL like https://youtu.be/VIDEO_ID
                cleanUrl = `https://www.youtube.com/watch?v=${urlObj.pathname.slice(1)}`;
            } else if (urlObj.hostname.includes('youtube.com')) {
                // Regular URL, extract just video ID
                const videoId = urlObj.searchParams.get('v');
                if (videoId) {
                    cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }
        }

        // Determine format based on quality
        let format = 'best';
        if (quality !== 'best') {
            // Extract height from quality (e.g., '720p' -> 720)
            const heightMatch = quality.match(/^(\d+)p$/);
            if (heightMatch) {
                const height = parseInt(heightMatch[1]);
                format = `best[height<=${height}]`;
            }
        }

        console.log(`Download - Original URL: ${url}`);
        console.log(`Download - Clean URL: ${cleanUrl}`);

        // Start download using yt-dlp directly
        const downloadProcess = spawn(path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe'), [cleanUrl, '-o', path.join(videosDir, '%(title)s.%(ext)s'), '-f', format], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let stderrData = '';
        downloadProcess.stderr?.on('data', (data: Buffer) => {
            stderrData += data.toString();
        });

        // Handle progress with SSE updates
        let lastProgress = 0;
        downloadProcess.stdout?.on('data', (data: Buffer) => {
            const output = data.toString();

            // Check for Merging state
            if (output.includes('[Merger]') || output.includes('Merging formats')) {
                const downloadData = {
                    progress: 100, // Merging usually implies download is done
                    status: 'merging' as const,
                    statusText: 'Merging video and audio...'
                };
                activeDownloads.set(finalDownloadId, downloadData);
                console.log(`Download ${finalDownloadId}: Merging...`);
                return;
            }

            // Check for Audio Extraction/Processing state
            if (output.includes('[ExtractAudio]') || output.includes('Destination:')) {
                // Keep previous progress or set to 100 if it's post-processing
                // For audio extraction, it's usually at the end
                return;
            }

            // Extract progress percentage
            const progressMatch = output.match(/\[download\]\s+(\d+(?:\.\d+)?)%/);
            if (progressMatch) {
                const progress = Math.round(parseFloat(progressMatch[1]));
                // Only update if progress increases or if we are starting a new component (e.g. audio after video)
                // ideally we'd want to handle multiple files (video=50%, audio=50%) but yt-dlp reports 0-100 for each.
                // For now, we'll let it bounce but rely on statusText if possible, or just accept the bounce.
                // To avoid confusing users, maybe we check if we were already at 100?

                // Extract speed and ETA if available
                const speedMatch = output.match(/at\s+([\d.]+\s*\w+\/s)/);
                const etaMatch = output.match(/ETA\s+([\d:]+)/);

                const downloadData = {
                    progress,
                    speed: speedMatch ? speedMatch[1] : undefined,
                    eta: etaMatch ? etaMatch[1] : undefined,
                    status: 'downloading' as const,
                    statusText: `Downloading... ${progress}%`
                };

                activeDownloads.set(finalDownloadId, downloadData);
                console.log(`Download ${finalDownloadId}: ${progress}%`);
            }
        });

        // Wait for download to complete
        await new Promise((resolve, reject) => {
            downloadProcess.on('close', (code) => {
                if (code === 0) {
                    // Mark download as completed
                    const completionData = {
                        progress: 100,
                        speed: "Complete",
                        status: 'completed' as const,
                        statusText: 'Download completed successfully'
                    };
                    activeDownloads.set(finalDownloadId, completionData);
                    console.log(`Download ${finalDownloadId} completed successfully`);

                    // Clean up the download data after 30 seconds
                    setTimeout(() => {
                        activeDownloads.delete(finalDownloadId);
                        console.log(`Cleaned up download data for ${finalDownloadId}`);
                    }, 30000);

                    resolve(true);
                } else {
                    activeDownloads.set(finalDownloadId, {
                        progress: 0,
                        status: 'error',
                        statusText: 'Download failed'
                    });
                    reject(new Error(`yt-dlp exited with code ${code}: ${stderrData}`));
                }
            });

            downloadProcess.on('error', (error) => {
                activeDownloads.set(finalDownloadId, {
                    progress: 0,
                    status: 'error',
                    statusText: 'Process error'
                });
                reject(error);
            });
        });

        // Wait a bit for yt-dlp to finish merging files if needed
        await new Promise(resolve => setTimeout(resolve, 3000));

        // Find the downloaded file (yt-dlp will name it based on title)
        // Look for files modified in the last 5 minutes to account for merging time
        const files = await fs.promises.readdir(videosDir);
        const fileStats = await Promise.all(
            files.map(async (file) => ({
                file,
                stat: await fs.promises.stat(path.join(videosDir, file))
            }))
        );
        
        const downloadedFiles = fileStats
            .filter(item => item.stat.mtime > new Date(Date.now() - 300000))
            .sort((a, b) => b.stat.mtime.getTime() - a.stat.mtime.getTime())
            .map(item => item.file);

        // Find the main video file (usually .mp4)
        const downloadedFile = downloadedFiles.find(file =>
            file.endsWith('.mp4') || file.endsWith('.webm') || file.endsWith('.mkv')
        ) || downloadedFiles[0];

        if (!downloadedFile) {
            return badRequestResponse(res, 'Download completed but video file not found', null);
        }

        const filePath = path.join(videosDir, downloadedFile);

        // Generate thumbnail
        const thumbnailsDir = path.join(process.cwd(), 'thumbnails');
        if (!fs.existsSync(thumbnailsDir)) {
            fs.mkdirSync(thumbnailsDir);
        }

        const thumbName = downloadedFile.replace(path.extname(downloadedFile), '.jpg');
        const thumbPath = path.join(thumbnailsDir, thumbName);

        try {
            await generateThumbnail(filePath, thumbPath);
        } catch (error) {
            console.error('Error generating thumbnail:', error);
            // Continue without thumbnail
        }

        return successResponse(res, 'Video downloaded successfully', {
            filename: downloadedFile,
            path: filePath,
            thumbnail: `/thumbnails/${thumbName}`,
            title,
            quality,
            downloadId: finalDownloadId
        });

    } catch (error: any) {
        console.error('Download error:', error);
        return badRequestResponse(res, `Download failed: ${error.message || 'Unknown error'}`, null);
    }
};

// Store active downloads for progress tracking
const activeDownloads = new Map<string, {
    progress: number;
    speed?: string;
    eta?: string;
    status: 'downloading' | 'merging' | 'completed' | 'error';
    statusText?: string;
}>();

export const getVideoInfo = async (req: Request, res: Response) => {
    const { url } = req.body;

    if (!url) {
        return badRequestResponse(res, 'URL is required', null);
    }

    // Validate URL format
    try {
        new URL(url);
    } catch {
        return badRequestResponse(res, 'Invalid URL format', null);
    }

    try {
        // Clean YouTube URLs by extracting video ID
        let cleanUrl = url;
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            const urlObj = new URL(url);
            if (urlObj.hostname === 'youtu.be') {
                // Short URL like https://youtu.be/VIDEO_ID
                cleanUrl = `https://www.youtube.com/watch?v=${urlObj.pathname.slice(1)}`;
            } else if (urlObj.hostname.includes('youtube.com')) {
                // Regular URL, extract just video ID
                const videoId = urlObj.searchParams.get('v');
                if (videoId) {
                    cleanUrl = `https://www.youtube.com/watch?v=${videoId}`;
                }
            }
        }

        console.log(`Original URL: ${url}`);
        console.log(`Clean URL: ${cleanUrl}`);

        // Use yt-dlp to get video info without downloading
        const infoProcess = spawn(path.join(process.cwd(), 'node_modules', 'yt-dlp-exec', 'bin', 'yt-dlp.exe'), ['--dump-json', cleanUrl], {
            stdio: ['pipe', 'pipe', 'pipe']
        });

        let jsonData = '';
        let stderrData = '';

        infoProcess.stdout?.on('data', (data: Buffer) => {
            jsonData += data.toString();
        });

        infoProcess.stderr?.on('data', (data: Buffer) => {
            stderrData += data.toString();
        });

        await new Promise((resolve, reject) => {
            infoProcess.on('close', (code) => {
                if (code === 0) {
                    resolve(true);
                } else {
                    reject(new Error(`yt-dlp exited with code ${code}: ${stderrData}`));
                }
            });

            infoProcess.on('error', (error) => {
                reject(error);
            });
        });

        // Parse the JSON data
        const videoInfo = JSON.parse(jsonData);

        // Extract title
        const title = videoInfo.title || 'Unknown Title';

        // Extract available formats with quality info
        const formats = videoInfo.formats || [];

        // Group formats by quality/resolution
        const qualityOptions = [];
        const seenQualities = new Set();

        for (const format of formats) {
            if (format.height && format.ext === 'mp4') {
                const quality = `${format.height}p`;
                if (!seenQualities.has(quality)) {
                    seenQualities.add(quality);
                    qualityOptions.push({
                        value: quality,
                        label: `${quality} (${format.width}x${format.height})`,
                        height: format.height,
                        filesize: format.filesize || format.filesize_approx
                    });
                }
            }
        }

        // Add 'best' option
        qualityOptions.unshift({
            value: 'best',
            label: 'Best Quality',
            height: null,
            filesize: null
        });

        // Sort by height (best first, then descending)
        qualityOptions.sort((a, b) => {
            if (a.value === 'best') return -1;
            if (b.value === 'best') return 1;
            return (b.height || 0) - (a.height || 0);
        });

        return successResponse(res, 'Video info retrieved successfully', {
            title,
            qualities: qualityOptions,
            duration: videoInfo.duration,
            uploader: videoInfo.uploader,
            thumbnail: videoInfo.thumbnail
        });

    } catch (error: any) {
        console.error('Video info error:', error);
        return badRequestResponse(res, `Failed to get video info: ${error.message || 'Unknown error'}`, null);
    }
};

export const downloadProgress = (req: Request, res: Response) => {
    const downloadId = req.params.downloadId;

    if (!downloadId) {
        return badRequestResponse(res, 'Download ID is required', null);
    }

    console.log(`SSE connection established for download: ${downloadId}`);

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Cache-Control');

    // Send initial data
    const download = activeDownloads.get(downloadId);
    if (download) {
        res.write(`data: ${JSON.stringify(download)}\n\n`);
        console.log(`Sent initial progress for ${downloadId}:`, download);
    } else {
        res.write(`data: ${JSON.stringify({ progress: 0, status: 'waiting' })}\n\n`);
        console.log(`Sent initial waiting status for ${downloadId}`);
    }

    // Set up interval to send updates
    const progressInterval = setInterval(() => {
        const currentDownload = activeDownloads.get(downloadId);
        if (currentDownload) {
            try {
                res.write(`data: ${JSON.stringify(currentDownload)}\n\n`);
                console.log(`Sent progress update for ${downloadId}:`, currentDownload);

                // If download is completed or errored, we can stop sending updates
                if (currentDownload.status === 'completed' || currentDownload.status === 'error') {
                    console.log(`Download ${downloadId} finished with status: ${currentDownload.status}`);
                }
            } catch (error) {
                console.error(`Error sending progress update for ${downloadId}:`, error);
                clearInterval(progressInterval);
            }
        }
    }, 1000); // Send updates every second

    // Keep connection alive with comments
    const keepAlive = setInterval(() => {
        try {
            res.write(': keepalive\n\n');
        } catch (error) {
            console.error('Error sending keepalive:', error);
            clearInterval(keepAlive);
            clearInterval(progressInterval);
        }
    }, 30000);

    // Clean up on client disconnect
    req.on('close', () => {
        console.log(`SSE connection closed for download: ${downloadId}`);
        clearInterval(keepAlive);
        clearInterval(progressInterval);
    });

    req.on('error', (error) => {
        console.error(`SSE request error for ${downloadId}:`, error);
        clearInterval(keepAlive);
        clearInterval(progressInterval);
    });
};
