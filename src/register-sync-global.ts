/// <reference types="node" />

/**
 * Register `/synccommands` as the only global application command.
 * Run after deploying or when changing that command's definition.
 *
 * Usage:
 *   yarn register-sync-global
 *
 * Requires DISCORD_TOKEN in .dev.vars or the environment.
 * Reads DISCORD_APPLICATION_ID from wrangler.toml [vars].
 */

import * as synccommands from "./commands/admin/synccommands";
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
	const token = process.env.DISCORD_TOKEN || loadDevVarsToken();

	if (!appId) {
		console.error("DISCORD_APPLICATION_ID not found in wrangler.toml [vars]");
		process.exit(1);
	}
	if (!token) {
		console.error(
			"DISCORD_TOKEN not found. Set it in .dev.vars or as an environment variable."
		);
		process.exit(1);
	}

	const commandsData = [synccommands.data];
	const url = `https://discord.com/api/v10/applications/${appId}/commands`;

	console.log(
		`Registering ${commandsData.length} global command (${synccommands.data.name})...`
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
		console.error(
			`Failed to register global commands (${response.status}):`,
			error
		);
		process.exit(1);
	}

	const result = await response.json();
	console.log(
		`Successfully registered global commands:`,
		(result as Array<{ name: string }>).map((cmd) => cmd.name).join(", ")
	);
}

main();
