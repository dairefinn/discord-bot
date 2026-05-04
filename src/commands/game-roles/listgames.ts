import { Env } from "../../types/env";
import {
	DiscordCommandData,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { fetchRoles } from "../../api/roles";
import { fetchMember } from "../../api/members";
import { getCommands } from "../../api/commands";
import { formatGameName, getGamePlayerRoles } from "../../helpers/game-roles";
import { ephemeralReply } from "../../helpers/interaction-reply";
import { slashCommandMention } from "../../helpers/slash-command";

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

	const gameRoles = getGamePlayerRoles(roles);

	if (gameRoles.length === 0) {
		return ephemeralReply("No games are registered yet.");
	}

	const addgameCmd = registeredCommands.find((c) => c.name === "addgame");
	const removegameCmd = registeredCommands.find((c) => c.name === "removegame");

	const groups = [
		{
			title: "🎮 Your Games",
			roles: gameRoles.filter((r) => member.roles.includes(r.id)),
			hint: removegameCmd
				? `Use ${slashCommandMention(removegameCmd)} to leave a game role.`
				: "",
		},
		{
			title: "📋 Available Games",
			roles: gameRoles.filter((r) => !member.roles.includes(r.id)),
			hint: addgameCmd
				? `Use ${slashCommandMention(addgameCmd)} to join a game role.`
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

	return ephemeralReply(content);
}
