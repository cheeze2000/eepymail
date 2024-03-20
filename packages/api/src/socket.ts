import { WebSocket as WS, WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import normalize from "normalize-email";

import type Message from "~/models/Message";

interface WebSocket extends WS {
	id: string;
}

export default class {
	server!: WebSocketServer;

	start() {
		this.server = new WebSocketServer({ port: 9001 });

		this.server.on("connection", (ws: WebSocket) => {
			this.greet(ws);

			ws.on("message", (data: string) => {
				const message = JSON.parse(data) as Message;

				switch (message.kind) {
					case "subscribe":
						this.subscribe(ws, message.data);
						break;
					case "unsubscribe":
						this.unsubscribe(ws, message.data);
						break;
				}
			});
		});
	}

	private greet(ws: WebSocket) {
		ws.id = randomUUID();
		ws.send("connection established");
	}

	private subscribe(ws: WebSocket, email: string) {
		email = normalize(email);

		ws.send(`subscribed to ${email}`);
	}

	private unsubscribe(ws: WebSocket, email: string) {
		email = normalize(email);

		ws.send(`unsubscribed from ${email}`);
	}
};
