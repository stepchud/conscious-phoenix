defmodule ConsciousPhoenix.SyncGamesJob do
  alias ConsciousPhoenix.GameServer

  def sync() do
    GameServer.save_updated_games()
  end
end
