import {
	LOCALE_KEYS,
	Types
} from "../../index.js";

import initHostView from "./room/host-view.js";
import initPlayerView from "./room/player-view.js";
import getClient from "./Client.js";
import {
	translateElements
} from "./translate.js";

import("./forms/index.js");

export const settings = {
	roomID: "",
	playerID: "",
	nickname: "",
};

// execute magic for Tooltips from Bootstrap
document.querySelectorAll("[data-bs-toggle='tooltip']")
	.forEach(element => new(window as any).bootstrap.Tooltip(element));

// inform server about my sessionID
export function setSessionId(id: string): void {
	localStorage.setItem("session-id", id);
	settings.playerID = id;
}

const sessionID = localStorage.getItem("session-id");
if (sessionID && sessionID.length > 5) {
	settings.playerID = sessionID;
	getClient().send(Types.S_SET_SESSION_ID, {
		id: sessionID
	});
}

// join lobby
getClient().get(Types.C_JOIN_GAME, data => {
	settings.nickname = data.nickname;
	settings.roomID = data.roomID;

	if (data.isHost)
		initHostView();
	else
		initPlayerView();
});

// Room deleted
getClient().get(Types.C_ROOM_NOT_FOUND, () => {
	alert(translate("RoomDeleted"));
});

// translation
export let translate: (key: LOCALE_KEYS) => string;

getClient().get(Types.C_TRANSLATIONS, translations => {
	translate = key => translations[key] || key;
	translateElements();
});
