import fs from "fs";

import winston from "winston";

const logDir = "./logs/";
if (!fs.existsSync(logDir))
	fs.mkdirSync(logDir);

const lastLogIdFile = "./lastLogId.txt";
let lastLogID = 1;
if (fs.existsSync(lastLogIdFile)) {
	const content = fs.readFileSync(lastLogIdFile) + "";
	const num = parseInt(content);
	if (Number.isInteger(num) && Number.isFinite(num) && !Number.isNaN(num)) {
		lastLogID = num + 1;
		fs.writeFileSync(lastLogIdFile, lastLogID + "");
	} else
		fs.writeFileSync(lastLogIdFile, lastLogID + "");
} else
	fs.writeFileSync(lastLogIdFile, lastLogID + "");

const upperCaseFirst = (text: string) => text[0].toUpperCase() + text.slice(1).toLowerCase();

const formatters = [
	winston.format.splat(),
	winston.format.timestamp({
		format: "HH:mm:ss.SSS"
	}),
	winston.format.colorize(),
	winston.format.printf((msg: any) => {
		const level = (msg.level as string).replace(msg[Symbol.for("level")], upperCaseFirst);

		return `${msg.timestamp} ${level}: ${msg.message}`;
	}),
];

const logger = winston.createLogger({
	transports: [
		new winston.transports.Console({
			format: winston.format.combine(...formatters),
		}),
		new winston.transports.File({
			format: winston.format.combine(...[...formatters.slice(0, 2), ...formatters.slice(-1)]),
			filename: logDir + `${new Date().toISOString().slice(0, 10)}-log-${lastLogID}.log`,
		})
	],
});

export default logger;
