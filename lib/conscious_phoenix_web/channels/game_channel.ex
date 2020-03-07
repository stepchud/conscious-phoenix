defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel
  alias ConsciousPhoenix.GameServer

  def join("game:" <> gid, _message, socket) do
    IO.puts "join #{gid}"
    socket = socket
      |> assign(:gid, gid)
    state = GameServer.getGame(gid)
    {:ok, state, socket}
  end

  def handle_in("game:start", %{"name" => name, "sides" => sides}, socket) do
    GameServer.start(socket.assigns.gid, name, sides)
    {:noreply, socket}
  end

  def handle_in("game:join", %{"game" => gid}, socket) do
    GameServer.join(socket.assigns.gid, gid)
    {:noreply, socket}
  end

  def handle_in("game:update", %{"game" => game}, socket) do
    GameServer.turn(socket.assigns.gid, game)
    {:noreply, socket}
  end
end
