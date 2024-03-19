import type { ParsedMail } from "mailparser";
import { json } from "body-parser";
import polka from "polka";

import Socket from "~/socket";

new Socket().start();

polka()
	.use(json())
	.post("/mail", (req, res) => {
		const body: ParsedMail = req.body;
		const mail = new Mail(body);

		console.log(JSON.stringify(mail));

		res.end();
	})
	.listen(9000);
