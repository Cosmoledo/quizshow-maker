import {
	ExistingGame,
	Types
} from "../../../index.d.js";

import QuestionHandler from "./QuestionHandler.js";
import getClient from "../Client.js";
import {
	setSessionId,
	settings
} from "../index.js";
import {
	downloadFile
} from "./methods.js";

let addedLoadEventListener = false;
async function loadOrShowExistingGames(event: Event): Promise < void > {
	const element = event.target as HTMLElement;
	const modal: bootstrap.Modal = (window as any).bootstrap.Modal.getOrCreateInstance(element);

	const button = element.querySelector(".modal-footer .btn-primary") as HTMLButtonElement;

	const games = await getClient().send(Types.S_GET_EXISTING_GAMES, {
		filterByName: "",
		id: 0
	}) as ExistingGame.Game[];

	const importModalList = element.querySelector("#import-existing-list") as HTMLElement;
	importModalList.innerHTML = "";

	const getLocale = new Intl.DisplayNames([settings.language], {
		type: "language"
	});

	games.forEach(game => {
		const div = document.createElement("div");
		div.classList.add("row", "game-element");
		div.innerHTML = `
			<div class="col">
				${game.pr === "build-in" ? game.name : `<a href="${game.pr}" target="_blank" rel="noopener noreferrer">${game.name}</a>`}
			</div>
			<div class="col text-truncate" title="${getLocale.of(game.language)}">
				${getLocale.of(game.language)}
			</div>
			<div class="col fw-light">
				<a href="${game.creator.website}" target="_blank" rel="noopener noreferrer">${game.creator.name}</a>
			</div>
		`;
		div.addEventListener("click", () => {
			importModalList.querySelectorAll(".selected").forEach(a => a.classList.remove("selected"));

			div.classList.add("selected");
		});

		importModalList.appendChild(div);
	});

	if (addedLoadEventListener)
		return;

	addedLoadEventListener = true;

	button.addEventListener("click", async () => {
		const index = Array.from(importModalList.children)
			.findIndex(a => a.classList.contains("selected"));

		if (index < 0) {
			alert("Please select a game first");
			return;
		}

		modal.hide();

		const json = await getClient().send(Types.S_GET_EXISTING_GAME, {
			id: games[index].id
		});

		QuestionHandler.loadJson(json);
	});
}

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
		const rect = (element.querySelector("#header-bar") as HTMLElement).getBoundingClientRect();
		QuestionHandler.element.style.height = `calc(100vh - 30px - ${rect.height}px)`;
	};
	resize();
	window.addEventListener("resize", resize);

	// import from file
	const importFile = element.querySelector("#import + .dropdown-menu #import-file") as HTMLElement;
	importFile.addEventListener("click", () => {
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

	// import already existing
	const importModal = element.querySelector("#import-existing-modal") as HTMLElement;
	importModal.addEventListener("show.bs.modal", loadOrShowExistingGames);

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
