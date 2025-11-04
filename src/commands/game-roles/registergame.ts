import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import { DiscordRole, fetchRoles, createRole } from "../../api/roles";
import {
	requireStringOption,
	requireAdmin,
} from "../../helpers/command-validators";
import {
	DiscordCommandData,
	DiscordInteraction,
	DiscordInteractionResponse,
	DiscordGuild,
	DiscordCommandType,
	DiscordCommandOptionType,
} from "../../types/discord";
import { fetchGuild } from "../../api/guilds";
import { fetchMember } from "../../api/members";

export const data: DiscordCommandData = {
	name: "registergame",
	description: "Register a new game role",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "name",
			description: "Name of the game to register",
			type: DiscordCommandOptionType.STRING,
			required: true,
		},
	],
	default_member_permissions: "10000000",
};

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const guild: DiscordGuild = await fetchGuild(env, interaction.guild_id);
	const member = await fetchMember(
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
	requireAdmin(roles, member, guild);

	const roleName = `${name} players`;
	const existingRole = roles.find(
		(role) => role.name.toLowerCase() === roleName.toLowerCase()
	);

	if (existingRole) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: `A role for "${name}" already exists.`,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}

	await createRole(interaction, env, roleName);

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `Added "${roleName}" role.`,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
