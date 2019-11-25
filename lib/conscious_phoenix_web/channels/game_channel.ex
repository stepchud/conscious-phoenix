defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel

  def join("game:_", _message, socket) do
    {:ok, "__START__", socket}
  end

  def join("game:" <> gid, _message, socket) do
    state = ConsciousPhoenix.GameServer.getGameState(gid)
    {:ok, state, socket}
  end

  def handle_in("game:reset", _, socket) do
    {:ok, "__START__", socket}
  end

  def handle_in("game:start", %{"name" => name, "sides" => sides}, socket) do
    ConsciousPhoenix.GameServer.start(name, sides)
    {:noreply, socket}
  end

  def handle_in("game:turn", %{"gid" => gid, "game" => game}, socket) do
    ConsciousPhoenix.GameServer.turn(gid, game)
    {:noreply, socket}
  end
end
