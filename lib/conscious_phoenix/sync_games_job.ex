defmodule ConsciousPhoenix.SyncGamesJob do
  alias ConsciousPhoenix.GameServer

  def sync() do
    IO.puts("RUNNING SyncGamesJob")
    GameServer.save_updated_games()
  end
end
