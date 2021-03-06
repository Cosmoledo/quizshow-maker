// SHARED

export type LOCALE_KEYS = "Answer" | "Back" | "Buzzer" | "Correct" | "Close" | "Details" | "Done" | "EnterCredentials" | "Estimate" | "EstimateInput" | "Export" | "GameCode" | "GameWillStart" | "GuessWillBeHere" | "HintBuzzer" | "HintEstimate" | "HintPoints" | "Host" | "Import" | "ImportAlreadyExisting" | "ImportFromFile" | "ImportModalText" | "Introduction" | "InvalidGameCode" | "InvalidNickname" | "Join" | "NextQuestion" | "Nickname" | "Question" | "QuestionNotReadComplete" | "ReadQuestion" | "RoomDeleted" | "RoomInvalid" | "Save" | "Score" | "StartGame" | "WaitingForPlayers" | "WaitingToStart" | "Wrong";

export const enum Types {
	C_GAME_QUESTION = "C_GAME_QUESTION",
		C_JOIN_GAME = "C_JOIN_GAME",
		C_PLAYER_CHANGE = "C_PLAYER_CHANGE",
		C_ROOM_NOT_FOUND = "C_ROOM_NOT_FOUND",
		C_STARTED_GAME = "C_STARTED_GAME",
		C_TRANSLATIONS = "C_TRANSLATIONS",
		S_CREATE_NEW_ROOM = "S_CREATE_NEW_ROOM",
		S_ENTER_GAME = "S_ENTER_GAME",
		S_ROOM_EVENT = "S_ROOM_EVENT",
		S_SET_SESSION_ID = "S_SET_SESSION_ID",
		S_VALIDATE_CONFIG = "S_VALIDATE_CONFIG",
		S_GET_EXISTING_GAME = "S_GET_EXISTING_GAME",
		S_GET_EXISTING_GAMES = "S_GET_EXISTING_GAMES",
}

export const enum RoomEvents {
	ANSWER = "ANSWER",
		CHANGE_SCORE = "CHANGE_SCORE",
		DECIDE_POINT = "DECIDE_POINT",
		NEXT_QUESTION = "NEXT_QUESTION",
		QUESTION_TRIED = "QUESTION_TRIED",
		SHOW_QUESTION = "SHOW_QUESTION",
		START_GAME = "START_GAME",
}

type QUESTION_TRIED = "reset" | "disabled";

export const enum PlayerEvents {
	JOIN = "JOIN",
		LEAVE = "LEAVE",
		REJOIN = "REJOIN",
		GUESS = "GUESS",
}

interface PlayerEvent {
	correct ? : QUESTION_TRIED;
	guess: Guess;
	id: string;
	nickname: string;
	score: number;
	type: PlayerEvents | RoomEvents;
}

interface Guess {
	answer ? : string;
	final ? : boolean;
	place ? : number;
}

interface Answer extends Guess {
	time: number;
	type: RoomEvents;
}

declare module Config {
	export type Type = "BUZZER" | "ESTIMATE";

	export interface Question {
		answer: string;
		id ? : string;
		question: string;
		type: Type;
	}

	export interface ExtendedQuestion extends Question {
		hasNext: boolean;
		id: string;
		questionRaw: LOCALE_KEYS;
	}

	export interface Points {
		correct: "auto" | number;
		wrong: number;
	}

	export interface Settings {
		points: Points;
	}

	export interface root {
		settings: Settings;
		questions: Question[];
	}
}

interface FilterGames {
	filterByName ? : string;
	id ? : 0
}

declare module ExistingGame {
	export interface Creator {
		name: string;
		website: string;
	}

	export interface Game {
		creator: Creator;
		id: string;
		language: string;
		name: string;
		pr: "build-in" | string;
	}

	export interface root {
		games: Game[];
	}
}

// SERVER

import {
	Socket
} from "socket.io";

import Room from "./src/Room";

interface SessionSocket extends Socket {
	sessionID: string;
	room ? : Room;
	language: {
		got: string;
		wanted: string;
	}
}
