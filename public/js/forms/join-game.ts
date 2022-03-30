import {
	Types
} from "../../../index.js";

import getClient from "../Client.js";
import {
	setSessionId
} from "../index.js";
import {
	reset
} from "./index.js";
import {
	getFormData
} from "./methods.js";

export default function init(element: HTMLElement): void {
	const form = element.querySelector("form") as HTMLFormElement;
	const roomNotExisting = form.querySelector("#no-room") as HTMLDivElement;
	const formBackButton = form.querySelector("button[type=button]") as HTMLButtonElement;

	const searchParams = new URLSearchParams(window.location.search);
	if (searchParams.has("id")) {
		(form.querySelector("#join-game-id") as HTMLInputElement).value = searchParams.get("id") as string;
	}

	let last = "";

	form.addEventListener("submit", async event => {
		event.preventDefault();
		event.stopPropagation();

		form.classList.add("was-validated");

		if (!form.checkValidity())
			return;

		const formData = getFormData(form);
		const stringified = Object.values(formData).join(";");

		if (stringified !== last) {
			roomNotExisting.classList.add("d-none");
			const data = await getClient().send(Types.S_ENTER_GAME, formData);
			if (data.success)
				setSessionId(data.userID);
			else
				roomNotExisting.classList.remove("d-none");
			last = stringified;
		}
	});

	formBackButton.addEventListener("click", () => reset());
}
