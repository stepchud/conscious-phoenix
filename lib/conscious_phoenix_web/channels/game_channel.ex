defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel
  alias ConsciousPhoenix.GameServer

  def join("game:" <> gid, _message, socket) do
    IO.puts "Join #{gid}"
    socket = socket
      |> assign(:gid, gid)
    state = GameServer.get_game(gid)
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
    GameServer.end_turn(socket.assigns.gid, pid, game)
    {:noreply, socket}
  end

  def handle_in("game:save_state", %{"pid" => pid, "game" => game}, socket) do
    GameServer.save_state(socket.assigns.gid, pid, game)
    {:noreply, socket}
  end

  def handle_in("game:over", %{"pid" => pid}, socket) do
    GameServer.game_over(socket.assigns.gid, pid)
    {:noreply, socket}
  end

  def handle_in("game:exchange_dupes", %{"pid" => pid}, socket) do
    GameServer.exchange_dupes(socket.assigns.gid, pid)
    {:noreply, socket}
  end

  def handle_in("game:fifth_striving", %{"pid" => pid}, socket) do
    GameServer.fifth_striving(socket.assigns.gid, pid)
    {:noreply, socket}
  end

  def handle_in("game:log_event", %{"pid" => pid, "event" => event}, socket) do
    GameServer.log_event(socket.assigns.gid, pid, event)
    {:noreply, socket}
  end
end
