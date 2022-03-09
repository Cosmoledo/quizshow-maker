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

	form.addEventListener("submit", event => {
		event.preventDefault();
		event.stopPropagation();

		/*
		form.classList.add("was-validated");

		if (!form.checkValidity())
			return;

		const data = getFormData(form);
		*/

		console.log("sending to server");

		getClient().send(Types.S_CREATE_NEW_ROOM, undefined, data => {
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
