import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";
import {
  requireGuild,
  requireMember,
  requireStringParameter,
} from "../../helpers/command-validators";

export const data = new SlashCommandBuilder()
  .setName("registergame")
  .setDescription("Register a game and create a role for it")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the game to register")
      .setRequired(true)
  );

export async function execute(interaction: CommandInteraction) {
  console.info("Running the registergame command");
  console.info("User ID: " + interaction.guildId);
  console.info("Guild ID: " + interaction.guildId);

  const guild = requireGuild(interaction);
  requireMember(interaction, guild, "Administrator");
  const game = requireStringParameter(
    interaction,
    "game",
    "You must provide a game name."
  );

  console.info("All prerequisites checks have passed");

  const roleName = `${game} players`;

  // Get all roles in the guild
  const roles = guild.roles.cache;

  // Check if the role already exists
  const roleNameLower = roleName.toLowerCase();
  const alreadyExists = roles.some(
    (role) => role.name.toLowerCase() === roleNameLower
  );
  if (alreadyExists) {
    return interaction.reply(`The role "${roleName}" already exists.`);
  }

  // Create the role
  try {
    const role = await guild.roles.create({
      name: roleName,
      color: "#000000",
      reason: `Role created for game: ${game}`,
      mentionable: true,
      permissions: [],
    });
    console.info(`Role created: ${role.name}`);
  } catch (error) {
    console.error("Error creating role:", error);
    return interaction.reply("There was an error creating the role.");
  }

  return interaction.reply(`Created role "${roleName}" for game "${game}".`);
}
