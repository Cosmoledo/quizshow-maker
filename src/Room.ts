import QuestionHandler from "./QuestionHandler.js";
import User from "./User.js";
import {
	Config,
	PlayerEvent,
	PlayerEvents,
	RoomEvents,
	SessionSocket,
	Types
} from "../index.js";

export default class Room {
	private roomID: string;
	private host: User;
	private createdAt: Date = new Date();
	private players: User[] = [];
	private qHandler: QuestionHandler;
	public config: Config.root;

	public get id(): string {
		return this.roomID;
	}

	constructor(id: string, socket: SessionSocket, config: Config.root) {
		socket.join(id);

		this.roomID = id;
		this.host = new User(socket, "host");

		this.config = config;
		this.qHandler = new QuestionHandler(this, this.config.questions);

		this.sendJoin(this.host);
	}

	public addUser(nickname: string, socket: SessionSocket): void {
		socket.join(this.roomID);

		const newPlayer = new User(socket, nickname);
		this.players.push(newPlayer);

		this.informOthersAboutMe(newPlayer, PlayerEvents.JOIN);

		this.informMeAboutOthers(socket);

		this.sendJoin(newPlayer);
	}

	public rejoin(socket: SessionSocket): void {
		socket.join(this.roomID);

		const user = this.getUser(socket.sessionID);
		user.socket = socket;
		user.active = true;

		this.sendJoin(user);

		setTimeout(() => {
			this.informMeAboutOthers(user.socket);

			this.informOthersAboutMe(user, PlayerEvents.REJOIN);

			this.qHandler.rejoin(user);
		}, 3000);
	}

	public setInactive(socket: SessionSocket): void {
		const user = this.getUser(socket.sessionID);
		user.active = false;

		this.informOthersAboutMe(user, PlayerEvents.LEAVE);
	}

	public hasUser(id: string): boolean {
		return this.host.id === id || this.players.some(player => player.id === id);
	}

	public sendToHost(type: Types, payload: unknown): void {
		this.host.socket.emit(type, payload);
	}

	public sendFromHost(type: Types, payload: unknown): void {
		this.host.socket.to(this.id).emit(type, payload);
	}

	public getPlayerIDs(): string[] {
		return this.players.map(player => player.id);
	}

	public getUser(id: string): User {
		return (this.host.id === id ?
			this.host :
			this.players.find(player => player.id === id)
		) as User;
	}

	public handleEvent(type: RoomEvents, id: string, payload: any): void {
		switch (type) {
			case RoomEvents.START_GAME:
				this.qHandler.start();
				break;

			case RoomEvents.SHOW_QUESTION:
				this.qHandler.showQuestion();
				break;

			case RoomEvents.DECIDE_POINT:
				this.qHandler.decidePoint(payload);
				break;

			case RoomEvents.ANSWER:
				this.qHandler.setAnswer(id, payload);
				break;

			case RoomEvents.CHANGE_SCORE:
				this.qHandler.changeScore(payload);
				break;

			case RoomEvents.NEXT_QUESTION:
				this.qHandler.nextQuestion();
				break;

			default:
				console.error("Unknown RoomEvents command:", type);
				break;
		}
	}

	private informMeAboutOthers(socket: SessionSocket): void {
		const others = this.players
			.filter(player => player.id !== socket.sessionID)
			.map(player => ({
				id: player.id,
				nickname: player.nickname,
				score: 0,
				type: PlayerEvents.JOIN,
			}) as PlayerEvent);

		socket.emit(Types.C_PLAYER_CHANGE, others);
	}

	private informOthersAboutMe(user: User, type: PlayerEvents): void {
		user.socket.to(this.roomID).emit(Types.C_PLAYER_CHANGE, ({
			id: user.id,
			nickname: user.nickname,
			score: 0,
			type,
		}) as PlayerEvent);
	}

	private sendJoin(user: User): void {
		user.socket.room = this;

		user.socket.emit(Types.C_JOIN_GAME, {
			isHost: user.id === this.host.id,
			nickname: user.nickname,
			roomID: this.roomID,
		});
	}
}
