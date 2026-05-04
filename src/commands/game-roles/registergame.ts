import { InteractionResponseType } from "discord-interactions";
import { Env } from "../../types/env";
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
import { getCommands } from "../../api/commands";
import { findGamePlayersRole, gamePlayersRoleLabel } from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { slashCommandMention } from "../../helpers/slash-command";

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
	await requireAdmin(roles, member, guild);

	const roleName = gamePlayersRoleLabel(name);
	const existingRole = findGamePlayersRole(roles, name);

	if (existingRole) {
		return ephemeralReply(`A role for "${name}" already exists.`);
	}

	const newRole: DiscordRole = await createRole(interaction, env, roleName);
	const registeredCommands: DiscordCommandData[] = await getCommands(env);
	const addgameCmd: DiscordCommandData | undefined = registeredCommands.find(
		(cmd) => cmd.name === "addgame"
	);
	const addgameMention = slashCommandMention(addgameCmd) || "/addgame";

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: `<@&${newRole.id}> has been created. Use ${addgameMention} to join it.`,
		},
	};
}
