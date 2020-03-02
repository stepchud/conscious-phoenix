defmodule ConsciousPhoenix.GameServer do
  use GenServer
  alias ConsciousPhoenixWeb.Endpoint

  defmodule Game do
    @derive {Jason.Encoder, only: [:name, :sides, :roll]}

    defstruct(
      name: "",
      sides: -1,
      roll: -1
      # gid:   %{ },
      # board: %{ },
      # cards: %{ },
      # ep:    %{ },
      # fd:    %{ },
      # laws:  %{ },
      # modal: %{ }
    )
  end

  defmodule WorldState do
    defstruct(
      games: %{ }
    )
  end


  #API
  def start_link(_args, name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def roll(gid, roll) do
    GenServer.cast(__MODULE__, %{action: :roll, gid: gid, roll: roll})
  end

  def turn(gid, game) do
    GenServer.cast(__MODULE__, %{action: :turn, gid: gid, game: game})
  end

  def reset() do
    GenServer.cast(__MODULE__, %{action: :reset})
  end

  def start(gid, name, sides) do
    GenServer.cast(__MODULE__, %{action: :start_game, gid: gid, name: name, sides: sides})
  end

  def getGame(gid) do
    GenServer.call(__MODULE__, %{action: :get_game, gid: gid})
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
    new_game = %Game{ name: name, sides: sides, roll: -1 }
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:update", %{game: new_game})
    {:noreply, state}
  end

  def handle_cast(%{:action => :roll, :gid => gid, :roll => roll}, state) do
    game = state.games[gid]
    IO.puts "roll before: #{game.roll}"
    state = put_in(state.games[gid].roll, roll)
    IO.puts "roll after: #{state.games[gid].roll}"
    Endpoint.broadcast!("game:#{gid}", "game:update", %{game: state.games[gid]})
    {:noreply, state}
  end

  def handle_cast(%{:action => :turn, :gid => gid, :game => game}, state) do
    # Save the game state...
    state = put_in(state.games[gid], game)
    game = state.games[gid]
    Endpoint.broadcast!("game:#{gid}", "game:update", %{game: game})

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
    {:noreply, state}
  end

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
