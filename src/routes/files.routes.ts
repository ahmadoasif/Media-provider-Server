import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Root directory (change this to your actual data directory)
const ROOT_DIR = path.join(__dirname, '../../../uploads'); // Adjust path as needed

// Ensure root directory exists
if (!fs.existsSync(ROOT_DIR)) {
  fs.mkdirSync(ROOT_DIR, { recursive: true });
}

// GET /api/files - List files and folders in a directory
router.get('/', (req, res) => {
  try {
    const relativePath = req.query.path as string || '';
    const username = req.query.username as string;

    let rootDir = ROOT_DIR; // Default to uploads directory

    // If username is provided, use user's system directory
    if (username) {
      // Construct user-specific paths based on type (from path parameter)
      if (relativePath.includes('videos') || relativePath === '' || relativePath.startsWith('videos')) {
        // For videos, use C:\Users\{username}\Videos
        rootDir = `C:\\Users\\${username}\\Videos`;
      } else if (relativePath.includes('pictures') || relativePath.startsWith('pictures')) {
        // For pictures, use C:\Users\{username}\Pictures
        rootDir = `C:\\Users\\${username}\\Pictures`;
      } else {
        // Default to Videos directory for the user
        rootDir = `C:\\Users\\${username}\\Videos`;
      }

      // Ensure the root directory exists
      if (!fs.existsSync(rootDir)) {
        // Try to create it
        try {
          fs.mkdirSync(rootDir, { recursive: true });
        } catch (mkdirError) {
          console.warn(`Could not create directory ${rootDir}:`, mkdirError);
          // Fall back to uploads directory
          rootDir = ROOT_DIR;
        }
      }
    }

    // Validate and resolve the safe path
    const requestedPath = path.join(rootDir, relativePath);
    const safePath = path.resolve(requestedPath);

    // Security check: ensure the path is within the allowed root directory
    if (!safePath.startsWith(rootDir)) {
      return res.status(403).json({
        success: false,
        error: 'Access denied: Path traversal not allowed'
      });
    }

    // Check if directory exists
    if (!fs.existsSync(safePath)) {
      return res.status(404).json({
        success: false,
        error: `Directory not found: ${safePath}`
      });
    }

    // Read directory contents
    const items = fs.readdirSync(safePath, { withFileTypes: true })
      .map(item => ({
        name: item.name,
        type: item.isDirectory() ? 'folder' : 'file',
        path: relativePath ? `${relativePath}/${item.name}` : item.name
      }))
      .sort((a, b) => {
        // Sort folders first, then files alphabetically
        if (a.type !== b.type) {
          return a.type === 'folder' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });

    res.json({
      success: true,
      data: items,
      currentPath: relativePath,
      rootPath: rootDir,
      username: username
    });

  } catch (error) {
    console.error('Error reading directory:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// GET /api/files/serve - Serve files (videos and images)
router.get('/serve', (req, res) => {
  try {
    const username = req.query.username as string;
    const filePath = req.query.path as string;

    if (!username || !filePath) {
      return res.status(400).json({ success: false, error: 'Username and file path required' });
    }

    // Determine the root directory based on file path
    let rootDir = ROOT_DIR;
    if (username) {
      if (filePath.includes('pictures') || filePath.startsWith('pictures')) {
        rootDir = `C:\\Users\\${username}\\Pictures`;
      } else {
        // Default to Videos for any other path when username is provided
        rootDir = `C:\\Users\\${username}\\Videos`;
      }
    }

    // Resolve the full file path
    const fullPath = path.join(rootDir, filePath);

    // Security check: ensure the path is within the allowed directory
    const resolvedPath = path.resolve(fullPath);
    if (!resolvedPath.startsWith(rootDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Get file stats
    const stat = fs.statSync(resolvedPath);

    // Determine content type based on file extension
    const ext = path.extname(resolvedPath).toLowerCase();
    let contentType = 'application/octet-stream'; // default
    if (['.mp4', '.mkv', '.avi', '.mov'].includes(ext)) {
      contentType = 'video/mp4';
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      contentType = 'image/jpeg';
    } else if (ext === '.png') {
      contentType = 'image/png';
    } else if (ext === '.gif') {
      contentType = 'image/gif';
    } else if (ext === '.webp') {
      contentType = 'image/webp';
    } else if (ext === '.bmp') {
      contentType = 'image/bmp';
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stat.size);

    // Handle range requests for videos
    if (contentType.startsWith('video/')) {
      res.setHeader('Accept-Ranges', 'bytes');
      const range = req.headers.range;
      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;

        res.status(206);
        res.setHeader('Content-Range', `bytes ${start}-${end}/${stat.size}`);
        res.setHeader('Content-Length', chunksize);

        const stream = fs.createReadStream(resolvedPath, { start, end });
        stream.pipe(res);
      } else {
        // Stream the entire file
        const stream = fs.createReadStream(resolvedPath);
        stream.pipe(res);
      }
    } else {
      // For images and other files, send directly
      const stream = fs.createReadStream(resolvedPath);
      stream.pipe(res);
    }

  } catch (error) {
    console.error('Error serving file:', error);
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
});

// POST /api/files/create-folder - Create a new folder
router.post('/create-folder', (req, res) => {
  try {
    const { username, folderName } = req.body;

    if (!username || !folderName) {
      return res.status(400).json({
        success: false,
        error: 'Username and folderName are required'
      });
    }

    // Validate folder name (basic validation)
    if (folderName.includes('..') || folderName.includes('/') || folderName.includes('\\')) {
      return res.status(400).json({
        success: false,
        error: 'Invalid folder name'
      });
    }

    // Create the full path for the new folder
    const videosDir = `C:\\Users\\${username}\\Videos`;
    const newFolderPath = path.join(videosDir, folderName);

    // Check if Videos directory exists
    if (!fs.existsSync(videosDir)) {
      // Create Videos directory if it doesn't exist
      fs.mkdirSync(videosDir, { recursive: true });
    }

    // Check if folder already exists
    if (fs.existsSync(newFolderPath)) {
      return res.status(409).json({
        success: false,
        error: 'Folder already exists'
      });
    }

    // Create the new folder
    fs.mkdirSync(newFolderPath, { recursive: true });

    res.json({
      success: true,
      message: `Folder '${folderName}' created successfully`,
      folderName: folderName,
      folderPath: newFolderPath
    });

  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// Example: GET /api/files?path=videos
// Example: GET /api/files?path=documents/reports
// Example: GET /api/files/serve?username=ahmed&path=videos/sample.mp4
// Example: POST /api/files/create-folder

export default router;
