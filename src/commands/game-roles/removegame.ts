import {
  CommandInteraction,
  SlashCommandBuilder,
  Guild,
  CacheType,
} from "discord.js";
import {
  requireGuild,
  requireMember,
  requireStringParameter,
} from "../../helpers/command-validators";
import { replyEphemeral } from "../../helpers/response-utils";

export const data = new SlashCommandBuilder()
  .setName("removegame")
  .setDescription("Remove yourself from a role associated with a game")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the game to leave")
      .setRequired(true)
      .setAutocomplete(true)
  );

// Autocomplete handler for suggesting only the user's game roles
export async function autocomplete(interaction: any) {
  try {
    const focusedOption = interaction.options.getFocused(true);
    const guild: Guild | null = interaction.guild;
    const userId: string = interaction.user.id;

    if (focusedOption.name === "name") {
      if (!guild) return interaction.respond([]);

      const member = guild.members.cache.get(userId);
      if (!member) return interaction.respond([]);

      let roleOptions = member.roles.cache.filter((role) =>
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

export async function execute(interaction: CommandInteraction<CacheType>) {
  console.info("Running the removegame command");
  console.info("User ID: " + interaction.user.id);
  console.info("Guild ID: " + interaction.guildId);

  const guild = requireGuild(interaction);
  const member = requireMember(interaction, guild);
  const game = requireStringParameter(
    interaction,
    "game",
    "You must provide a game name."
  );

  console.info("All prerequisites checks have passed");

  const roleName = `${game} players`;
  const role = member.roles.cache.find(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    return replyEphemeral(
      interaction,
      `You do not have the "${roleName}" role.`
    );
  }

  try {
    await member.roles.remove(role);
    console.info(`Removed role "${roleName}" from user ${member.user.tag}`);
  } catch (error) {
    console.error("Error removing role:", error);
    return replyEphemeral(interaction, "There was an error removing the role.");
  }

  return replyEphemeral(
    interaction,
    `You have been removed from the "${roleName}" role.`
  );
}
