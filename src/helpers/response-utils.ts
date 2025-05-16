import { CommandInteraction, MessageFlags } from "discord.js";

export const replyEphemeral = async (
  interaction: CommandInteraction,
  content: string
) => {
  await interaction.reply({
    content: content,
    flags: MessageFlags.Ephemeral,
  });
};
