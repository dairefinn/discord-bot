import { Env } from "../../types/env";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { DiscordRole, fetchRoles } from "../../api/roles";
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
import { addMemberRole, fetchMember } from "../../api/members";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "addgame",
	description: "Add a game role to yourself",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "Name of the game to add",
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
			buildSimpleGameRoleAutocompleteChoices(
				focusedValue,
				roles,
				(role) => !member.roles.includes(role.id)
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

	if (member.roles.includes(existingRole.id)) {
		throw new MessageResponseError(`You already have the role "${roleName}".`);
	}

	await addMemberRole(
		env,
		interaction.guild_id,
		interaction.member.user.id,
		existingRole.id
	);

	return ephemeralReply(`You've been added to the "${roleName}" role.`);
}
