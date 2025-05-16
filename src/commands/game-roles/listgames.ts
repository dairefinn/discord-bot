import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";
import { replyEphemeral } from "../../helpers/response-utils";

export const data = new SlashCommandBuilder()
  .setName("listgames")
  .setDescription("Get a list of all games you can register for");

export async function execute(interaction: CommandInteraction) {
  console.info("Running the listgames command");
  console.info("User ID: " + interaction.guildId);
  console.info("Guild ID: " + interaction.guildId);

  const userId: string = interaction.user.id;
  const guild: Guild | null = interaction.guild;

  if (!guild) {
    return replyEphemeral(
      interaction,
      "You must be in a server to use this command."
    );
  }

  const member = guild.members.cache.get(userId);
  if (!member) {
    return replyEphemeral(
      interaction,
      "You must be in a server to use this command."
    );
  }

  console.info("All prerequisites checks have passed");

  // Get the parameter the user provided
  console.info("Data: ", interaction.options.data);

  // TODO: If role with the given name already exists, return an error message
  return replyEphemeral(interaction, "Placeholder response");
}
