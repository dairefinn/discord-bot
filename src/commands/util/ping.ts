import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, FlagEphemeral } from '../../types/discord';

/**
 * This command replies with "Pong!" when called.
 * It is used to test if the bot is working.
 */
export const data = {
  name: "ping",
  description: "Replies with Pong!",
  type: 1 // CHAT_INPUT
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function execute(_interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: "Pong!",
      flags: FlagEphemeral
    }
  };
}
