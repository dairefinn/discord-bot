import { Env } from "..";
import { DiscordCommandData } from "../types/discord";
import { CodeBlockError } from "../types/errors";

const BASE_URL = "https://discord.com/api/v10/applications";

export async function registerCommand(
	env: Env,
	commandData: DiscordCommandData,
	guildId?: string
) {
	console.log("Registering command:", JSON.stringify(commandData));
	let response: Response;

	try {
		const url = guildId
			? `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/guilds/${guildId}/commands`
			: `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/commands`;
		response = await fetch(url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${env.DISCORD_TOKEN}`,
			},
			body: JSON.stringify(commandData),
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error registering command:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!response.ok) {
		console.error(await response.json());
		throw new Error(`Failed to register command: ${response.statusText}`);
	}

	return response.json();
}

export async function deleteCommand(
	env: Env,
	commandId: string,
	guildId?: string
): Promise<{ success: boolean }> {
	let response: Response;
	try {
		const url = guildId
			? `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/guilds/${guildId}/commands/${commandId}`
			: `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/commands/${commandId}`;
		response = await fetch(url, {
			method: "DELETE",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${env.DISCORD_TOKEN}`,
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error deleting command:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!response.ok) {
		throw new Error(`Failed to delete command: ${response.statusText}`);
	}

	// Discord returns 204 No Content on success
	if (response.status === 204) {
		return { success: true };
	}

	// If there is a body, try to parse it
	const text = await response.text();
	return text ? JSON.parse(text) : { success: true };
}

export async function getCommands(
	env: Env,
	guildId?: string
): Promise<DiscordCommandData[]> {
	let response: Response;
	try {
		const url = guildId
			? `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/guilds/${guildId}/commands`
			: `${BASE_URL}/${env.DISCORD_APPLICATION_ID}/commands`;
		response = await fetch(url, {
			method: "GET",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bot ${env.DISCORD_TOKEN}`,
			},
		});
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error listing commands:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!response.ok) {
		throw new Error(`Failed to get commands: ${response.statusText}`);
	}

	return await response.json();
}
