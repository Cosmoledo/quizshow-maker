import {
	Socket
} from "socket.io";

class Client {
	private socket: Socket;

	constructor() {
		this.socket = (window as any).io();
	}

	public send(type: string, payload: any = {}, callback ? : (data ? : any) => any): void {
		this.socket.emit(type, payload, callback);
	}

	public get(type: string, callback: (data ? : any) => any): void {
		this.socket.on(type, data => callback(data));
	}
}

const client = new Client();

export default function getClient(): Client {
	return client;
}
