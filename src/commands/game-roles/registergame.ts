import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";

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

  const userId: string = interaction.user.id;
  const guild: Guild | null = interaction.guild;

  if (!guild) {
    return interaction.reply("You must be in a server to use this command.");
  }

  const member = guild.members.cache.get(userId);
  if (!member) {
    return interaction.reply("You must be in a server to use this command.");
  }

  if (!member.permissions.has("Administrator")) {
    return interaction.reply("You must be an admin to use this command.");
  }

  const game = interaction.options.get("name")?.value as string;
  // console.info("Options: " + JSON.stringify(interaction.options));
  // console.info("Game name: " + game);
  if (!game) {
    return interaction.reply("You must provide a game name.");
  }

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
