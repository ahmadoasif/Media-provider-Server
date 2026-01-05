// import { Server } from "socket.io";
// import jwt from "jsonwebtoken";
// import { UserAndVendorChat } from "../models/UserAndVendorChat.js";
// import { VendorAndAdminChat } from "../models/VendorAndAdminChat.js";
// import { AdminVendorChat } from "../models/AdminVendorChat.js";

// interface JwtPayload {
//     userId: string;
//     role: string;
// }

// export const initSocket = (server: any) => {
//     const io = new Server(server, {
//         cors: {
//             origin: "*",
//             methods: ["GET", "POST"],
//         },
//     });

//     // Middleware to verify token
//     io.use((socket, next) => {
//         const token = socket.handshake.auth.token;

//         if (!token) return next(new Error("Authentication error"));

//         if (!process.env.JWT_SECRET) return next(new Error("JWT_SECRET missing"));

//         try {
//             const decoded = jwt.verify(token, process.env.JWT_SECRET) as JwtPayload;
//             socket.data.user = {
//                 userId: decoded.userId,
//                 role: decoded.role,
//             };
//             console.log("Token Holds: ", socket.data.user)
//             next();
//         } catch (err) {
//             next(new Error("Invalid token"));
//         }
//     });

//     io.on("connect", (socket) => {
//         console.log("Client connected:", socket.id);

//         socket.on("joinChat", (chatId: string) => {
//             socket.join(chatId);
//             console.log(`User ${socket.data.user.userId} joined chat ${chatId}`);
//         });

//         socket.on("leaveChat", (chatId: string) => {
//             socket.leave(chatId);
//             console.log(`User ${socket.data.user.userId} left chat ${chatId}`);
//         });

//         socket.on(
//             "send_message",
//             async ({ chatId, message }: { chatId: string; message: string }) => {
//                 const { userId, role } = socket.data.user;
//                 console.log(`message sent by ${userId}`)
//                 if (!chatId) return socket.emit("error", "Chat ID is required");
//                 if (!message || !message.trim()) return socket.emit("error", "Message is required");

//                 let chat = await UserAndVendorChat.findById(chatId);
//                 let chatType: "userVendor" | "vendorAdmin" | "adminVendor" | null = null;

//                 if (chat) chatType = "userVendor";
//                 else {
//                     chat = await VendorAndAdminChat.findById(chatId);
//                     if (chat) chatType = "vendorAdmin";
//                     else {
//                         chat = await AdminVendorChat.findById(chatId);
//                         if (chat) chatType = "adminVendor";
//                     }
//                 }

//                 if (!chat) return socket.emit("error", "Chat not found");

//                 let participants: string[] = [];
//                 if (chatType === "userVendor") {
//                     participants = [
//                         chat.userId.toString(),
//                         chat.vendorId.toString(),
//                     ];
//                 } else if (chatType === "vendorAdmin") {
//                     const adminChat = chat as typeof chat & { adminId: string; vendorId: string };
//                     participants = [adminChat.adminId.toString(), adminChat.vendorId.toString()];
//                 } else if (chatType === "adminVendor") {
//                     const adminChat = chat as typeof chat & { adminId: string; vendorId: string };
//                     participants = [adminChat.adminId.toString(), adminChat.vendorId.toString()];
//                 }

//                 if (!participants.includes(userId)) {
//                     return socket.emit("error", "Unauthorized: You are not part of this chat");
//                 }

//                 const msg = {
//                     sender: role,
//                     text: message,
//                     createdAt: new Date(),
//                     seen: false,
//                 };

//                 chat.messages.push(msg);
//                 chat.lastMessage = {
//                     text: message,
//                     sender: role,
//                     createdAt: new Date(),
//                 };

//                 await chat.save();

//                 io.to(chatId).emit("receive_message", {
//                     chatId,
//                     ...msg,
//                 });
//             }
//         );

//         socket.on("disconnect", () => {
//             console.log("Client disconnected:", socket.id);
//         });
//     });
// };
