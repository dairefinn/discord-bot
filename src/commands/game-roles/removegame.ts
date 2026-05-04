import { Env } from "../../types/env";
import { DiscordRole, fetchRoles } from "../../api/roles";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { fetchMember, removeMemberRole } from "../../api/members";
import {
	autocompleteResult,
	getAutocompleteFocus,
} from "../../helpers/autocomplete";
import { requireStringOption } from "../../helpers/command-validators";
import { buildSimpleGameRoleAutocompleteChoices } from "../../helpers/game-role-autocomplete";
import {
	findGamePlayersRole,
	gamePlayersRoleLabel,
} from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "removegame",
	description: "Remove a game role from yourself",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "The name of the game to remove",
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
		const member: DiscordMember = await fetchMember(
			env,
			interaction.guild_id,
			interaction.member.user.id
		);
		return autocompleteResult(
			buildSimpleGameRoleAutocompleteChoices(focusedValue, roles, (role) =>
				member.roles.includes(role.id)
			)
		);
	}

	return autocompleteResult([]);
}

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const member: DiscordMember = await fetchMember(
		env,
		interaction.guild_id,
		interaction.member.user.id
	);
	const name: string = await requireStringOption(
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

	if (!member.roles.includes(existingRole.id)) {
		throw new MessageResponseError(`You don't have the role for "${name}".`);
	}

	await removeMemberRole(
		env,
		interaction.guild_id,
		member.user.id,
		existingRole.id
	);

	return ephemeralReply(`You've been removed from the "${roleName}" role.`);
}
