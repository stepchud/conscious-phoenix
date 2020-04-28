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

  def get_game(gid) do
    GenServer.call(__MODULE__, %{action: :get_game, gid: gid})
  end

  def start_game(gid, name, sides) do
    GenServer.cast(__MODULE__, %{action: :start_game, gid: gid, name: name, sides: sides})
  end

  def join_game(assigns_gid, gid, pid, name) do
    GenServer.cast(__MODULE__, %{action: :join_game, assigns_gid: assigns_gid, gid: gid, pid: pid, name: name})
  end

  def continue_game(assigns_gid, gid, pid) do
    GenServer.cast(__MODULE__, %{action: :continue_game, assigns_gid: assigns_gid, gid: gid, pid: pid})
  end

  def end_turn(gid, pid, game) do
    GenServer.cast(__MODULE__, %{action: :end_turn, gid: gid, pid: pid, game: game})
  end

  def save_state(gid, pid, game) do
    GenServer.cast(__MODULE__, %{action: :save_state, gid: gid, pid: pid, game: game})
  end

  def reset() do
    GenServer.cast(__MODULE__, %{action: :reset})
  end

  #Callbacks
  def init(:ok) do
    {:ok, %WorldState{}}
  end

  def handle_call(%{action: :get_game, gid: gid}, _, state) do
    IO.puts "Games (#{map_size(state.games)}): [#{Enum.join(Enum.keys(state.games), ", ")}]"
    {:reply, %{"gid" => gid, "game" => state.games[gid]}, state}
  end

  def handle_cast(%{action: :start_game, gid: gid, name: name, sides: sides}, state) do
    IO.puts "start_game<#{gid}> (#{name}, #{sides})"
    player = %Player{ name: name, pid: Player.generate_pid() }
    new_game = %Game{
      players: %{ player.pid => player },
      board: %{ sides: sides, roll: 0 },
    }
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:started", %{name: name, pid: player.pid, sides: sides})
    {:noreply, state}
  end

  def handle_cast(%{
    :action => :continue_game,
    :assigns_gid => assigns_gid, :gid => gid, :pid => pid
  }, state) do
    game = state.games[gid]
    if (is_nil(game)) do
      Endpoint.broadcast!("game:#{assigns_gid}",
        "modal:error", %{ error: %{ message: "Game not found!" } })
      {:noreply, state}
    else
      case { pid, game.players[pid] } do
        { nil, _ } ->
          Endpoint.broadcast!(
            "game:#{assigns_gid}",
            "modal:error",
            %{ error: %{ message: "Player id missing!" } }
          )
          {:noreply, state}
        { _, nil } ->
          Endpoint.broadcast!(
            "game:#{assigns_gid}",
            "modal:error",
            %{ error: %{ message: "Player not found!" } }
          )
          {:noreply, state}
        { _, _ } ->
          IO.puts "existing player continued #{gid}:#{pid}"
          Endpoint.broadcast!(
            "game:#{assigns_gid}",
            "game:continued",
            %{ gid: gid, pid: pid, game: game }
          )
          {:noreply, state}
      end
    end
  end

  def handle_cast(%{
    :action => :join_game,
    :assigns_gid => assigns_gid, :gid => gid, :pid => pid, name: name
  }, state) do
    game = state.games[gid]
    if (is_nil(game)) do
      IO.puts "game not found! #{gid}"
      Endpoint.broadcast!("game:#{assigns_gid}", "modal:error", %{ error: %{ message: "Game not found!" } })
      {:noreply, state}
    else
      IO.puts "found a game with players #{Enum.join(Map.keys(game.players), ", ")}"
      {msg, game, pid} = join_player(game, pid, name)
      state = put_in(state.games[gid], game)
      IO.puts "game now has players #{Enum.join(Map.keys(state.games[gid].players), ", ")}"
      Endpoint.broadcast!( "game:#{assigns_gid}", msg, %{ gid: gid, pid: pid, game: game })
      {:noreply, state}
    end
  end

  def handle_cast(%{:action => :end_turn, :gid => gid, :pid => pid, :game => updates}, state) do
    # Save the game state...
    game = Game.save_state(state.games[gid], pid, updates)
    state = put_in(state.games[gid], game)
    nextPid = Game.next_turn(game)
    Endpoint.broadcast!("game:#{gid}", "game:next_turn", %{ pid: nextPid })
    {:noreply, state}
  end

  def handle_cast(%{:action => :save_state, :gid => gid, :pid => pid, :game => updates}, state) do
    IO.puts "state saved"
    # Save the game state...
    game = Game.save_state(state.games[gid], pid, updates)
    state = put_in(state.games[gid], game)
    Endpoint.broadcast!("game:#{gid}", "game:saved", %{ pid: pid })
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

  defp join_player(game, pid, name) do
    case { pid, game.players[pid] } do
      { nil, _ } ->
        player = %Player{ name: name, pid: Player.generate_pid() }
        IO.puts "new player pid joined: #{player.pid}"
        game = put_in(game.players, Map.put(game.players, player.pid, player))
        {"game:joined", game, player.pid}
      { _, nil } ->
        IO.puts "existing pid joined:#{pid}"
        player = %Player{ name: name, pid: pid }
        game = put_in(game.players, Map.put(game.players, player.pid, player))
        {"game:joined", game, pid}
      true -> # continue game
        IO.puts "existing player continued:#{pid}"
        {"game:continued", game, pid}
    end
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
