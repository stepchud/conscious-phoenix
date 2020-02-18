defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel

  def join("game:" <> gid, _message, socket) do
    state = ConsciousPhoenix.GameServer.getGame(gid)
    {:ok, state, socket}
  end

  def handle_in("game:start", %{"gid" => gid, "name" => name, "sides" => sides}, socket) do
    ConsciousPhoenix.GameServer.start(gid, name, sides)
    {:noreply, socket}
  end

  def handle_in("game:turn", %{"gid" => gid, "game" => game}, socket) do
    ConsciousPhoenix.GameServer.turn(gid, game)
    {:noreply, socket}
  end
end
