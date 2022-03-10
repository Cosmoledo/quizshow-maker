import {
	Types
} from "../../../index.d.js";

import getClient from "../Client.js";
import {
	setSessionId
} from "../index.js";
import {
	reset
} from "./index.js";

export default function init(element: HTMLElement): void {
	const form = element.querySelector("form") as HTMLFormElement;
	const formBackButton = form.querySelector("button[type=button]") as HTMLButtonElement;
	const configArea = form.querySelector("#gameConfig") as HTMLTextAreaElement;

	form.addEventListener("submit", event => {
		event.preventDefault();
		event.stopPropagation();

		let config;
		try {
			config = JSON.parse(configArea.value);
			if (typeof config !== "object")
				throw new Error("Invalid JSON");
		} catch (error) {
			alert("Invalid JSON");
			return;
		}

		console.log("sending to server");

		getClient().send(Types.S_CREATE_NEW_ROOM, {
			config
		}, data => {
			if ("URLSearchParams" in window) {
				const searchParams = new URLSearchParams(window.location.search);
				searchParams.set("id", data.roomID);
				const newRelativePathQuery = window.location.pathname + "?" + searchParams.toString();
				history.pushState(null, "", newRelativePathQuery);
			}

			setSessionId(data.userID);
		});
	});

	formBackButton.addEventListener("click", () => reset());
}
