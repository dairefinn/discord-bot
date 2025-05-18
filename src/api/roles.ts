import { Env } from "..";
import { DiscordInteraction } from "../types/discord";
import { CodeBlockError } from "../types/errors";

export interface DiscordRole {
	id: string;
	name: string;
	permissions: string;
	color: number;
	hoist: boolean;
	position: number;
	mentionable: boolean;
}

export async function fetchRoles(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordRole[]> {
	try {
		const guildId = interaction.guild_id;

		// Get all roles to check admin permissions
		const rolesResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/roles`,
			{
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);

		return rolesResponse.json();
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error fetching roles:",
				error.stack || error.message
			);
		}

		throw error;
	}
}

export async function createRole(
	interaction: DiscordInteraction,
	env: Env,
	roleName: string
): Promise<DiscordRole> {
	let createRoleResponse: Response;
	try {
		const guildId = interaction.guild_id;

		createRoleResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/roles`,
			{
				method: "POST",
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					name: roleName,
					color: 0x000000, // Black color
					hoist: false, // Don't display role members separately
					mentionable: true, // Allow mentioning the role
				}),
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error creating role:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!createRoleResponse.ok) {
		throw new Error("Failed to create role");
	}

	return createRoleResponse.json();
}

export async function deleteRole(
	interaction: DiscordInteraction,
	env: Env,
	roleId: string
): Promise<void> {
	let deleteRoleResponse: Response;
	try {
		const guildId = interaction.guild_id;

		deleteRoleResponse = await fetch(
			`https://discord.com/api/v10/guilds/${guildId}/roles/${roleId}`,
			{
				method: "DELETE",
				headers: {
					Authorization: `Bot ${env.DISCORD_TOKEN}`,
				},
			}
		);
	} catch (error) {
		if (error instanceof Error) {
			throw new CodeBlockError(
				"Error deleting role:",
				error.stack || error.message
			);
		}

		throw error;
	}

	if (!deleteRoleResponse.ok) {
		throw new Error("Failed to delete the role. Please try again later.");
	}
}
