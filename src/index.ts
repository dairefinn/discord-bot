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
import { InteractionLogger } from "./helpers/interaction-logger";
import { Env } from "./types/env";

export type { Env };

async function handleSlashCommand(
	env: Env,
	interaction: DiscordInteraction
): Promise<Response> {
	const logger = new InteractionLogger(interaction, "COMMAND");

	try {
		JSON.stringify(interaction);
		if (!interaction.data) {
			throw new CodeBlockError(
				"Missing command data",
				JSON.stringify(interaction)
			);
		}

		logger.log("Command started");

		const command = commands[
			interaction.data.name as keyof typeof commands
		] as Command;
		if (!command) {
			throw new MessageResponseError(
				`Unknown command: ${interaction.data.name}`
			);
		}

		logger.log("Executing command");
		const response = await command.execute(interaction, env);
		logger.log("Command executed successfully");
		logger.finish("success");
		return jsonResponse(response);
	} catch (error: unknown) {
		logger.log("Command execution failed");
		logger.finish("error", error);
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
	const logger = new InteractionLogger(interaction, "AUTOCOMPLETE");

	if (!interaction.data) {
		logger.finish("error", new Error("Missing command data"));
		return errorResponse("Missing command data", 400);
	}

	logger.log("Autocomplete started");

	const command = commands[
		interaction.data.name as keyof typeof commands
	] as Command;
	if (!command?.autocomplete) {
		const error = new Error(
			`Command ${interaction.data.name} does not support autocomplete`
		);
		logger.finish("error", error);
		return errorResponse(error.message, 400);
	}

	try {
		logger.log("Executing autocomplete");
		const response = await command.autocomplete(interaction, env);
		logger.log("Autocomplete completed successfully");
		logger.finish("success");
		return jsonResponse(response);
	} catch (error: unknown) {
		logger.log("Autocomplete execution failed");
		logger.finish("error", error);
		const errorMessage =
			error instanceof Error ? error.message : "An error occurred";
		return errorResponse(errorMessage, 500);
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

			// Redirect GET requests to my website
			if (request.method === "GET")
				return redirectResponse("https://www.dairefinn.com");

			// Only allow POST requests
			if (request.method !== "POST")
				return errorResponse("Method not allowed", 405);

			// Get the request body
			const body = await request.text();

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

			// Handle interaction types
			switch (interaction.type) {
				case InteractionType.PING:
					console.log("[INTERACTION] Responding to PING");
					return jsonResponse({ type: InteractionResponseType.PONG });
				case InteractionType.APPLICATION_COMMAND:
					return handleSlashCommand(env, interaction);
				case InteractionType.APPLICATION_COMMAND_AUTOCOMPLETE:
					return handleAutocompleteCommand(env, interaction);
				default:
					console.log(
						`[INTERACTION] Unsupported interaction type: ${interaction.type}`
					);
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
