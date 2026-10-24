"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocket = void 0;
const socket_io_1 = require("socket.io");
const initSocket = (server) => {
    const io = new socket_io_1.Server(server);
    io.on("connection", (socket) => {
        socket.on("vote", (data) => {
            io.emit("voteUpdate", data);
        });
    });
};
exports.initSocket = initSocket;
