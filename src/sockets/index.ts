import { Server } from "socket.io";

export const initSocket = (server: any) => {
	const io = new Server(server);

	io.on("connection", (socket) => {
		socket.on("vote", (data) => {
			io.emit("voteUpdate", data);
		});
	});
};
