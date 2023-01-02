import crypto from "crypto";
import fs from "fs";
import path from "path";

import Localization from "localizationjs";
import express from "express";
import HTTPServer from "http";
import {
	Server as SocketIoServer
} from "socket.io";

import logger from "./Logger.js";
import ConfigValidator from "./ConfigValidator.js";
import {
	getExistingGame,
	getExistingGames
} from "./ExistingGames.js";
import {
	SessionSocket,
	Types
} from "../index.js";
import {
	createRoom,
	findRoomByUser,
	getRoom
} from "./RoomHandler.js";

const translations = JSON.parse(fs.readFileSync(path.resolve("locale.json")) + "");
const locale = new Localization();
for (const key in translations)
	locale.addDict(key, translations[key]);

const app = express();
app.use(express.static("public"));

const server = new HTTPServer.Server(app);
export const io = new SocketIoServer(server);

io.use((socket: any, next) => {
	const acceptLanguage = socket.request.headers["accept-language"]?.split(",")[0] as string;
	if (acceptLanguage && locale.hasDict(acceptLanguage))
		locale.setCurrentLocale(acceptLanguage);
	else
		locale.setCurrentLocale(locale.getDefaultLocale());

	if (!locale.hasDict(acceptLanguage, true))
		delete locale.currentLocale.country;

	socket.language = {
		got: locale.getCurrentLocale().toString(),
		wanted: acceptLanguage,
	};

	next();
});

(io as any).on("connection", (socket: SessionSocket) => {
	socket.sessionID = crypto.randomUUID();

	socket.emit(Types.C_TRANSLATIONS, {
		language: socket.language.got,
		translations: locale.getFullDict(),
	});

	logger.info(
		"Connected: %s, requesting language %s, sending %s",
		socket.sessionID,
		socket.request.headers["accept-language"],
		socket.language.got
	);
	tryRelogIntoGame(socket);

	socket.on("disconnect", () => {
		logger.info("Disconnected: %s", socket.sessionID);
		socket.room?.setInactive(socket);
	});

	socket.onAny((type, payload: {
		[key: string]: string;
	}, callback) => {
		logger.info("Action %s %s %s", type, socket.sessionID, payload);

		switch (type) {
			case Types.S_SET_SESSION_ID:
				socket.sessionID = payload.id;
				tryRelogIntoGame(socket);
				break;

			case Types.S_CREATE_NEW_ROOM:
				const roomID = crypto.randomUUID();
				createRoom(roomID, socket, payload.config as any);

				callback({
					roomID,
					userID: socket.sessionID,
				});
				break;

			case Types.S_ENTER_GAME:
				const room = getRoom(payload["join-game-id"]);

				if (!room) {
					callback({
						success: false,
					});
					break;
				}

				if (room.hasUser(socket.sessionID))
					tryRelogIntoGame(socket);
				else
					room.addUser(payload["join-game-nickname"], socket);

				callback({
					success: true,
					userID: socket.sessionID,
				});
				break;

			case Types.S_ROOM_EVENT:
				if (!socket.room) {
					socket.emit(Types.C_ROOM_NOT_FOUND);
					break;
				}

				socket.room.handleEvent(payload.type as any, socket.sessionID, payload);
				break;

			case Types.S_VALIDATE_CONFIG:
				const isValid = ConfigValidator(payload.json);
				callback(isValid);
				break;

			case Types.S_GET_EXISTING_GAME:
				const game = getExistingGame(payload.id);
				callback(game);
				break;

			case Types.S_GET_EXISTING_GAMES:
				const games = getExistingGames(payload as any);
				callback(games);
				break;

			default:
				console.error("Unknown command:", type);
				break;
		}
	});

	function tryRelogIntoGame(socket: SessionSocket) {
		const rooms = findRoomByUser(socket.sessionID);

		if (rooms.length > 1) {
			console.error("handle user in multiple rooms");
			return;
		}

		rooms.forEach(room => room.rejoin(socket));
	}
});

const port = process.env.PORT || 3000;
server.listen(port);
logger.info("Server started on PORT: %d", port);
