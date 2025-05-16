import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";
import {
  requireGuild,
  requireMember,
  requireStringParameter,
} from "../../helpers/command-validators";

export const data = new SlashCommandBuilder()
  .setName("unregistergame")
  .setDescription("Un-register a game and delete the role for it")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the game to unregister")
      .setRequired(true)
      .setAutocomplete(true)
  );

// Autocomplete handler for suggesting roles ending with "players"
export async function autocomplete(interaction: any) {
  try {
    const focusedOption = interaction.options.getFocused(true);
    const guild: Guild | null = interaction.guild;

    if (focusedOption.name === "name") {
      if (!guild) return interaction.respond([]);

      let roleOptions = guild.roles.cache.filter((role) =>
        role.name.toLowerCase().endsWith(" players")
      );

      if (focusedOption.value) {
        roleOptions = roleOptions.filter((role) =>
          role.name.toLowerCase().includes(focusedOption.value.toLowerCase())
        );
      }

      return interaction.respond(
        roleOptions.map((r) => {
          const nameWithoutAppendix = r.name.replace(/ players$/i, "");
          return {
            name: nameWithoutAppendix,
            value: nameWithoutAppendix,
          };
        })
      );
    }

    return interaction.respond([]);
  } catch (error) {
    console.error("Error in autocomplete:", error);
    await interaction.respond([]);
  }
}

export async function execute(interaction: CommandInteraction) {
  console.info("Running the unregistergame command");
  console.info("User ID: " + interaction.user.id);
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
