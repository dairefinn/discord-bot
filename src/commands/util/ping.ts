import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { replyEphemeral } from "../../helpers/response-utils";

/**
 * This command replies with "Pong!" when called.
 * It is used to test if the bot is working.
 */
export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Replies with Pong!");

export async function execute(interaction: CommandInteraction) {
  return replyEphemeral(interaction, "Pong!");
}
