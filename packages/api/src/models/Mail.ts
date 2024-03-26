import type { ParsedMail } from "mailparser";
import { randomUUID } from "node:crypto";
import normalize from "normalize-email";
import DOMPurify from "isomorphic-dompurify";

export default class Mail {
	id: string;
	senders: { name: string, address: string }[];
	recipients: { address: string }[];
	subject: string;
	body: string;
	timestamp: Date;

	constructor(parsedMail: ParsedMail) {
		this.id = randomUUID();
		this.subject = parsedMail.subject ?? "";
		this.timestamp = parsedMail.date ?? new Date();

		this.body = parsedMail.html
			? parsedMail.html
			: parsedMail.textAsHtml ?? parsedMail.text ?? "";

		this.body = DOMPurify.sanitize(this.body);

		const senders = parsedMail.from?.value ?? [];
		this.senders = senders.map(sender => ({
			name: sender.name,
			address: normalize(sender.address ?? ""),
		}));

		let mailTo = parsedMail.to ?? [];
		if (!Array.isArray(mailTo)) {
			mailTo = [mailTo];
		}

		let mailCc = parsedMail.cc ?? [];
		if (!Array.isArray(mailCc)) {
			mailCc = [mailCc];
		}

		const recipients = mailTo.concat(mailCc).flatMap(obj => obj.value);
		this.recipients = recipients.map(recipient => ({
			address: normalize(recipient.address ?? ""),
		}));
	}
}
