import { InteractionResponseType } from "discord-interactions";
import {
	DiscordCommandData,
	DiscordCommandType,
	DiscordInteractionResponse,
} from "../../types/discord";

export const data: DiscordCommandData = {
	name: "ping",
	description: "Replies with pong",
	type: DiscordCommandType.CHAT_INPUT,
	default_member_permissions: "8",
};

export async function execute(): Promise<DiscordInteractionResponse> {
	return {
		type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
		data: {
			content: "Pong!",
		},
	};
}
