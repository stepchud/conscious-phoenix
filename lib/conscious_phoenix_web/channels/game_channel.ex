defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel
  alias ConsciousPhoenix.GameServer

  def join("game:" <> gid, _message, socket) do
    IO.puts "Join #{gid}"
    socket = socket
      |> assign(:gid, gid)
    state = GameServer.getGame(gid)
    {:ok, state, socket}
  end

  def handle_in("game:start", %{"name" => name, "sides" => sides}, socket) do
    GameServer.start(socket.assigns.gid, name, sides)
    {:noreply, socket}
  end

  def handle_in("game:join", %{"game" => gid, "name" => name}, socket) do
    GameServer.join(socket.assigns.gid, gid, name)
    {:noreply, socket}
  end

  def handle_in("game:end_turn", %{"game" => game}, socket) do
    GameServer.endTurn(socket.assigns.gid, game)
    {:noreply, socket}
  end
end
