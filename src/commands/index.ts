import {
	DiscordCommandData,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../types/discord";
import { Env } from "../types/env";

import * as addgame from "./game-roles/addgame";
import * as removegame from "./game-roles/removegame";
import * as registergame from "./game-roles/registergame";
import * as unregistergame from "./game-roles/unregistergame";
import * as listgames from "./game-roles/listgames";

import * as echo from "./util/echo";
import * as ping from "./util/ping";

import * as event from "./events/event";

import * as synccommands from "./admin/synccommands";

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
	addgame,
	removegame,
	registergame,
	unregistergame,
	listgames,
	echo,
	ping,
	event,
	synccommands,
};
