import {
	SessionSocket
} from "../index.js";

export default class User {
	public nickname: string;
	public socket: SessionSocket;
	private _active: boolean;
	private lastSeen: Date;

	public get id(): string {
		return this.socket.sessionID;
	}

	public set active(active: boolean) {
		this._active = active;
		this.lastSeen = new Date();
	}

	constructor(socket: SessionSocket, nichname: string) {
		this.socket = socket;
		this.nickname = nichname;
		this.active = true;
	}
}
