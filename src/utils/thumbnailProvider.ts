import { exec } from 'child_process';

type Task = {
    videoPath: string;
    thumbnailPath: string;
    resolve: (value: unknown) => void;
    reject: (reason?: any) => void;
};

const queue: Task[] = [];
let activeTasks = 0;
const MAX_CONCURRENT = 2;

const processQueue = () => {
    if (activeTasks >= MAX_CONCURRENT || queue.length === 0) return;

    const task = queue.shift()!;
    activeTasks++;

    const cmd = `ffmpeg -ss 00:00:02 -i "${task.videoPath}" -frames:v 1 "${task.thumbnailPath}"`;

    exec(cmd, (error) => {
        activeTasks--;
        if (error) task.reject(error);
        else task.resolve(true);
        processQueue();
    });
};

export const generateThumbnail = (videoPath: string, thumbnailPath: string) => {
    return new Promise((resolve, reject) => {
        queue.push({ videoPath, thumbnailPath, resolve, reject });
        processQueue();
    });
};
