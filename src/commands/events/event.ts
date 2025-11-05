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

const getEventIdFromURL = (url: string): string | null => {
	const urlWithoutProtocol = url.replace(/^https?:\/\//, "");

	const splitUrl = urlWithoutProtocol
		.split("/")
		.filter((segment) => segment.trim() !== "");
	const hostname = splitUrl[0];

	if (hostname === "discord.com") {
		const eventId = splitUrl[3];
		if (!eventId) return null;
		return eventId;
	}

	if (hostname === "discord.gg") {
		const queryParams = splitUrl[1].split("?")[1];
		const eventId = queryParams?.split("=")[1];
		if (!eventId) return null;
		return eventId;
	}

	return null;
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

	// Extract the event ID so we can construct the full URL safely.
	// This should prevent anyone from injecting their own URL and abusing the @eveyone mention.
	const eventId = getEventIdFromURL(eventUrl);
	if (!eventId) {
		throw new MessageResponseError("Please provide a valid Discord event URL.");
	}

	const constructedUrl = `https://discord.com/events/${interaction.guild_id}/${eventId}`;

	// Create the announcement message with @everyone mention and event link
	const message = `@everyone New event! Express your interest here:\n${constructedUrl}`;

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
