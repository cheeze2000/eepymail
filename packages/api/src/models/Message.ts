type MessageKind = "subscribe" | "unsubscribe";

export default interface Message {
	kind: MessageKind;
	data: string;
}
