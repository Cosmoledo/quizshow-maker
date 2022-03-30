import getClient from "../Client.js";
import {
	Config,
	Guess,
	PlayerEvent,
	PlayerEvents,
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

const view = document.querySelector("#game-host") as HTMLElement;
const players = document.querySelector("#players") as HTMLDivElement;
const question = view.querySelector(".question") as HTMLDivElement;
const answer = view.querySelector(".answer") as HTMLDivElement;
const startGameButton = view.querySelector("#start-game") as HTMLButtonElement;
const fullyReadButton = view.querySelector("#fully-read") as HTMLButtonElement;
const nextQuestionButton = view.querySelector("#next-question") as HTMLButtonElement;
const questionAmountsElement = view.querySelector("#question-amount") as HTMLDivElement;

function toggleFullyReadButton(active: boolean): void {
	fullyReadButton.classList.toggle("btn-danger", active);

	if (active)
		fullyReadButton.classList.remove("btn-success", "disabled");
	else
		fullyReadButton.classList.add("btn-success", "disabled");
}

class Player {
	private card: HTMLDivElement;
	private score: HTMLInputElement;
	private buzzer: HTMLDivElement;
	private buzzerPos: HTMLElement;
	private answerCorrect: HTMLButtonElement;
	private answerWrong: HTMLButtonElement;
	private textbox: HTMLInputElement;
	private id: string;

	constructor(id: string, nickname: string) {
		this.id = id;

		const html = `
			<div class="card-body position-relative">
				<h3 class="card-title">${nickname}</h3>
				<div class="row mb-2">
					<label class="col-4 col-form-label">${translate("Score")}:</label>
					<div class="col px-1">
						<input type="number" class="form-control" value="0" min="0" max="999">
					</div>
				</div>
				<div class="row mb-2">
					<label class="col-4 col-form-label">${translate("Answer")}:</label>
					<div class="col px-1">
						<button class="btn btn-success w-100">${translate("Correct")}</button>
					</div>
					<div class="col px-1">
						<button class="btn btn-danger w-100">${translate("Wrong")}</button>
					</div>
				</div>
				
				<hr/>
				
				<textarea class="ESTIMATE form-control mb-2 d-none" type="text" rows="5" placeholder="${translate("GuessWillBeHere")}" readonly disabled></textarea>
				
				<div class="BUZZER d-flex align-items-center d-none" style="padding-left: 25px;">
					<div class="buzzer disabled mx-auto text-end" style="width: 50px"></div>
					<div class="w-50 text-start"><kbd></kbd></div>
				</div>
			</div>
		`;

		const card = document.createElement("div");
		card.classList.add("card");
		card.innerHTML = html;

		this.score = card.querySelector("input") as any;
		this.buzzer = card.querySelector(".buzzer") as any;
		this.buzzerPos = card.querySelector("kbd") as any;
		this.answerCorrect = card.querySelector("button.btn-success") as any;
		this.answerWrong = card.querySelector("button.btn-danger") as any;
		this.textbox = card.querySelector("textarea") as any;

		this.answerCorrect.addEventListener("click", () => this.sendAnswer(true));
		this.answerWrong.addEventListener("click", () => this.sendAnswer(false));
		this.score.addEventListener("change", () => {
			getClient().send(Types.S_ROOM_EVENT, ({
				id: this.id,
				score: parseInt(this.score.value),
				type: RoomEvents.CHANGE_SCORE
			}) as PlayerEvent);
		});

		this.card = card;
		players.querySelector(".card-placeholder")?.remove();
		players.appendChild(card);

		this.reset();
	}

	public setScore(score: number | string): void {
		this.score.value = score + "";
	}

	public handleGuess(guess: Guess): void {
		if (guess.answer === undefined) {
			// BUZZER
			this.activateAnswerButtons(true);
			this.buzzer.classList.add("buzzed");
			this.buzzerPos.innerHTML = guess.place + "";
		} else {
			// ESTIMATE
			this.setText(guess.answer);
			if (guess.final)
				this.activateAnswerButtons(true);
		}
	}

	public reset(): void {
		this.activateAnswerButtons(false);
		this.buzzer.classList.remove("buzzed");
		this.buzzerPos.innerHTML = "0";
		this.textbox.value = "";
		this.textbox.scrollTop = 0;
	}

	public setActive(active: boolean): void {
		this.card.classList.toggle("disabled", !active);
	}

	public setText(text: string): void {
		this.textbox.value = text;
		this.textbox.scrollTop = this.textbox.scrollHeight;
	}

	private sendAnswer(correct: boolean): void {
		if (correct)
			toggleFullyReadButton(false);

		getClient().send(Types.S_ROOM_EVENT, {
			id: this.id,
			correct,
			type: RoomEvents.DECIDE_POINT
		});
	}

	public activateAnswerButtons(activate: boolean, activateWrong: boolean = activate): void {
		this.answerCorrect.classList.toggle("disabled", !activate);
		this.answerWrong.classList.toggle("disabled", !activateWrong);
	}
}

export default async function init(): Promise < void > {
	await reset(false);
	await showElement(view);

	// start game button
	startGameButton.addEventListener("click", () => {
		startGameButton.classList.add("d-none");
		getClient().send(Types.S_ROOM_EVENT, {
			type: RoomEvents.START_GAME
		});
	});
	//

	let questionAmount = 0;

	getClient().get(Types.C_STARTED_GAME, async (data: any) => {
		question.innerHTML = translate("GameWillStart");
		questionAmount = data.questionAmount;

		const buzzers = Array.from(view.querySelectorAll(".BUZZER")) as HTMLElement[];
		const estimates = Array.from(view.querySelectorAll(".ESTIMATE")) as HTMLElement[];
		let lastQuestionType: Config.Type;

		fullyReadButton.classList.remove("d-none");
		fullyReadButton.addEventListener("click", () => {
			toggleFullyReadButton(false);
			getClient().send(Types.S_ROOM_EVENT, {
				type: RoomEvents.SHOW_QUESTION
			});
		});

		nextQuestionButton.classList.remove("d-none");
		nextQuestionButton.addEventListener("click", () => {
			for (const key in players)
				players[key].reset();

			getClient().send(Types.S_ROOM_EVENT, {
				type: RoomEvents.NEXT_QUESTION
			});
		});

		let playedQuestions = 0;

		const playQuestion = async (data: Config.ExtendedQuestion): Promise < void > => {
			if (lastQuestionType !== data.type) {
				lastQuestionType = data.type;
				await Promise.all(buzzers.map(buz => hideElement(buz)));
				await Promise.all(estimates.map(est => hideElement(est)));

				if (data.type === "BUZZER") {
					await Promise.all(buzzers.map(buz => showElement(buz)));
				} else {
					await Promise.all(estimates.map(est => showElement(est)));
					toggleFullyReadButton(false);
				}
			}

			if (!data.hasNext)
				await hideElement(nextQuestionButton);
			else {
				if (data.type === "BUZZER")
					toggleFullyReadButton(true);
				nextQuestionButton.classList.remove("disabled");
			}

			playedQuestions++;
			questionAmountsElement.innerHTML = playedQuestions + " / " + questionAmount;

			question.innerHTML = data.question;
			answer.innerHTML = data.answer;
		};

		if (data.skipAnim) {
			startGameButton.classList.add("d-none");
			await playQuestion(data.question);
			if (data.visible)
				toggleFullyReadButton(false);
		}

		getClient().get(Types.C_GAME_QUESTION, playQuestion);
	});

	const players: {
		[key: string]: Player
	} = {};

	function computeWinner(question: Config.Question, guesses: {
		[key: string]: string;
	}): void {
		console.log(question, guesses);

		for (const key in guesses) {
			players[key].setText(guesses[key]);
			players[key].activateAnswerButtons(true, false);
		}
	}

	// handle player events
	getClient().get(Types.C_PLAYER_CHANGE, (data: PlayerEvent | PlayerEvent[]) => {
		if (!Array.isArray(data))
			data = [data];

		data.forEach(da => {
			console.log(da);
			switch (da.type) {
				case PlayerEvents.JOIN:
					players[da.id] = new Player(da.id, da.nickname);

					if (!startGameButton.classList.contains("d-none") && Object.keys(players).length > 0)
						startGameButton.classList.remove("disabled");
					break;

				case PlayerEvents.LEAVE:
					players[da.id].setActive(false);
					break;

				case PlayerEvents.REJOIN:
					players[da.id].setActive(true);
					break;

				case PlayerEvents.GUESS:
					players[da.id].handleGuess(da.guess);
					break;

				case RoomEvents.CHANGE_SCORE:
					players[da.id].setScore(da.score);
					break;

				case RoomEvents.CHANGE_BUZZER:
					for (const key in players)
						players[key].reset();
					break;

				case RoomEvents.STOP_ESTIMATE:
					computeWinner((da as any).question, (da as any).guesses);
					break;

				default:
					break;
			}
		});
	});

	console.log("host");
}
