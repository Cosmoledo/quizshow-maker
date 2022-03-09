import fs from "fs";
import path from "path";

import winston from "winston";

const logDir = path.resolve("logs");
if (!fs.existsSync(logDir))
	fs.mkdirSync(logDir);

const upperCaseFirst = (text: string) => text[0].toUpperCase() + text.slice(1).toLowerCase();

const logger = winston.createLogger({
	format: winston.format.combine(
		winston.format.splat(),
		winston.format.timestamp({
			format: "HH:mm:ss.SSS"
		}),
		winston.format.printf((msg: any) => {
			const level = (msg.level as string).replace(msg[Symbol.for("level")], upperCaseFirst);

			return `${msg.timestamp} ${level}: ${msg.message}`;
		}),
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: path.join(logDir, `${new Date().toISOString().slice(0, 10)}.log`),
		}),
	],
});

export default logger;
