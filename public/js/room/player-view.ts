import getClient from "../Client.js";
import {
	Answer,
	Config,
	PlayerEvent,
	RoomEvents,
	Types
} from "../../../index.js";
import {
	reset
} from "../forms/index.js";
import {
	hideElement,
	showElement
} from "../forms/methods.js";
import {
	translate
} from "../index.js";

const view = document.querySelector("#game-player") as HTMLElement;
const question = view.querySelector(".question") as HTMLHeadingElement;
const buzzerContainer = view.querySelector("#buzzer-container") as HTMLButtonElement;
const buzzerButton = buzzerContainer.querySelector("button") as HTMLButtonElement;
const estimateContainer = view.querySelector("#estimate-container") as HTMLButtonElement;
const estimateTextarea = estimateContainer.querySelector("textarea") as HTMLTextAreaElement;
const estimateFinished = estimateContainer.querySelector("button") as HTMLButtonElement;
const header = document.querySelector(".navbar") as HTMLDivElement;
const headerBuzzer = header.querySelector("#question-buzzer") as HTMLHeadingElement;
const headerEstimate = header.querySelector("#question-estimate") as HTMLHeadingElement;
const score = header.querySelector("#score") as HTMLHeadingElement;

function setupMinigame(): () => void {
	let start = new Date().getTime();
	let clicks = 0;
	let frequency = 0;

	function hitBuzzer(): void {
		const now = new Date().getTime();

		frequency += (now - start) / 1000;
		clicks++;

		if (frequency >= 1) {
			score.innerHTML = clicks + " cps";
			frequency = 0;
			clicks = 0;
		}

		start = now;
	}

	buzzerButton.addEventListener("pointerdown", hitBuzzer);

	return () => {
		buzzerButton.removeEventListener("pointerdown", hitBuzzer);
	};
}

export default async function init(): Promise < void > {
	// TODO handle player who rejoins

	await reset(false);
	await showElement(header, "fadeInDown");
	await showElement(view);

	console.log("player");

	const stopMinigame = setupMinigame();

	getClient().get(Types.C_STARTED_GAME, async (data: any) => {
		timeDiff = data.timestamp - new Date().getTime();

		stopMinigame();
		await hideElement(buzzerContainer);
		setupInputs();

		console.log(data);

		if (data.skipAnim) {
			showElement(question);
			score.classList.remove("me-auto");
			score.innerHTML = (data.score || 0) + "";

			playQuestion(data.question);
		} else {
			await hideElement(question, undefined, true);

			await hideElement(score);
			score.classList.remove("me-auto");
			score.innerHTML = "0";
			await showElement(score);

			question.innerHTML = translate("GameWillStart");
			await showElement(question);
		}

		getClient().get(Types.C_GAME_QUESTION, data => playQuestion(data));

		getClient().get(Types.C_PLAYER_CHANGE, (data: PlayerEvent | PlayerEvent[]) => {
			if (!Array.isArray(data))
				data = [data];

			data.forEach(da => {
				console.log(da);

				switch (da.type) {
					case RoomEvents.CHANGE_SCORE:
						score.innerHTML = da.score + "";
						break;

					case RoomEvents.QUESTION_TRIED:
						toggleBuzzerState(da.correct === "reset");
						break;

					default:
						break;
				}
			});
		});
	});
}

let type: Config.Type = "BUZZER";
let timeDiff: number = 0;

function setupInputs(): void {
	// BUZZER
	{
		const hitBuzzer = () => {
			if (type !== "BUZZER")
				return;

			toggleBuzzerState(false);

			getClient().send(Types.S_ROOM_EVENT, ({
				time: new Date().getTime() + timeDiff,
				type: RoomEvents.ANSWER
			}) as Answer);
		};

		buzzerButton.addEventListener("pointerdown", hitBuzzer);

		document.addEventListener("keydown", (event: KeyboardEvent) => {
			if (!(event.key === " " || event.keyCode === 32))
				return;

			hitBuzzer();
		});
	}

	// ESTIMATE
	{
		estimateTextarea.addEventListener("keyup", () => {
			if (type !== "ESTIMATE")
				return;

			getClient().send(Types.S_ROOM_EVENT, ({
				answer: estimateTextarea.value.trim(),
				time: new Date().getTime(),
				type: RoomEvents.ANSWER
			}) as Answer);
		});

		estimateTextarea.addEventListener("keydown", (event: KeyboardEvent) => {
			if (type !== "ESTIMATE")
				return;

			if (event.key === "Tab" || event.keyCode === 9) {
				event.preventDefault();
				estimateTextarea.value += "\t";
			}
		});

		estimateFinished.addEventListener("click", () => {
			estimateFinished.setAttribute("disabled", "true");
			estimateTextarea.setAttribute("disabled", "true");
			getClient().send(Types.S_ROOM_EVENT, ({
				answer: estimateTextarea.value.trim(),
				final: true,
				time: new Date().getTime(),
				type: RoomEvents.ANSWER,
			}) as Answer);
		});
	}
}

function toggleBuzzerState(active: boolean): void {
	if (active)
		buzzerButton.classList.remove("buzzed", "cursor-default");
	else
		buzzerButton.classList.add("buzzed", "cursor-default");
}

let lastQuestionID: string;

async function playQuestion(questionData: Config.ExtendedQuestion): Promise < void > {
	console.log(questionData);
	await hideElement(question, undefined, true);

	if (lastQuestionID !== questionData.id) {
		type = questionData.type;
		switch (questionData.type) {
			case "BUZZER":
				await hideElement(headerEstimate);
				await hideElement(estimateContainer);
				await showElement(headerBuzzer);
				toggleBuzzerState(true);
				await showElement(buzzerContainer);
				break;

			case "ESTIMATE":
				await hideElement(headerBuzzer);
				await hideElement(buzzerContainer);
				await showElement(headerEstimate);
				estimateTextarea.value = "";
				estimateTextarea.removeAttribute("disabled");
				estimateFinished.removeAttribute("disabled");
				await showElement(estimateContainer);
				break;
		}
	}

	if (questionData.questionRaw)
		question.innerHTML = translate(questionData.questionRaw);
	else
		question.innerHTML = questionData.question;

	await showElement(question);

	lastQuestionID = questionData.id;
}
