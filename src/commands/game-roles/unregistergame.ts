import { Env } from "../../types/env";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordGuild,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordMember,
} from "../../types/discord";
import { deleteRole, DiscordRole, fetchRoles } from "../../api/roles";
import {
	requireAdmin,
	requireStringOption,
} from "../../helpers/command-validators";
import {
	autocompleteResult,
	getAutocompleteFocus,
} from "../../helpers/autocomplete";
import { buildSimpleGameRoleAutocompleteChoices } from "../../helpers/game-role-autocomplete";
import {
	findGamePlayersRole,
	gamePlayersRoleLabel,
} from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { fetchGuild } from "../../api/guilds";
import { fetchMember } from "../../api/members";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "unregistergame",
	description: "Unregister a game role",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "The name of the game to unregister",
			type: DiscordCommandOptionType.STRING,
			required: true,
			autocomplete: true,
		},
	],
	default_member_permissions: "10000000",
};

export async function autocomplete(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const { optionName, value: focusedValue } = getAutocompleteFocus(interaction);

	if (optionName === "name") {
		const roles: DiscordRole[] = await fetchRoles(interaction, env);
		return autocompleteResult(
			buildSimpleGameRoleAutocompleteChoices(focusedValue, roles)
		);
	}

	return autocompleteResult([]);
}

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const guild: DiscordGuild = await fetchGuild(env, interaction.guild_id);
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
	await requireAdmin(roles, member, guild);

	const roleName = gamePlayersRoleLabel(name);
	const existingRole = findGamePlayersRole(roles, name);

	if (!existingRole) {
		throw new MessageResponseError(`No role found for "${name}".`);
	}

	await deleteRole(interaction, env, existingRole.id);

	return ephemeralReply(`Deleted "${roleName}" role.`);
}
