import http from "http";
import app, { startServer } from "./app.js";
// import { initSocket } from "./socket/chat.socket.js";

await startServer();

const server = http.createServer(app);

// initSocket(server);

server.listen(process.env.PORT || 5000, () => {
    console.log("Server running on", process.env.PORT || 5000);
});
