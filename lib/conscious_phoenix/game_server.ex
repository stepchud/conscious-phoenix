defmodule ConsciousPhoenix.GameServer do
  use GenServer

  alias ConsciousPhoenix.Game
  alias ConsciousPhoenix.Player
  alias ConsciousPhoenixWeb.Endpoint


  defmodule WorldState do
    defstruct(
      games: %{ }
    )
  end


  #API
  def start_link(_args, name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def getGame(gid) do
    GenServer.call(__MODULE__, %{action: :get_game, gid: gid})
  end

  def start(gid, name, sides) do
    GenServer.cast(__MODULE__, %{action: :start_game, gid: gid, name: name, sides: sides})
  end

  def join(assigns_gid, gid, pid, name) do
    GenServer.cast(__MODULE__, %{action: :join, assigns_gid: assigns_gid, gid: gid, pid: pid})
  end

  def endTurn(gid, game) do
    GenServer.cast(__MODULE__, %{action: :end_turn, gid: gid, game: game})
  end

  def reset() do
    GenServer.cast(__MODULE__, %{action: :reset})
  end

  #Callbacks
  def init(:ok) do
    {:ok, %WorldState{}}
  end

  def handle_call(%{action: :get_game, gid: gid}, _, state) do
    IO.puts "Games (#{map_size(state.games)}):"
    Enum.each(state.games, fn {gid, _} -> IO.puts "gid=#{gid}" end)
    {:reply, %{"gid" => gid, "game" => state.games[gid]}, state}
  end

  def handle_cast(%{action: :start_game, gid: gid, name: name, sides: sides}, state) do
    IO.puts "start_game<#{gid}> (#{name}, #{sides})"
    player = %Player{ name: name }
    new_game = %Game{
      players: %{ player.pid => player },
      board: %{ sides: sides, roll: 0 },
    }
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:started", %{name: name, pid: player.pid, sides: sides})

    {:noreply, state}
  end

  def handle_cast(%{
    :action => :join,
    :assigns_gid => assigns_gid, :gid => gid, :pid => pid, name: name
  }, state) do
    game = state.games[gid]
    case { game, pid, game.players[pid] } do
      { nil, _, _ } ->
        Endpoint.broadcast!("game:#{assigns_gid}",
          "modal:error", %{ error: %{ message: "Game not found" } })
        {:noreply, state}
      { _, nil, _ } -> # add new player
        player = %Player{ name: name }
        state = put_in(state.players, Map.put(game.players, player.pid, player))
        IO.puts "new joiner #{pid}"
        Endpoint.broadcast!("game:#{assigns_gid}",
          "game:joined", %{ gid: gid, pid: player.pid, game: game })
        {:noreply, state}
      { _, _ , nil } -> # pid not found
        IO.puts "unknown pid #{pid}"
        Endpoint.broadcast!("game:#{assigns_gid}",
          "modal:error", %{ error: %{ message: "Player not found" } })
        {:noreply, state}
      true -> # continue game
        IO.puts "game continued #{pid}"
        Endpoint.broadcast!("game:#{assigns_gid}",
          "game:joined", %{ gid: gid, pid: pid, game: game })
        {:noreply, state}
    end
  end

  def handle_cast(%{:action => :end_turn, :gid => gid, :game => game}, state) do
    # Save the game state...
    game = Game.save_turn(state.games[gid], game)
    state = put_in(state.games[gid], game)
    pid = Game.next_turn(game)
    Endpoint.broadcast!("game:#{gid}", "game:next_turn", %{ pid: pid })
    {:noreply, state}
  end

    # case can_move(state, x, y) do
    #   :true ->
    #     state = put_in state.board[y][x], "X"
    #     state = state
    #     |> check_finished
    #     |> make_random_move
    #     |> check_finished
    #     Endpoint.broadcast("game", "game:update", %{board: to_list(state.board), phase: state.phase})
    #     state
    #   :false -> state
    # end

  def handle_cast(%{:action => :reset, :gid => gid}, state) do
    state = put_in(state.games[gid], %{})
    game = state.games[gid]
    Endpoint.broadcast!("game:#{gid}", "game:update", %{game: game})
    {:noreply, state}
  end

  # defp can_move(state, x, y) do
  #   case {state.board[y][x], is_finished(state)} do
  #     {".", :false} -> :true
  #     _ -> :false
  #   end
  # end

  # defp check_finished(state) do
  #   case is_finished(state) do
  #     {:true, :tie} -> %State{state|phase: "tie"}
  #     {:true, winner} -> %State{state|phase: winner <> " won"}
  #     _ -> state
  #   end
  # end

  # defp is_finished(state) do
  #   case to_list(state.board) do
  #     [[x, x, x],_,_] when x != "." -> {:true, x}
  #     [_,[x, x, x],_] when x != "." -> {:true, x}
  #     [_,_,[x, x, x]] when x != "." -> {:true, x}
  #     [[x, _, _],[x,_,_],[x,_,_]] when x != "." -> {:true, x}
  #     [[_, x, _],[_,x,_],[_,x,_]] when x != "." -> {:true, x}
  #     [[_, _, x],[_,_,x],[_,_,x]] when x != "." -> {:true, x}
  #     [[x, _, _],[_,x,_],[_,_,x]] when x != "." -> {:true, x}
  #     [[_, _, x],[_,x,_],[x,_,_]] when x != "." -> {:true, x}
  #     _ ->
  #       case Enum.all?(List.flatten(to_list(state.board)), &(&1 != ".")) do
  #         :true -> {:true, :tie}
  #         :false -> :false
  #       end
  #   end
  # end

  # defp make_random_move(state) do
  #   case is_finished(state) do
  #     {:true, _} -> state
  #     _ ->
  #       x = Enum.random(0..2)
  #       y = Enum.random(0..2)
  #       case state.board[y][x] do
  #         "." -> put_in state.board[y][x], "O"
  #         _ -> make_random_move(state)
  #       end
  #   end
  # end

  # defp to_list(matrix) when is_map(matrix) do
  #   for {_index, value} <- matrix,
  #       into: [],
  #       do: to_list(value)
  # end

  # defp to_list(other), do: other

end
