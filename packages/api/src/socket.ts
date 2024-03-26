import { WebSocket as WS, WebSocketServer } from "ws";
import { randomUUID } from "node:crypto";
import normalize from "normalize-email";

import Mail from "~/models/Mail";
import type Message from "~/models/Message";

interface WebSocket extends WS {
	id: string;
	subscriptions: Set<string>;
}

export default class {
	server!: WebSocketServer;
	connections: Map<string, WebSocket>;

	constructor() {
		this.connections = new Map();
	}

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

			ws.on("close", () => {
				this.connections.delete(ws.id);
			});
		});
	}

	alertSubscribers(mail: Mail) {
		for (const ws of this.connections.values()) {
			if (mail.recipients.map(r => r.address).every(email => !ws.subscriptions.has(email))) {
				return;
			}

			ws.send(JSON.stringify(mail));
		}
	}

	private greet(ws: WebSocket) {
		ws.id = randomUUID();
		ws.subscriptions = new Set();
		this.connections.set(ws.id, ws);

		ws.send("connection established");
	}

	private subscribe(ws: WebSocket, email: string) {
		email = normalize(email);

		if (this.validate(email)) {
			ws.subscriptions.add(email);
			ws.send(`subscribed to ${email}`);
		} else {
			ws.send(`failed to subscribe to ${email}`);
		}
	}

	private unsubscribe(ws: WebSocket, email: string) {
		email = normalize(email);

		ws.subscriptions.delete(email);
		ws.send(`unsubscribed from ${email}`);
	}

	private validate(email: string) {
		return email.endsWith("@eepymail.com");
	}
};
