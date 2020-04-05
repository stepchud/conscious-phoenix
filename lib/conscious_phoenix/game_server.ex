defmodule ConsciousPhoenix.GameServer do
  use GenServer
  alias ConsciousPhoenixWeb.Endpoint

  defmodule Player do
    @derive {Jason.Encoder,
      only: [:name, :age, :hand, :laws, :fd, :ep]}

    defstruct(
      name: "anon",
      age: 0,
      hand: [ ],
      laws: %{ },
      fd: %{ },
      ep: %{ }
    )
  end

  defmodule Game do
    @derive {Jason.Encoder,
      only: [:board, :cards, :laws, :player, :fd, :ep, :modal]}

    defstruct(
      board: %{ },
      cards: %{ },
      laws:  %{ },
      player: %Player{ },
      fd:    %{ },
      ep:    %{ },
      modal: %{ }
    )

    # def generateDeck do
    #   deck = [
    #     "2D", "2D", "2D", "2D", "3D", "3D", "3D", "3D", "4D", "4D", "4D", "4D",
    #     "2C", "2C", "2C", "2C", "3C", "3C", "3C", "3C", "4C", "4C", "4C", "4C",
    #     "2H", "2H", "2H", "2H", "3H", "3H", "3H", "3H", "4H", "4H", "4H", "4H",
    #     "2S", "2S", "2S", "2S", "3S", "3S", "3S", "3S", "4S", "4S", "4S", "4S",
    #     "5D", "5D", "5D", "6D", "6D", "6D", "7D", "7D", "7D",
    #     "5C", "5C", "5C", "6C", "6C", "6C", "7C", "7C", "7C",
    #     "5H", "5H", "5H", "6H", "6H", "6H", "7H", "7H", "7H",
    #     "5S", "5S", "5S", "6S", "6S", "6S", "7S", "7S", "7S",
    #     "8D", "8D", "9D", "9D", "10D", "10D",
    #     "8C", "8C", "9C", "9C", "10C", "10C",
    #     "8H", "8H", "9H", "9H", "10H", "10H",
    #     "8S", "8S", "9S", "9S", "10S", "10S",
    #     "JD", "JD", "JD", "JC", "JC", "JH", "JS", "JS", "JS", "JS",
    #     "QC", "QD", "QD"
    #   ]
    #   Enum.shuffle((deck))
    # end

    # def drawCards(state, count) do
    #   cond do
    #     Enum.count(state.deck) < count ->
    #       deck = Enum.shuffle(state.deck ++ state.discards)
    #       discards = []
    #       { cards, deck } = Enum.split(deck, count)
    #       { cards, deck, discards }
    #     true ->
    #       { cards, deck } = Enum.split(state.deck, count)
    #       { cards, deck, state.discards }
    #   end
    # end
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

  def getGame(gid) do
    GenServer.call(__MODULE__, %{action: :get_game, gid: gid})
  end

  def start(gid, name, sides) do
    GenServer.cast(__MODULE__, %{action: :start_game, gid: gid, name: name, sides: sides})
  end

  def join(assigns_gid, gid) do
    GenServer.cast(__MODULE__, %{action: :join, assigns_gid: assigns_gid, gid: gid})
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
    new_game = %Game{
      player: %Player{ name: name },
      board: %{ sides: sides, roll: 0 },
    }
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:started", %{name: name, sides: sides})
    {:noreply, state}
  end

  def handle_cast(%{:action => :join, :assigns_gid => assigns_gid, :gid => gid}, state) do
    game = state.games[gid]
    if is_nil(game) do
      Endpoint.broadcast!("game:#{assigns_gid}", "game:joined",
        %{ error: %{ message: "Game not found" } })
    else
      Endpoint.broadcast!("game:#{assigns_gid}", "game:joined",
        %{ gid: gid, game: game })
    end
    {:noreply, state}
  end

  def handle_cast(%{:action => :end_turn, :gid => gid, :game => game}, state) do
    # Save the game state...
    state = put_in(state.games[gid], game)
    IO.puts "Game saved!"
    # Endpoint.broadcast!("game:#{gid}", "game:update", %{game: game})

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
