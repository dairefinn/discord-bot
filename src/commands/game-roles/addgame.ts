import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("addgame")
  .setDescription("Add yourself to a role associated with a game");

export async function execute(interaction: CommandInteraction) {
  console.info("Running the addgame command");
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

  return interaction.reply("Placeholder response");
}
