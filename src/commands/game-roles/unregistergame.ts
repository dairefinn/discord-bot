import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unregistergame")
  .setDescription("Un-register a game and delete the role for it");

export async function execute(interaction: CommandInteraction) {
  console.info("Running the unregistergame command");
  console.info("User ID: " + interaction.guildId);
  console.info("Guild ID: " + interaction.guildId);

  const userId: string = interaction.user.id;
  const guild: Guild | null = interaction.guild;

  if (!guild) {
    return interaction.reply("You must be in a server to use this command.");
  }

  const member = guild.members.cache.get(userId);
  if (!member) {
    return interaction.reply("You must be in a server to use this command.");
  }

  console.info("All prerequisites checks have passed");

  // Get the parameter the user provided
  console.info("Data: ", interaction.options.data);

  // TODO: If role with the given name already exists, return an error message
  return interaction.reply("Placeholder response");
}
