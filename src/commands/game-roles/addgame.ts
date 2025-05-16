import {
  CommandInteraction,
  SlashCommandBuilder,
  Guild,
  CacheType,
  MessageFlags,
} from "discord.js";
import {
  requireGuild,
  requireMember,
  requireStringParameter,
} from "../../helpers/command-validators";
import { replyEphemeral } from "../../helpers/response-utils";

export const data = new SlashCommandBuilder()
  .setName("addgame")
  .setDescription("Add yourself to a role associated with a game")
  .addStringOption((option) =>
    option
      .setName("name")
      .setDescription("Name of the game to join")
      .setRequired(true)
      .setAutocomplete(true)
  );

// Autocomplete handler for suggesting game roles
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
          const nameWithoutAppendix = r.name.replace(" players", "");
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
  console.info("Running the addgame command");
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
  const role = guild.roles.cache.find(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    return replyEphemeral(
      interaction,
      `The role "${roleName}" does not exist.`
    );
  }

  if (member.roles.cache.has(role.id)) {
    return replyEphemeral(
      interaction,
      `You already have the "${roleName}" role.`
    );
  }

  try {
    await member.roles.add(role);
    console.info(`Added role "${roleName}" to user ${member.user.tag}`);
  } catch (error) {
    console.error("Error adding role:", error);
    return replyEphemeral(interaction, "There was an error adding the role.");
  }

  return replyEphemeral(
    interaction,
    `You have been added to the "${roleName}" role.`
  );
}
