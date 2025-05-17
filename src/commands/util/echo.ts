import { InteractionResponseType } from 'discord-interactions';
import { DiscordInteraction, DiscordInteractionResponse, FlagEphemeral } from '../../types/discord';

/**
 * This command echoes back the message content or shows the interaction object.
 */
export const data = {
  name: "echo",
  description: "Replies with the content of the message",
  type: 1, // CHAT_INPUT
  options: [
    {
      name: "message",
      description: "The message to echo",
      type: 3, // STRING
      required: true
    }
  ]
};

export async function execute(interaction: DiscordInteraction): Promise<DiscordInteractionResponse> {
  const message = interaction.data?.options?.find(opt => opt.name === "message")?.value;
  
  if (!message || typeof message !== 'string') {
    return {
      type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
      data: {
        content: "Please provide a message to echo.",
        flags: FlagEphemeral
      }
    };
  }

  return {
    type: InteractionResponseType.CHANNEL_MESSAGE_WITH_SOURCE,
    data: {
      content: message,
      flags: FlagEphemeral
    }
  };
}
