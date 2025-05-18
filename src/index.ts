import {
	InteractionResponseFlags,
	InteractionResponseType,
	InteractionType,
} from "discord-interactions";
import { commands, Command } from "./commands";
import { DiscordInteraction } from "./types/discord";
import {
	corsOptionsResponse,
	errorResponse,
	jsonResponse,
	redirectResponse,
} from "./helpers/request-responses";
import { validateRequest } from "./helpers/request-validation";
import { CodeBlockError, MessageResponseError } from "./types/errors";
import { deleteCommand, getCommands, registerCommand } from "./api/commands";

export interface Env {
	DISCORD_TOKEN: string;
	DISCORD_PUBLIC_KEY: string;
	DISCORD_APPLICATION_ID: string;
	ALLOW_REGISTER_COMMANDS: boolean;
}

async function handleSlashCommand(
	env: Env,
	interaction: DiscordInteraction
): Promise<Response> {
	try {
		JSON.stringify(interaction);
		if (!interaction.data) {
			throw new CodeBlockError(
				"Missing command data",
				JSON.stringify(interaction)
			);
		}

		const command = commands[
			interaction.data.name as keyof typeof commands
		] as Command;
		if (!command) {
			throw new MessageResponseError(
				`Unknown command: ${interaction.data.name}`
			);
		}

		const response = await command.execute(interaction, env);
		return jsonResponse(response);
	} catch (error: unknown) {
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		return jsonResponse({
			type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
			data: {
				content: errorMessage,
				flags: InteractionResponseFlags.EPHEMERAL,
			},
		});
	}
}

async function handleAutocompleteCommand(
	env: Env,
	interaction: DiscordInteraction
): Promise<Response> {
	if (!interaction.data) {
		return errorResponse("Missing command data", 400);
	}

	const command = commands[
		interaction.data.name as keyof typeof commands
	] as Command;
	if (!command?.autocomplete) {
		return errorResponse(
			`Command ${interaction.data.name} does not support autocomplete`,
			400
		);
	}

	try {
		const response = await command.autocomplete(interaction, env);
		return jsonResponse(response);
	} catch (error: unknown) {
		console.error("Error handling autocomplete:", error);
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		return errorResponse(errorMessage, 500);
		// return jsonResponse({
		// 	type: InteractionResponseType.APPLICATION_COMMAND_AUTOCOMPLETE_RESULT,
		// 	data: {
		// 		choices: [],
		// 	},
		// });
	}
}

async function handleRegisterCommands(env: Env): Promise<Response> {
	if (!env.ALLOW_REGISTER_COMMANDS) {
		return errorResponse("Not found", 404);
	}

	const results: Record<string, unknown> = {};

	// // Unregister existing commands
	const existingCommands = await getCommands(env);
	// return jsonResponse(existingCommands);

	for (const command of existingCommands) {
		const commandId: string | undefined = command.id;
		if (!commandId) {
			results[command.name] = {
				success: false,
				error: "Command ID is missing",
			};
			continue;
		}

		try {
			const result = await deleteCommand(env, commandId);
			results[commandId] = { success: true, result };
		} catch (err) {
			results[commandId] = { success: false, error: (err as Error).message };
		}
	}

	// Register all commands
	for (const [name, command] of Object.entries(commands)) {
		try {
			const result = await registerCommand(env, command.data);
			results[name] = { success: true, result };
		} catch (err) {
			results[name] = { success: false, error: (err as Error).message };
		}
	}

	return jsonResponse(results);
}

async function handleListRegisteredCommands(env: Env): Promise<Response> {
	if (!env.ALLOW_REGISTER_COMMANDS) {
		return errorResponse("Not found", 404);
	}

	const commands = await getCommands(env);
	return jsonResponse(commands);
}

async function handleDeleteCommand(env: Env, body: string): Promise<Response> {
	if (!env.ALLOW_REGISTER_COMMANDS) {
		return errorResponse("Not found", 404);
	}

	// Get the commandId from the request body

	let commandId: string | undefined;
	try {
		const parsedBody = JSON.parse(body);
		commandId = parsedBody.commandId;
	} catch (error) {
		console.error("Failed to parse request body:", error);
		return errorResponse("Invalid request body", 400);
	}
	if (!commandId) {
		return errorResponse("Command ID is required", 400);
	}

	try {
		const result = await deleteCommand(env, commandId);
		return jsonResponse(result);
	} catch (err) {
		return errorResponse((err as Error).message, 500);
	}
}

async function handleRegisterCommand(
	env: Env,
	body: string
): Promise<Response> {
	if (!env.ALLOW_REGISTER_COMMANDS) {
		return errorResponse("Not found", 404);
	}

	// Get the command name from the request body
	let commandName: string | undefined;
	try {
		const parsedBody = JSON.parse(body);
		commandName = parsedBody.commandName;
	} catch (error) {
		console.error("Failed to parse request body:", error);
		return errorResponse("Invalid request body", 400);
	}

	// Get command data from the commands object
	const command = commands[commandName as keyof typeof commands];
	if (!command) {
		return errorResponse(`Command ${commandName} not found`, 404);
	}

	try {
		const result = await registerCommand(env, command.data);
		return jsonResponse(result);
	} catch (err) {
		return errorResponse((err as Error).message, 500);
	}
}

const worker = {
	async fetch(
		request: Request,
		env: Env,
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		_ctx: ExecutionContext
	): Promise<Response> {
		try {
			// Handle CORS preflight requests
			if (request.method === "OPTIONS") return corsOptionsResponse();

			// // Register commands endpoint (dev only)
			// if (
			// 	request.method === "POST" &&
			// 	new URL(request.url).pathname === "/register-commands"
			// ) {
			// 	return handleRegisterCommands(env);
			// }

			// Redirect GET requests to my website
			if (request.method === "GET")
				return redirectResponse("https://www.dairefinn.com");

			// Get the request body
			const body = await request.text();

			if (
				request.method === "POST" &&
				new URL(request.url).pathname === "/list-commands"
			) {
				return handleListRegisteredCommands(env);
			}

			if (
				request.method === "POST" &&
				new URL(request.url).pathname === "/delete-command"
			) {
				return handleDeleteCommand(env, body);
			}

			if (
				request.method === "POST" &&
				new URL(request.url).pathname === "/register-command"
			) {
				return handleRegisterCommand(env, body);
			}

			// Only allow POST requests
			if (request.method !== "POST")
				return errorResponse("Method not allowed", 405);

			// Validate the request
			try {
				await validateRequest(body, request, env);
			} catch (error) {
				return errorResponse("Invalid request", 401);
			}

			let interaction: DiscordInteraction;
			try {
				interaction = JSON.parse(body) as DiscordInteraction;
			} catch (error) {
				console.error("Failed to parse interaction:", error);
				return errorResponse("Invalid request body", 400);
			}

			console.log("Received command interaction:", interaction.type);

			// Handle interaction types
			switch (interaction.type) {
				case InteractionType.PING:
					return jsonResponse({ type: InteractionResponseType.PONG });
				case InteractionType.APPLICATION_COMMAND:
					return handleSlashCommand(env, interaction);
				case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
					return handleAutocompleteCommand(env, interaction);
				default:
					return errorResponse(
						`Unsupported interaction type: ${interaction.type}`,
						400
					);
			}
		} catch (error: unknown) {
			console.error("Unexpected error:", error);
			const errorMessage =
				error instanceof Error ? error.message : "An unexpected error occurred";
			return errorResponse(errorMessage, 500);
		}
	},
};

export default worker;
