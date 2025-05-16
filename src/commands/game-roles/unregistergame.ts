import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("unregistergame")
  .setDescription("Un-register a game and delete the role for it")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the game to unregister")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  console.info("Running the unregistergame command");
  console.info("User ID: " + interaction.user.id);
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

  const game = interaction.options.get("name")?.value as string;
  if (!game) {
    return interaction.reply("You must provide a game name.");
  }

  console.info("All prerequisites checks have passed");

  const roleName = `${game} players`;

  // Get all roles in the guild
  const roles = guild.roles.cache;

  // Find the role (case-insensitive)
  const role = roles.find(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    return interaction.reply(`The role "${roleName}" does not exist.`);
  }

  // Delete the role
  try {
    await role.delete("Role deleted via unregistergame command");
    console.info(`Role deleted: ${role.name}`);
  } catch (error) {
    console.error("Error deleting role:", error);
    return interaction.reply("There was an error deleting the role.");
  }

  return interaction.reply(`Deleted role "${roleName}" for game "${game}".`);
}
