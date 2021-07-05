defmodule ConsciousPhoenix.SyncGamesJob do
  require Logger
  alias ConsciousPhoenix.GameServer

  def sync() do
    Logger.debug("RUNNING SyncGamesJob")
    GameServer.save_updated_games()
  end
end
