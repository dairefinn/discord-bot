import {
	InteractionResponseFlags,
	InteractionResponseType,
} from "discord-interactions";
import {
	DiscordCommandData,
	DiscordCommandOptionType,
	DiscordCommandType,
	DiscordInteraction,
	DiscordInteractionResponse,
} from "../../types/discord";
import { MessageResponseError } from "../../types/errors";

/**
 * This command echoes back the message content or shows the interaction object.
 */
export const data: DiscordCommandData = {
	name: "echo",
	description: "Replies with the content of the message",
	type: DiscordCommandType.CHAT_INPUT,
	options: [
		{
			name: "message",
			description: "The message to echo",
			type: DiscordCommandOptionType.STRING,
			required: true,
		},
	],
};

export async function execute(
	interaction: DiscordInteraction
): Promise<DiscordInteractionResponse> {
	const message = interaction.data?.options?.find(
		(opt) => opt.name === "message"
	)?.value;

	if (!message || typeof message !== "string") {
		throw new MessageResponseError("Please provide a message to echo.");
	}

	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: message,
			flags: InteractionResponseFlags.EPHEMERAL,
		},
	};
}
