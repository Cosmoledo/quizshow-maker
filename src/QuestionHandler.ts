import User from "./User.js";
import Room from "./Room.js";
import {
	Answer,
	Config,
	PlayerEvent,
	PlayerEvents,
	RoomEvents,
	Types
} from "../index.js";
import {
	io
} from "./index.js";

export default class QuestionHandler {
	private questions: Config.Question[];
	private index: number = 0;
	private room: Room;
	private score: {
		[key: string]: number;
	} = {};
	private guesses: {
		[key: string]: {
			time: number;
			answer: string;
		};
	} = {};
	private started: boolean = false;
	private visible: boolean = false;

	public get current(): Config.Question {
		const cur = this.questions[this.index];
		if (cur.hasNext === undefined)
			cur.hasNext = !!this.questions[this.index + 1];
		return cur;
	}

	public get currentHidden(): Config.Question {
		return Object.assign({}, this.current, ({
			question: "",
			questionRaw: "QuestionNotReadComplete"
		}) as Config.Question);
	}

	constructor(room: Room, questions: Config.Question[]) {
		this.room = room;
		this.questions = questions;
	}

	public start(): void {
		this.room.getPlayerIDs().forEach(id => this.score[id] = 0);

		this.started = true;

		io.to(this.room.id).emit(Types.C_STARTED_GAME, {
			timestamp: new Date().getTime(),
			questionAmount: this.questions.length,
		});

		setTimeout(() => {
			this.next();
		}, 5000);
	}

	public setAnswer(id: string, payload: Answer): void {
		if (this.guesses[id] && payload.time < this.guesses[id].time)
			return;

		if (!this.guesses[id])
			this.guesses[id] = ({}) as any;

		this.guesses[id].time = payload.time;

		const changeEvents = [];

		switch (this.current.type) {
			case "BUZZER":
				this.getBuzzerPlaces().forEach((id, index) => {
					changeEvents.push(({
						id,
						type: PlayerEvents.GUESS,
						guess: {
							place: index + 1
						}
					}) as PlayerEvent);
				});
				break;

			case "ESTIMATE":
				this.guesses[id].answer = payload.answer as string;
				changeEvents.push(({
					id,
					type: PlayerEvents.GUESS,
					guess: {
						answer: payload.answer,
						final: payload.final || false
					}
				}) as PlayerEvent);
				break;

			default:
				console.error("Unknown Question type:", this.current.type);
				break;
		}

		this.room.sendToHost(Types.C_PLAYER_CHANGE, changeEvents);
	}

	public rejoin(user: User): void {
		if (!this.started)
			return;

		user.socket.emit(Types.C_STARTED_GAME, {
			message: "",
			question: user.nickname === "host" || this.visible ? this.current : this.currentHidden,
			questionAmount: this.questions.length,
			skipAnim: true,
			timestamp: new Date().getTime(),
			visible: this.visible,
		});
	}

	public nextQuestion(): void {
		this.index++;
		this.next();
	}

	public showQuestion(): void {
		this.visible = true;
		this.room.sendFromHost(Types.C_GAME_QUESTION, this.current);
	}

	public decidePoint(payload: {
		id: string,
		correct: boolean,
	}): void {
		this.guesses = ({}) as any;

		if (payload.correct) {
			this.score[payload.id] += this.room.config.points.win;

			const scoreChange = ({
				id: payload.id,
				score: this.score[payload.id],
				type: RoomEvents.CHANGE_SCORE,
			}) as PlayerEvent;

			this.room.getUser(payload.id).socket.emit(Types.C_PLAYER_CHANGE, scoreChange);
			this.room.sendToHost(Types.C_PLAYER_CHANGE, scoreChange);

			if (!this.visible)
				this.showQuestion();
		} else
			for (const key in this.score) {
				if (key === payload.id)
					continue;

				this.score[key] += this.room.config.points.lose;

				const scoreChange = ({
					id: key,
					score: this.score[key],
					type: RoomEvents.CHANGE_SCORE,
				}) as PlayerEvent;

				this.room.getUser(key).socket.emit(Types.C_PLAYER_CHANGE, scoreChange);
				this.room.sendToHost(Types.C_PLAYER_CHANGE, scoreChange);
			}

		const reset = ({
			type: RoomEvents.CHANGE_BUZZER,
			buzzer: payload.correct ? "disabled" : "reset"
		}) as PlayerEvent;

		this.room.sendToHost(Types.C_PLAYER_CHANGE, reset);
		this.room.sendFromHost(Types.C_PLAYER_CHANGE, reset);
	}

	public changeScore(payload: PlayerEvent): void {
		this.score[payload.id] = payload.score;
		this.room.getUser(payload.id).socket.emit(Types.C_PLAYER_CHANGE, ({
			score: this.score[payload.id],
			type: RoomEvents.CHANGE_SCORE,
		}) as PlayerEvent);
	}

	private getBuzzerPlaces(): string[] {
		const places: [number, string][] = [];
		for (const key in this.guesses)
			places.push([this.guesses[key].time, key]);
		places.sort(([timeA], [timeB]) => timeA - timeB);

		return places.map(([, id]) => id);
	}

	private next(): void {
		this.guesses = {};
		this.visible = false;

		// send question to players
		if (this.current.type === "ESTIMATE")
			this.showQuestion();
		else
			this.room.sendFromHost(Types.C_GAME_QUESTION, this.currentHidden);

		// send full question to host
		this.room.sendToHost(Types.C_GAME_QUESTION, this.current);
	}
}
