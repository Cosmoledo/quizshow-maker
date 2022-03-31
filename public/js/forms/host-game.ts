import {
	Types
} from "../../../index.d.js";

import QuestionHandler from "./QuestionHandler.js";
import getClient from "../Client.js";
import {
	setSessionId
} from "../index.js";
import {
	downloadFile
} from "./methods.js";

function isConfigJsonValid(json: any): Promise < boolean > {
	return getClient().send(Types.S_VALIDATE_CONFIG, {
		json
	});
}

export default function init(element: HTMLElement): void {
	QuestionHandler.tryCreateQuestion();

	// add question button
	const addQuestion = element.querySelector(".btn-fab") as HTMLButtonElement;
	addQuestion.addEventListener("click", () => QuestionHandler.tryCreateQuestion());

	// resize list
	const resize = () => {
		const rect = (element.querySelector(".flex-wrap") as HTMLElement).getBoundingClientRect();
		QuestionHandler.element.style.height = `calc(100vh - 30px - ${rect.height}px)`;
	};
	resize();
	window.addEventListener("resize", resize);

	// import button
	const importButton = element.querySelector("#import") as HTMLButtonElement;
	importButton.addEventListener("click", () => {
		const input = document.createElement("input");
		input.setAttribute("type", "file");
		input.setAttribute("accept", "application/json");
		input.addEventListener("change", async (event: any) => {
			const file = event?.target?.files[0];

			if (!file)
				return;

			const content = await file.text();
			let json;
			try {
				json = JSON.parse(content);
			} catch (error) {
				alert("File can't be parsed as JSON!");
				return;
			}

			const valid = await isConfigJsonValid(json);

			if (!valid) {
				alert("File is JSON but does not match the schema! Download an export to see the schema.");
				return;
			}

			QuestionHandler.loadJson(json);
		});
		input.click();
	});

	// export button
	const exportButton = element.querySelector("#export") as HTMLButtonElement;
	exportButton.addEventListener("click", () => {
		const json = QuestionHandler.getJson();

		const time = new Date().toLocaleString("de-DE", {
			dateStyle: "short",
			timeStyle: "short"
		}).replace(/\D/g, "_");

		downloadFile("Quizshow Maker " + time + ".json", JSON.stringify(json));
	});

	// start game button
	const button = element.querySelector("#start") as HTMLButtonElement;
	button
		.addEventListener("click", async () => {
			if (!QuestionHandler.validate())
				return;

			const json = QuestionHandler.getJson();

			if (!(await isConfigJsonValid(json))) {
				alert("Content does not match the schema!");
				return;
			}

			console.log("sending to server");

			const data = await getClient().send(Types.S_CREATE_NEW_ROOM, {
				config: json
			});

			if ("URLSearchParams" in window) {
				const searchParams = new URLSearchParams(window.location.search);
				searchParams.set("id", data.roomID);
				const newRelativePathQuery = window.location.pathname + "?" + searchParams.toString();
				history.pushState(null, "", newRelativePathQuery);
			}

			setSessionId(data.userID);
		});
}
