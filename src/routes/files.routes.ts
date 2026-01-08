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
    const type = req.query.type as string || 'videos'; // 'videos' or 'pictures'

    let rootDir = ROOT_DIR;

    if (username) {
      if (type === 'pictures') {
        rootDir = `C:\\Users\\${username}\\Pictures`;
      } else if (type === 'music') {
        rootDir = `C:\\Users\\${username}\\Music`;
      } else {
        rootDir = `C:\\Users\\${username}\\Videos`;
      }

      // Ensure the root directory exists
      if (!fs.existsSync(rootDir)) {
        try {
          fs.mkdirSync(rootDir, { recursive: true });
        } catch (mkdirError) {
          console.warn(`Could not create directory ${rootDir}:`, mkdirError);
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
      .map(item => {
        let size = 0;
        if (!item.isDirectory()) {
          try {
            const itemStat = fs.statSync(path.join(safePath, item.name));
            size = itemStat.size;
          } catch (e) { console.error(e); }
        }
        return {
          name: item.name,
          type: item.isDirectory() ? 'folder' : 'file',
          path: relativePath ? `${relativePath}/${item.name}` : item.name,
          size: size,
          createdAt: item.isDirectory() ? new Date() : fs.statSync(path.join(safePath, item.name)).birthtime
        };
      })
      .filter(item => item.name.toLowerCase() !== 'desktop.ini')
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
    const type = req.query.type as string || 'videos';

    if (!username || !filePath) {
      return res.status(400).json({ success: false, error: 'Username and file path required' });
    }

    // Determine root directory based on type
    let rootDir = `C:\\Users\\${username}\\Videos`;
    if (type === 'pictures') {
      rootDir = `C:\\Users\\${username}\\Pictures`;
    }

    // Resolve the file path
    const resolvedPath = path.resolve(path.join(rootDir, filePath));

    // Security check
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
    } else if (ext === '.mp3') {
      contentType = 'audio/mpeg';
    } else if (ext === '.wav') {
      contentType = 'audio/wav';
    } else if (ext === '.ogg') {
      contentType = 'audio/ogg';
    }

    // Handle range requests for video streaming
    if (contentType.startsWith('video/')) {
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : stat.size - 1;
        const chunksize = (end - start) + 1;

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${stat.size}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': contentType,
        });

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
    const { username, folderName, type } = req.body;

    if (!username || !folderName) {
      return res.status(400).json({
        success: false,
        error: 'Username and folderName are required'
      });
    }

    // Sanitize folder name (remove special characters)
    const safeFolderName = folderName.replace(/[^a-zA-Z0-9-_ ]/g, '');

    if (!safeFolderName) {
      return res.status(400).json({
        success: false,
        error: 'Invalid folder name'
      });
    }

    // Use user's directory based on type
    let rootDir = `C:\\Users\\${username}\\Videos`;
    if (type === 'pictures') {
      rootDir = `C:\\Users\\${username}\\Pictures`;
    } else if (type === 'music') {
      rootDir = `C:\\Users\\${username}\\Music`;
    }

    // Ensure root directory exists
    if (!fs.existsSync(rootDir)) {
      fs.mkdirSync(rootDir, { recursive: true });
    }

    const newFolderPath = path.join(rootDir, safeFolderName);

    // Check if folder already exists
    if (fs.existsSync(newFolderPath)) {
      return res.status(409).json({
        success: false,
        error: `Folder '${safeFolderName}' already exists`
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

// PUT /api/files/rename - Rename a file
router.put('/rename', (req, res) => {
  try {
    const { username, oldPath, newName, type } = req.body;

    if (!username || !oldPath || !newName) {
      return res.status(400).json({
        success: false,
        error: 'Username, oldPath, and newName are required'
      });
    }

    // Determine root directory based on type
    let rootDir = `C:\\Users\\${username}\\Videos`;
    if (type === 'pictures') {
      rootDir = `C:\\Users\\${username}\\Pictures`;
    } else if (type === 'music') {
      rootDir = `C:\\Users\\${username}\\Music`;
    }

    // Resolve old file path
    const oldFilePath = path.resolve(path.join(rootDir, oldPath));

    // Security check
    if (!oldFilePath.startsWith(rootDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if old file exists
    if (!fs.existsSync(oldFilePath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Get the directory and extension of the old file
    const directory = path.dirname(oldFilePath);
    const extension = path.extname(oldFilePath);

    // Create new file path with same extension
    const newFileName = newName.endsWith(extension) ? newName : `${newName}${extension}`;
    const newFilePath = path.join(directory, newFileName);

    // Check if new file name already exists
    if (fs.existsSync(newFilePath)) {
      return res.status(409).json({
        success: false,
        error: 'A file with this name already exists'
      });
    }

    // Rename the file
    fs.renameSync(oldFilePath, newFilePath);

    // Calculate new relative path
    const newRelativePath = path.relative(rootDir, newFilePath).replace(/\\/g, '/');

    res.json({
      success: true,
      message: 'File renamed successfully',
      newPath: newRelativePath,
      newName: newFileName
    });

  } catch (error) {
    console.error('Error renaming file:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/files/bulk-delete - Delete multiple files
router.delete('/bulk-delete', (req, res) => {
  try {
    const { username, paths, type } = req.body;

    if (!username || !paths || !Array.isArray(paths)) {
      return res.status(400).json({ success: false, error: 'Username and paths array required' });
    }

    const results = {
      success: [] as string[],
      failed: [] as { path: string, error: string }[]
    };

    for (const filePath of paths) {
      try {
        // Determine root directory based on type
        let rootDir = `C:\\Users\\${username}\\Videos`;
        if (type === 'pictures') {
          rootDir = `C:\\Users\\${username}\\Pictures`;
        } else if (type === 'music') {
          rootDir = `C:\\Users\\${username}\\Music`;
        }

        // Resolve the file path
        const resolvedPath = path.resolve(path.join(rootDir, filePath));

        // Security check
        if (!resolvedPath.startsWith(rootDir)) {
          results.failed.push({ path: filePath, error: 'Access denied' });
          continue;
        }

        // Check if file exists
        if (!fs.existsSync(resolvedPath)) {
          results.failed.push({ path: filePath, error: 'File not found' });
          continue;
        }

        // Delete the file
        fs.unlinkSync(resolvedPath);
        results.success.push(filePath);
      } catch (err: any) {
        results.failed.push({ path: filePath, error: err.message });
      }
    }

    res.json({
      success: results.failed.length === 0,
      results
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// DELETE /api/files/delete - Delete a file
router.delete('/delete', (req, res) => {
  try {
    const username = req.query.username as string;
    const filePath = req.query.path as string;
    const type = req.query.type as string || 'videos';

    if (!username || !filePath) {
      return res.status(400).json({ success: false, error: 'Username and file path required' });
    }

    // Determine root directory based on type
    let rootDir = `C:\\Users\\${username}\\Videos`;
    if (type === 'pictures') {
      rootDir = `C:\\Users\\${username}\\Pictures`;
    } else if (type === 'music') {
      rootDir = `C:\\Users\\${username}\\Music`;
    }

    // Resolve the file path
    const resolvedPath = path.resolve(path.join(rootDir, filePath));

    // Security check
    if (!resolvedPath.startsWith(rootDir)) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    // Check if file exists
    if (!fs.existsSync(resolvedPath)) {
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // Delete the file
    fs.unlinkSync(resolvedPath);

    res.json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting file:', error);
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
// Example: PUT /api/files/rename
// Example: DELETE /api/files/delete?username=ahmed&path=videos/sample.mp4

export default router;
