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
    GameServer.start_game(socket.assigns.gid, name, sides)
    {:noreply, socket}
  end

  def handle_in("game:join", %{"gid" => gid, "pid" => pid, "name" => name}, socket) do
    GameServer.join_game(socket.assigns.gid, gid, pid, name)
    {:noreply, socket}
  end

  def handle_in("game:continue", %{"gid" => gid, "pid" => pid}, socket) do
    GameServer.continue_game(socket.assigns.gid, gid, pid)
    {:noreply, socket}
  end

  def handle_in("game:end_turn", %{"pid" => pid, "game" => game}, socket) do
    GameServer.endTurn(socket.assigns.gid, pid, game)
    {:noreply, socket}
  end
end
