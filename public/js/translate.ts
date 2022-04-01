import {
	LOCALE_KEYS
} from "../../index.js";
import {
	translate
} from "./index.js";

type Property = "title" | "placeholder" | "value" | "innerHTML";

function set(htmlSelector: string, key: LOCALE_KEYS, prop: Property = "innerHTML", callback ? : (text: string) => string): void {
	const element = document.querySelector(htmlSelector) as HTMLElement;

	const translation = callback ? callback(translate(key)) : translate(key);

	if (prop === "title" || prop === "placeholder")
		element.setAttribute(prop, translation);
	else
		(element as any)[prop] = translation;
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

	set("#form-host-game #header-bar h1", "Host");
	set("#form-host-game #header-bar #start", "StartGame");
	set("#form-host-game #header-bar #details", "Details");
	set("#form-host-game #header-bar #import", "Import");
	set("#form-host-game #header-bar #import-file", "ImportFromFile");
	set("#form-host-game #header-bar #import-existing", "ImportAlreadyExisting");
	set("#form-host-game #header-bar #export", "Export");

	set("#form-host-game #details-modal .modal-title", "Details");
	set("#form-host-game #details-modal .modal-body [data-group='points']", "HintPoints", "title");
	set("#form-host-game #details-modal .modal-body [data-group='points']", "Score");
	set("#form-host-game #details-modal .modal-body [for='points-correct']", "Correct");
	set("#form-host-game #details-modal .modal-body [for='points-wrong']", "Wrong");
	set("#form-host-game #details-modal .modal-footer button", "Save");

	set("#form-host-game #import-existing-modal .modal-title", "ImportAlreadyExisting");
	set("#form-host-game #import-existing-modal .modal-body .main", "ImportModalText", "innerHTML", text => {
		return text.replace("__GITHUB__", "<a href=\"https://github.com/Cosmoledo/quizshow-maker\" target=\"_blank\" rel=\"noopener noreferrer\">GitHub</a>");
	});

	set("#form-host-game #import-existing-modal .modal-footer button:nth-of-type(1)", "Import");
	set("#form-host-game #import-existing-modal .modal-footer button:nth-of-type(2)", "Close");

	set("#game-player .question", "WaitingToStart");
	set("#game-player #estimate-container textarea", "EstimateInput", "placeholder");
	set("#game-player #estimate-container button", "Done");

	set("#game-host .question", "WaitingForPlayers");
	set("#game-host .w-100 button:nth-of-type(1)", "StartGame");
	set("#game-host .w-100 button:nth-of-type(2)", "ReadQuestion");
	set("#game-host .w-100 button:nth-of-type(3)", "NextQuestion");
}
