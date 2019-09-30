defmodule ConsciousPhoenixWeb.GameChannel do
  use Phoenix.Channel

  def join("game", _message, socket) do
    game = ConsciousPhoenix.GameServer.getGameState()
    {:ok, game, socket}
  end

  def handle_in("game:turn", %{"game" => game}, socket) do
    ConsciousPhoenix.GameServer.turn(game)
    {:noreply, socket}
  end

  def handle_in("game:reset", _, socket) do
    ConsciousPhoenix.GameServer.reset()
    {:noreply, socket}
  end
end
