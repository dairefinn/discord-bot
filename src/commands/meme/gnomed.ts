import { CommandInteraction, SlashCommandBuilder, Guild } from "discord.js";
import {
  AudioPlayer,
  AudioPlayerStatus,
  VoiceConnectionStatus,
  createAudioPlayer,
  createAudioResource,
  joinVoiceChannel,
} from "@discordjs/voice";
import { join } from "node:path";

/**
 * This command joins the current user's channel and plays the gnomed sound effect, then leaves.
 * I'm using this to test the bot's join, speak and leave functionality.
 */
export const data = new SlashCommandBuilder()
  .setName("gnomed")
  .setDescription("If you are in a voice channel, you will be gnomed.");

export async function execute(interaction: CommandInteraction) {
  console.info("Running the gnomed command");
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

  // Find out if the user is in a voice channel or not
  if (!member.voice.channel) {
    return interaction.reply(
      "You must be in a voice channel to use this command."
    );
  }

  if (!member.voice.channel.joinable || !member.voice.channel.isVoiceBased()) {
    return interaction.reply("I cannot join your voice channel.");
  }

  console.info("All prerequisites checks have passed");

  const channelId = member.voice.channel.id;
  const guildId = guild.id;
  const voiceAdapterCreator = guild.voiceAdapterCreator;

  // join the voice channel
  const connection = joinVoiceChannel({
    channelId: channelId,
    guildId: guildId,
    adapterCreator: voiceAdapterCreator,
  });
  const audioPlayer: AudioPlayer = createAudioPlayer();
  connection.subscribe(audioPlayer);

  // let resource = createAudioResourceFromFileName("gnomed.mp3");

  connection.on(VoiceConnectionStatus.Connecting, () => {
    console.info("Connecting to voice channel");
  });

  connection.on(VoiceConnectionStatus.Ready, () => {
    console.info("Connected to voice channel");
  });

  connection.on(VoiceConnectionStatus.Disconnected, () => {
    console.info("Disconnected from voice channel");
  });

  audioPlayer.on("error", (error) => {
    console.error("Error playing audio:", error.message);
    connection.destroy();
    return interaction.reply("There was an error gnoming you.");
  });

  audioPlayer.on(AudioPlayerStatus.Idle, () => {
    console.info("Audio player is idle");
    connection.destroy();
    return interaction.reply("You've been gnomed.");
  });

  audioPlayer.on(AudioPlayerStatus.Playing, () => {
    console.info("Audio player is playing");
  });

  audioPlayer.on(AudioPlayerStatus.AutoPaused, () => {
    audioPlayer.unpause();
  });

  const filePath = join(__dirname, "../assets/audio/gnomed.mp3");
  console.info("File path is: " + filePath);

  const audioResource = createAudioResource(filePath, {
    metadata: {
      title: "Test song name",
    },
  });

  audioPlayer.play(audioResource);
}
