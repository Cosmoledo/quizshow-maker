import Room from "./Room.js";
import {
	Config,
	SessionSocket,
} from "../index.js";

const rooms: {
	[key: string]: Room
} = {};

export function getRoom(id: string): Room | undefined {
	return rooms[id];
}

export function createRoom(id: string, socket: SessionSocket, config: Config.root): void {
	rooms[id] = new Room(id, socket, config);
}

export function findRoomByUser(id: string): Room[] {
	return Object.values(rooms).filter(room => room.hasUser(id));
}
