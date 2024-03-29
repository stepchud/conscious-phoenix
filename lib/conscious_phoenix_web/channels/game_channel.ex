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

  def handle_in("game:start", %{"name" => name, "icon" => icon, "sides" => sides}, socket) do
    GameServer.start_game(socket.assigns.gid, name, icon, sides)
    {:noreply, socket}
  end

  def handle_in("game:start_after_wait", %{}, socket) do
    GameServer.start_after_wait(socket.assigns.gid)
    {:noreply, socket}
  end

  def handle_in("game:wait", %{"name" => name, "icon" => icon, "sides" => sides}, socket) do
    GameServer.wait_game(socket.assigns.gid, name, icon, sides)
    {:noreply, socket}
  end

  def handle_in("game:join", %{"gid" => gid, "pid" => pid, "name" => name, "icon" => icon}, socket) do
    GameServer.join_game(socket.assigns.gid, gid, pid, name, icon)
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

  def handle_in("game:fifth_striving", %{"pid" => pid, "game" => game}, socket) do
    GameServer.fifth_striving(socket.assigns.gid, pid, game)
    {:noreply, socket}
  end

  def handle_in("game:choose_fifth", %{"pid" => pid, "lower_pid" => lower, "card" => card}, socket) do
    GameServer.choose_fifth(socket.assigns.gid, pid, lower, card)
    {:noreply, socket}
  end

  def handle_in("game:choose_astral", %{"pid" => pid, "replace" => replace}, socket) do
    GameServer.choose_astral(socket.assigns.gid, pid, replace)
    {:noreply, socket}
  end

  def handle_in("game:try_to_take_card", %{"pid" => pid, "card" => card}, socket) do
    GameServer.try_to_take_card(socket.assigns.gid, pid, card)
    {:noreply, socket}
  end

  def handle_in("game:log_event", %{"pid" => pid, "event" => event}, socket) do
    GameServer.log_event(socket.assigns.gid, pid, event)
    {:noreply, socket}
  end
end
