import app, { startServer } from '../src/app.js';

// Top-level await to ensure DB is connected before handling requests
// Vercel supports this in Node.js 18+ environments
try {
    await startServer();
    console.log("Serverless environment initialized");
} catch (error) {
    console.error("Failed to initialize serverless environment:", error);
}

export default app;
