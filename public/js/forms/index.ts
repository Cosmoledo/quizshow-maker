import initJoinGame from "./join-game.js";
import initHostGame from "./host-game.js";
import {
	showElement,
	hideElement
} from "./methods.js";

const introduction = document.querySelector("#introduction") as HTMLElement;
const formHostGame = document.querySelector("#form-host-game") as HTMLElement;
const formJoinGame = document.querySelector("#form-join-game") as HTMLElement;

const hostGameButton = document.querySelector("#host-game") as HTMLButtonElement;
const joinGameButton = document.querySelector("#join-game") as HTMLButtonElement;

initHostGame(formHostGame);
initJoinGame(formJoinGame);

hostGameButton.addEventListener("click", async () => {
	await hideElement(introduction);
	await showElement(formHostGame);
});

joinGameButton.addEventListener("click", async () => {
	await hideElement(introduction);
	await showElement(formJoinGame);
});

export async function reset(toDefault: boolean = true): Promise < void > {
	await hideElement(formHostGame);
	await hideElement(formJoinGame);

	if (toDefault)
		await showElement(introduction);
	else
		await hideElement(introduction);
}
