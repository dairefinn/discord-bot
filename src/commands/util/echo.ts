import { CommandInteraction, SlashCommandBuilder } from "discord.js";

/**
 * This command replies with "Pong!" when called.
 * It is used to test if the bot is working.
 */
export const data = new SlashCommandBuilder()
  .setName("echo")
  .setDescription("Replies with the content of the message object")
  .addStringOption((option) =>
    option
      .setName("contents")
      .setDescription("The contents to echo")
      .setRequired(false)
  );

export async function execute(interaction: CommandInteraction) {
  const output = JSON.stringify(interaction, (key, value) =>
    typeof value === "bigint" ? value.toString() : value
  );
  const contents = interaction.options.get("contents")?.value as string;
  if (contents) {
    return interaction.reply(`Contents: ${contents}`);
  }

  return interaction.reply(`${output}`);
}
