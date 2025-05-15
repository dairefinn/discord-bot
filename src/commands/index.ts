import * as ping from "./util/ping";
import * as echo from "./util/echo";

import * as gnomed from "./meme/gnomed";

import * as addgame from "./game-roles/addgame";
import * as removegame from "./game-roles/removegame";
import * as registergame from "./game-roles/registergame";
import * as unregistergame from "./game-roles/unregistergame";
import * as listgames from "./game-roles/listgames";

/**
 * This file registers all commands.
 * When a new command is created, it should be added here in order to be usable.
 */
export const commands = {
  ping,
  gnomed,
  addgame,
  removegame,
  registergame,
  unregistergame,
  listgames,
  echo,
};
