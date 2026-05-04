import { Env } from "../../types/env";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { DiscordRole, fetchRoles } from "../../api/roles";
import { fetchGuildMembers } from "../../api/members";
import {
	autocompleteResult,
	getAutocompleteFocus,
} from "../../helpers/autocomplete";
import { buildGameRoleAutocompleteChoices } from "../../helpers/game-role-autocomplete";
import {
	findGamePlayersRole,
	formatGameName,
	gamePlayersRoleLabel,
} from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { buildBulletMentionListContent } from "../../helpers/member-mention-list";
import { requireStringOption } from "../../helpers/command-validators";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "listgame",
	description: "List all members who have a game role",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "Name of the game",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
	],
};

export async function autocomplete(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const { optionName, value: focusedValue } = getAutocompleteFocus(interaction);

	if (optionName === "name") {
		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		return autocompleteResult(
			buildGameRoleAutocompleteChoices(focusedValue, roles)
		);
	}

	return autocompleteResult([]);
}

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const name = await requireStringOption(
		interaction,
		"name",
		"Game name is required."
	);
	const roles: DiscordRole[] = await fetchRoles(interaction, env);
	const roleName = gamePlayersRoleLabel(name);
	const existingRole = findGamePlayersRole(roles, name);

	if (!existingRole) {
		throw new MessageResponseError(`The role "${roleName}" does not exist.`);
	}

	const members = await fetchGuildMembers(env, interaction.guild_id);
	const withRole = members.filter((m) => m.roles.includes(existingRole.id));

	const gameLabel = formatGameName(existingRole);

	if (withRole.length === 0) {
		return ephemeralReply(`**${gameLabel}**\n\nNo one has this role yet.`);
	}

	const { content, allowed_mentions } = buildBulletMentionListContent(
		gameLabel,
		withRole
	);

	return ephemeralReply(content, { allowed_mentions });
}
