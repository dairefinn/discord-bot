import {
	DiscordCommandData,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../types/discord";
import { Env } from "../index";

import * as addgame from "./game-roles/addgame";
import * as removegame from "./game-roles/removegame";
import * as registergame from "./game-roles/registergame";
import * as unregistergame from "./game-roles/unregistergame";

import * as echo from "./util/echo";
import * as registercommands from "./util/registercommands";
import * as registercommand from "./util/registercommand";
import * as deletecommands from "./util/deletecommands";
import * as listcommands from "./util/listcommands";

export interface Command {
	data: DiscordCommandData;
	execute: (
		interaction: DiscordInteraction,
		env: Env
	) => Promise<DiscordInteractionResponse>;
	autocomplete?: (
		interaction: DiscordInteraction,
		env: Env
	) => Promise<DiscordInteractionResponse>;
}

/**
 * This file registers all commands.
 * When a new command is created, it should be added here in order to be usable.
 */
export const commands: { [key: string]: Command } = {
	registercommand,
	deletecommands,
	registercommands,
	listcommands,
	addgame,
	removegame,
	registergame,
	unregistergame,
	echo,
};
