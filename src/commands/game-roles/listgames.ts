import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import {
	DiscordCommandData,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { DiscordRole, fetchRoles } from "../../api/roles";
import { fetchMember } from "../../api/members";
import { getCommands } from "../../api/commands";

export const data: DiscordCommandData = {
	name: "listgames",
	description: "List all available games and which ones you've joined",
	type: DiscordCommandType.CHAT_INPUT,
};

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	const [roles, member, registeredCommands] = await Promise.all([
		fetchRoles(interaction, env),
		fetchMember(env, interaction.guild_id, interaction.member.user.id),
		getCommands(env),
	]);

	const gameRoles = roles
		.filter((role) => role.name.toLowerCase().endsWith(" players"))
		.sort((a, b) => a.name.toLowerCase().localeCompare(b.name.toLowerCase()));

	if (gameRoles.length === 0) {
		return {
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: "No games are registered yet.",
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		};
	}

	const formatGameName = (role: DiscordRole) =>
		role.name.replace(/ players$/i, "");

	const formatCommand = (cmd: DiscordCommandData | undefined) =>
		cmd?.id ? `</${cmd.name}:${cmd.id}>` : cmd?.name ?? "";

	const addgameCmd = registeredCommands.find((c) => c.name === "addgame");
	const removegameCmd = registeredCommands.find((c) => c.name === "removegame");

	const groups = [
		{
			title: "🎮 Your Games",
			roles: gameRoles.filter((r) => member.roles.includes(r.id)),
			hint: removegameCmd
				? `Use ${formatCommand(removegameCmd)} to leave a game role.`
				: "",
		},
		{
			title: "📋 Available Games",
			roles: gameRoles.filter((r) => !member.roles.includes(r.id)),
			hint: addgameCmd
				? `Use ${formatCommand(addgameCmd)} to join a game role.`
				: "",
		},
	];

	const content = groups
		.filter((g) => g.roles.length > 0)
		.map((g) => {
			const lines = [`**${g.title}**`];
			if (g.hint) lines.push(g.hint);
			lines.push(...g.roles.map((r) => `- ${formatGameName(r)}`));
			return lines.join("\n");
		})
		.join("\n\n");

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
