import type { ParsedMail } from "mailparser";
import { json } from "body-parser";
import polka from "polka";

import Mail from "~/models/Mail";
import Socket from "~/socket";

const socket = new Socket();
socket.start();

polka()
	.use(json())
	.post("/mail", (req, res) => {
		const body: ParsedMail = req.body;
		const mail = new Mail(body);

		console.log(JSON.stringify(mail));

		res.end();
	})
	.listen(9000);
