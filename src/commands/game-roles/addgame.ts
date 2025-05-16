import {
  CommandInteraction,
  SlashCommandBuilder,
  Guild,
  CacheType,
} from "discord.js";

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
  const role = guild.roles.cache.find(
    (role) => role.name.toLowerCase() === roleName.toLowerCase()
  );

  if (!role) {
    return interaction.reply(`The role "${roleName}" does not exist.`);
  }

  if (member.roles.cache.has(role.id)) {
    return interaction.reply(`You already have the "${roleName}" role.`);
  }

  try {
    await member.roles.add(role);
    console.info(`Added role "${roleName}" to user ${userId}`);
  } catch (error) {
    console.error("Error adding role:", error);
    return interaction.reply("There was an error adding the role.");
  }

  return interaction.reply(`You have been added to the "${roleName}" role.`);
}
