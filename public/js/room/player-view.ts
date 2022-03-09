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
const buzzer = view.querySelector("#buzzer") as HTMLButtonElement;
const textbox = view.querySelector("#textbox") as HTMLTextAreaElement;
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

	buzzer.addEventListener("pointerdown", hitBuzzer);

	return () => {
		buzzer.removeEventListener("pointerdown", hitBuzzer);
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
		await hideElement(buzzer);
		setupInputs();

		console.log(data);

		if (data.skipAnim) {
			showElement(question);
			score.classList.remove("me-auto");
			score.innerHTML = "0";

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

					case RoomEvents.CHANGE_BUZZER:
						toggleBuzzerState(da.buzzer === "reset");
						break;

					case RoomEvents.STOP_ESTIMATE:
						textbox.setAttribute("disabled", "true");
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
		// eslint-disable-next-line no-inner-declarations
		function hitBuzzer(): void {
			if (type !== "BUZZER")
				return;

			toggleBuzzerState(false);

			getClient().send(Types.S_ROOM_EVENT, ({
				time: new Date().getTime() + timeDiff,
				type: RoomEvents.ANSWER
			}) as Answer);
		}

		buzzer.addEventListener("pointerdown", hitBuzzer);

		const keydown = (event: KeyboardEvent) => {
			if (!(event.key === " " || event.keyCode === 32))
				return;

			hitBuzzer();
		};

		document.addEventListener("keydown", keydown);
	}

	// ESTIMATE
	{
		const textboxChanged = () => {
			if (type !== "ESTIMATE")
				return;

			getClient().send(Types.S_ROOM_EVENT, ({
				time: new Date().getTime(),
				answer: textbox.value.trim(),
				type: RoomEvents.ANSWER
			}) as Answer);
		};

		textbox.addEventListener("keyup", textboxChanged);

		const textboxDown = (event: KeyboardEvent) => {
			if (type !== "ESTIMATE")
				return;

			if (event.key === "Tab" || event.keyCode === 9) {
				event.preventDefault();
				textbox.value += "\t";
			}
		};

		textbox.addEventListener("keydown", textboxDown);
	}
}

function toggleBuzzerState(active: boolean): void {
	if (active)
		buzzer.classList.remove("buzzed", "cursor-default");
	else
		buzzer.classList.add("buzzed", "cursor-default");
}

let lastQuestionID: string;

async function playQuestion(questionData: Config.Question): Promise < void > {
	console.log(questionData);
	await hideElement(question, undefined, true);

	if (lastQuestionID !== questionData.id) {
		type = questionData.type;
		switch (questionData.type) {
			case "BUZZER":
				await hideElement(headerEstimate);
				await hideElement(textbox);
				await showElement(headerBuzzer);
				toggleBuzzerState(true);
				await showElement(buzzer);
				break;

			case "ESTIMATE":
				await hideElement(headerBuzzer);
				await hideElement(buzzer);
				await showElement(headerEstimate);
				textbox.value = "";
				textbox.removeAttribute("disabled");
				await showElement(textbox);
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
