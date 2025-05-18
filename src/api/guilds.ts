import { Env } from "..";
import { DiscordGuild } from "../types/discord";
import { CodeBlockError, MessageResponseError } from "../types/errors";

export async function fetchGuild(
	env: Env,
	guildId: string
): Promise<DiscordGuild> {
	let guild: DiscordGuild | null = null;

	try {
		const guildResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}`,
			{
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);

		guild = await guildResponse.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error fetching guild information:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!guild) {
		throw new MessageResponseError("Could not fetch guild information.");
	}

	return guild;
}
