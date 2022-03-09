// SHARED

export type LOCALE_KEYS = "Answer" | "Back" | "Buzzer" | "Correct" | "EnterCredentials" | "Estimate" | "EstimateInput" | "GameCode" | "GameWillStart" | "GuessWillBeHere" | "HintBuzzer" | "HintEstimate" | "Host" | "Introduction" | "InvalidGameCode" | "InvalidNickname" | "Join" | "NextQuestion" | "Nickname" | "QuestionNotReadComplete" | "ReadQuestion" | "RoomDeleted" | "RoomInvalid" | "Score" | "StartGame" | "StopQuestion" | "WaitingForPlayers" | "WaitingToStart" | "Wrong";

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
}

export const enum RoomEvents {
	ANSWER = "ANSWER",
		CHANGE_BUZZER = "CHANGE_BUZZER",
		CHANGE_SCORE = "CHANGE_SCORE",
		DECIDE_POINT = "DECIDE_POINT",
		NEXT_QUESTION = "NEXT_QUESTION",
		SHOW_QUESTION = "SHOW_QUESTION",
		START_GAME = "START_GAME",
		STOP_ESTIMATE = "STOP_ESTIMATE",
}

type BUZZER_CHANGE = "reset" | "disabled";

export const enum PlayerEvents {
	JOIN = "JOIN",
		LEAVE = "LEAVE",
		REJOIN = "REJOIN",
		GUESS = "GUESS",
}

interface PlayerEvent {
	id: string;
	nickname: string;
	score: number;
	guess: Guess;
	type: PlayerEvents | RoomEvents;
	buzzer ? : BUZZER_CHANGE;
}

interface Guess {
	answer ? : string;
	place ? : number;
}

interface Answer extends Guess {
	time: number;
	type: RoomEvents;
}

declare module Config {
	export type Type = "BUZZER" | "ESTIMATE";

	export interface Question {
		answer: string | number;
		hasNext: boolean;
		id: string;
		question: string;
		questionRaw: LOCALE_KEYS;
		type: Type;
	}

	export interface Points {
		lose: number;
		win: number;
	}

	export interface root {
		points: Points;
		questions: Question[];
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
