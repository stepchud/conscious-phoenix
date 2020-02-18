defmodule ConsciousPhoenix.GameServer do
  use GenServer
  alias ConsciousPhoenixWeb.Endpoint

  defmodule GameState do
    defstruct(
      games: %{ }
    )
  end


  #API
  def start_link(_args, name) do
    GenServer.start_link(__MODULE__, :ok, name: name)
  end

  def turn(gid, game) do
    GenServer.cast(__MODULE__, %{action: :turn, gid: gid, game: game})
  end

  def reset() do
    GenServer.cast(__MODULE__, %{action: :reset})
  end

  def start(gid, name, sides) do
    GenServer.call(__MODULE__, %{action: :start_game, gid: gid, name: name, sides: sides})
  end

  def getGame(gid) do
    GenServer.call(__MODULE__, %{action: :get_game, gid: gid})
  end

  #Callbacks
  def init(:ok) do
    {:ok, %GameState{}}
  end

  def handle_call(%{action: :get_game, gid: gid}, _, state) do
    IO.puts "get_game #{gid}"
    IO.puts Map.keys(state.games)
    unless Map.has_key?(state.games, gid) do
      state = put_in(state.games[gid], %{name: 'Player One', sides: 6 })
    end
    {:reply, %{"gid" => gid, "game" => state.games[gid]}, state}
  end

  def handle_call(%{action: :start_game, gid: gid, name: name, sides: sides}, _, state) do
    # uuid = UUID.uuid4()
    # state = put_in(state.games[uuid], %{name: name, sides: sides})
    %{ state.games[gid] | name: name, sides: sides }
    Endpoint.broadcast("game:#{gid}", "update:game", %{game: state.games[gid]})
    {:reply, state}
  end

  def handle_cast(%{:action => :reset, :gid => gid}, state) do
    state = put_in(state.games[gid], %{})
    game = state.games[gid]
    Endpoint.broadcast("game:#{gid}", "update:game", %{game: game})
    {:noreply, state}
  end

  def handle_cast(%{:action => :turn, :gid => gid, :game => game}, state) do
    # Save the game state...
    state = put_in(state.games[gid], game)
    game = state.games[gid]
    Endpoint.broadcast("game:#{gid}", "update:game", %{game: game})

    # case can_move(state, x, y) do
    #   :true ->
    #     state = put_in state.board[y][x], "X"
    #     state = state
    #     |> check_finished
    #     |> make_random_move
    #     |> check_finished
    #     Endpoint.broadcast("game", "update:game", %{board: to_list(state.board), phase: state.phase})
    #     state
    #   :false -> state
    # end
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
