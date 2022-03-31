import {
	LOCALE_KEYS
} from "../../index.js";
import {
	translate
} from "./index.js";

type Property = "title" | "placeholder" | "value" | "innerHTML";

function set(htmlSelector: string, key: LOCALE_KEYS, prop: Property = "innerHTML"): void {
	const element = document.querySelector(htmlSelector) as HTMLElement;

	if (prop === "title" || prop === "placeholder")
		element.setAttribute(prop, translate(key));
	else
		(element as any)[prop] = translate(key);
}

export function translateElements(): void {
	set("header #question-buzzer", "HintBuzzer", "title");
	set("header #question-buzzer", "Buzzer");
	set("header #question-estimate", "HintEstimate", "title");
	set("header #question-estimate", "Estimate");

	set("#introduction div.lead", "Introduction");
	set("#introduction #join-game", "Join");
	set("#introduction #host-game", "Host");

	set("#form-join-game h1", "EnterCredentials");
	set("#form-join-game .form-floating:nth-of-type(1) label", "GameCode");
	set("#form-join-game .form-floating:nth-of-type(1) div", "InvalidGameCode");
	set("#form-join-game .form-floating:nth-of-type(2) label", "Nickname");
	set("#form-join-game .form-floating:nth-of-type(2) div", "InvalidNickname");
	set("#form-join-game button:nth-of-type(1)", "Join");
	set("#form-join-game button:nth-of-type(2)", "Back");
	set("#form-join-game #no-room", "RoomInvalid");

	set("#form-host-game .flex-wrap h1", "Host");
	set("#form-host-game .flex-wrap #start", "StartGame");
	set("#form-host-game .flex-wrap #details", "Details");
	set("#form-host-game .flex-wrap #import", "Import");
	set("#form-host-game .flex-wrap #export", "Export");
	set("#form-host-game #detailsModal .modal-title", "Details");
	set("#form-host-game #detailsModal .modal-body [data-group='points']", "HintPoints", "title");
	set("#form-host-game #detailsModal .modal-body [data-group='points']", "Score");
	set("#form-host-game #detailsModal .modal-body [for='points-correct']", "Correct");
	set("#form-host-game #detailsModal .modal-body [for='points-wrong']", "Wrong");
	set("#form-host-game #detailsModal .modal-footer button", "Save");

	set("#game-player .question", "WaitingToStart");
	set("#game-player #estimate-container textarea", "EstimateInput", "placeholder");
	set("#game-player #estimate-container button", "Done");

	set("#game-host .question", "WaitingForPlayers");
	set("#game-host .w-100 button:nth-of-type(1)", "StartGame");
	set("#game-host .w-100 button:nth-of-type(2)", "ReadQuestion");
	set("#game-host .w-100 button:nth-of-type(3)", "NextQuestion");
}
