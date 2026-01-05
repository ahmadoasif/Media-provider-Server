import { exec } from 'child_process';

export const generateThumbnail = (videoPath: string, thumbnailPath: string) =>
{
    return new Promise((resolve, reject) =>
    {
        const cmd = `ffmpeg -ss 00:00:02 -i "${videoPath}" -frames:v 1 "${thumbnailPath}"`;

        exec(cmd, (error) =>
        {
            if (error) reject(error);
            else resolve(true);
        });
    });
};
