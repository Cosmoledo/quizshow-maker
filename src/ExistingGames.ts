import fs from "fs";
import path from "path";

import {
	Config,
	ExistingGame,
	FilterGames
} from "../index.js";

const gamesFile = path.resolve("existing-games/games.json");
const gamesData: ExistingGame.Game[] = JSON.parse(fs.readFileSync(gamesFile) + "").games;

const gamesConfig: {
	[key: string]: Config.root
} = {};

gamesData.forEach(game => {
	const gameFile = path.resolve(`existing-games/${game.id}.json`);

	if (!fs.existsSync(gameFile))
		throw new Error("Can't find " + gameFile);

	gamesConfig[game.id] = JSON.parse(fs.readFileSync(gameFile) + "");
});

export function getExistingGame(id: string): Config.root {
	return gamesConfig[id];
}

// TODO filters are currently not applied, would also need a front-end change
export function getExistingGames(filters: FilterGames): ExistingGame.Game[] {
	// console.log(filters);

	return gamesData;
}
