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

  def handle_in("game:roll", %{"roll" => roll}, socket) do
    IO.puts "topic = #{socket.topic}"
    GameServer.roll(socket.assigns.gid, roll)
    {:noreply, socket}
  end

  def handle_in("game:turn", %{"game" => game}, socket) do
    GameServer.turn(socket.assigns.gid, game)
    {:noreply, socket}
  end
end
