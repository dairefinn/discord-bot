import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import { Env } from "../..";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { MessageResponseError } from "../../types/errors";

export const data: DiscordCommandData = {
	name: "event",
	description: "Manage Discord events",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "init",
			description: "Initialize an event announcement with @everyone mention",
			type: DiscordCommandOptionType.SUB_COMMAND,
			options: [
				{
					name: "event_url",
					description: "The Discord event URL",
					type: DiscordCommandOptionType.STRING,
					required: true,
				},
			],
		},
	],
	default_member_permissions: "10000000",
};

export async function execute(
	interaction: DiscordInteraction,
	env: Env
): Promise<DiscordInteractionResponse> {
	// Get the subcommand
	const subcommand = interaction.data?.options?.find(
		(opt) => opt.type === DiscordCommandOptionType.SUB_COMMAND
	);

	if (!subcommand || subcommand.name !== "init") {
		throw new MessageResponseError("Invalid subcommand.");
	}

	// Get the event_url from the subcommand options
	const eventUrlOption = subcommand.options?.find(
		(opt) => opt.name === "event_url"
	);
	const eventUrl = eventUrlOption?.value;

	if (!eventUrl || typeof eventUrl !== "string") {
		throw new MessageResponseError("Event URL is required.");
	}

	// Validate that it looks like a Discord event URL
	if (
		!eventUrl.includes("discord.com/events/") &&
		!eventUrl.includes("discord.gg/")
	) {
		throw new MessageResponseError(
			"Please provide a valid Discord event URL (should contain 'discord.com/events/' or 'discord.gg/')."
		);
	}

	// Create the announcement message with @everyone mention and event link
	const message = `@everyone New event! Express your interest here:\n${eventUrl}`;

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: message,
			allowed_mentions: {
				parse: ["everyone"],
			},
		},
	};
}
