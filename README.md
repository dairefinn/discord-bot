# Overview

This is a bot for the Discord app which I am creating because I am bored waiting for the game "The Lord of the Rings: Return to Moria" to install :)

I've recently started developing it again because I want to manage roles on my server. We have a role for every game we play and if we want to play it, we'll usually mention the role in the chat using @.

This bot allows me to create new roles for any games we are playing. For Example I could use `/registergame Arc raiders` to create the "Arc raiders players" role. Anyone interested in playing can use the `/addgame` command to add themselves to the new role and when someone types `@Arc Raiders Players` in a channel they will be notified. When a person decides they no longer want to play a game they can use `/removegame` to remove themselves from the role. If nobody is playing a game anymore and I don't see us playing again in the future I can use `/unregistergame` to delete the role.

`/addgame`, `/removegame`, `/unregistergame`, `/listgame`, and `/registerplayer` have autocomplete suggestions which query the existing roles and members to suggest them to the user. The bot knows which roles to suggest because all the game roles end with " players" - this is just a convention I've chosen to make it easier to identify the game roles without having to use any sort of database.

## Slash command registration

The first time you add this bot to a Discord server, run `yarn register` on your machine so Discord receives every slash command for that guild. I can automate this via global commands but that becomes super annoying when I want to add new commands because it can take a few hours to sync them - this works for now :). To run this you'll need to add some IDs to your environment variables (see **Environment variables**). After that initial push, you can use `/synccommands` in Discord to update command definitions without running the script again.

# Features

## Game role management

I'm using this bot to manage roles on my server. Admins can register and unregister games that players are playing in their server. Players can then opt in to roles related to these games. This allows players to mention the role in the chat to try and get others to play with them.

**Commands:**

- `/addgame <GAME_NAME>` - Adds you to the role of the provided game if it exists.
- `/removegame <GAME_NAME>` - Removes you from the role of the provided game if it exists.
- `/listgames` - Lists all registered games, split into games you've joined and games available to join.
- `/listgame <GAME_NAME>` - Lists all members who currently have that game's role.
- `/registergame <GAME_NAME>` - _(Admin)_ Registers a game with the bot. This will create a new role with the name of the game.
- `/registerplayer <game> <players>` - _(Admin)_ Adds one or more members to a game role. Use mentions, user IDs, or autocomplete; you can paste several at once for bulk adds.
- `/unregistergame <GAME_NAME>` - _(Admin)_ Unregisters a game with the bot. This will delete the role with the name of the game.

## Event announcements

Admins can broadcast Discord events to the server with an `@everyone` mention so nobody misses out. The bot validates and reconstructs the event URL to prevent abuse of the `@everyone` ping.

**Commands:**

- `/event init <EVENT_URL>` - _(Admin)_ Posts an `@everyone` announcement linking to the provided Discord event.

## Utility & admin

A handful of commands for bot administration and diagnostics. `/synccommands` pushes the latest command definitions to a server, while `/ping` and `/echo` are quick health-checks.

- `/synccommands` - _(Admin)_ Bulk-overwrites all bot commands on the current server.
- `/ping` - _(Admin)_ Replies with "Pong!".
- `/echo <MESSAGE>` - _(Admin)_ Echoes the provided message back.

# Environment variables

- DISCORD_TOKEN - The token used to authenticate with the Discord API
- DISCORD_CLIENT_ID - The client ID used to identify the user authenticating with the Discord API
