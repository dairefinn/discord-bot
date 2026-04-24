/// <reference types="node" />

/**
 * One-time bootstrap script to register all slash commands with Discord.
 * After running this once, use the /synccommands slash command to sync future changes.
 *
 * Usage:
 *   npm run register
 *
 * Requires DISCORD_TOKEN to be set in .dev.vars or as an environment variable.
 * Reads DISCORD_APPLICATION_ID and DISCORD_GUILD_ID from wrangler.toml.
 */

import { commands } from "./commands";
import { readFileSync } from "fs";
import { resolve } from "path";

function loadWranglerVars(): Record<string, string> {
	const wranglerPath = resolve(__dirname, "..", "wrangler.toml");
	const content = readFileSync(wranglerPath, "utf-8");
	const vars: Record<string, string> = {};

	let inVars = false;
	for (const line of content.split("\n")) {
		const trimmed = line.trim();
		if (trimmed === "[vars]") {
			inVars = true;
			continue;
		}
		if (trimmed.startsWith("[") && trimmed !== "[vars]") {
			inVars = false;
			continue;
		}
		if (!inVars || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

		const eqIdx = trimmed.indexOf("=");
		const key = trimmed.slice(0, eqIdx).trim();
		const value = trimmed
			.slice(eqIdx + 1)
			.trim()
			.replace(/^["']|["']$/g, "");
		vars[key] = value;
	}
	return vars;
}

function loadDevVarsToken(): string | undefined {
	try {
		const devVarsPath = resolve(__dirname, "..", ".dev.vars");
		const content = readFileSync(devVarsPath, "utf-8");
		for (const line of content.split("\n")) {
			const trimmed = line.trim();
			if (trimmed.startsWith("DISCORD_TOKEN")) {
				const eqIdx = trimmed.indexOf("=");
				if (eqIdx !== -1) {
					return trimmed
						.slice(eqIdx + 1)
						.trim()
						.replace(/^["']|["']$/g, "");
				}
			}
		}
	} catch {
		return undefined;
	}
	return undefined;
}

async function main() {
	const wranglerVars = loadWranglerVars();
	const appId = wranglerVars["DISCORD_APPLICATION_ID"];
	const guildId = wranglerVars["DISCORD_GUILD_ID"];
	const token = process.env.DISCORD_TOKEN || loadDevVarsToken();

	if (!appId) {
		console.error("DISCORD_APPLICATION_ID not found in wrangler.toml [vars]");
		process.exit(1);
	}
	if (!guildId) {
		console.error("DISCORD_GUILD_ID not found in wrangler.toml [vars]");
		process.exit(1);
	}
	if (!token) {
		console.error(
			"DISCORD_TOKEN not found. Set it in .dev.vars or as an environment variable."
		);
		process.exit(1);
	}

	const commandsData = Object.values(commands).map((cmd) => cmd.data);
	const url = `https://discord.com/api/v10/applications/${appId}/guilds/${guildId}/commands`;

	console.log(
		`Registering ${commandsData.length} commands to guild ${guildId}...`
	);

	const response = await fetch(url, {
		method: "PUT",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bot ${token}`,
		},
		body: JSON.stringify(commandsData),
	});

	if (!response.ok) {
		const error = await response.text();
		console.error(`Failed to register commands (${response.status}):`, error);
		process.exit(1);
	}

	const result = await response.json();
	console.log(
		`Successfully registered ${(result as unknown[]).length} commands:`,
		(result as Array<{ name: string }>).map((cmd) => cmd.name).join(", ")
	);
}

main();
