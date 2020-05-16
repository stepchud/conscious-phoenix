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
    IO.puts "Games (#{map_size(state.games)}): [#{Enum.join(Map.keys(state.games), ", ")}]"
    {:reply, %{"gid" => gid, "game" => state.games[gid]}, state}
  end

  def handle_cast(%{action: :start_game, gid: gid, name: name, sides: sides}, state) do
    IO.puts "start_game<#{gid}> (#{name}, #{sides})"
    player = %Player{ name: name, pid: Player.generate_pid() }
    new_game = %Game{ players: %{ player.pid => player }, board: %{ sides: sides, roll: sides } }
               |> Game.add_log_event(%{ pid: player.pid, entry: "#{name} started the game as the dealer with #{sides}-sided dice." })
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
      {msg, game, pid} = join_player(game, pid, name)
      state = put_in(state.games[gid], game)
      IO.inspect Map.keys(state.games[gid].players), label: "game players"
      Endpoint.broadcast!( "game:#{assigns_gid}", msg, %{ gid: gid, pid: pid, game: game })
      {:noreply, state}
    end
  end

  def handle_cast(%{:action => :end_turn, :gid => gid, :pid => pid, :game => updates}, state) do
    game = Game.save_state(state.games[gid], pid, updates)
    state = put_in(state.games[gid], game)
    nextPid = Game.next_pid(game)
    IO.puts "next pid=#{nextPid}"
    players = Game.players_by_turn(game)
    Endpoint.broadcast!("game:#{gid}", "game:next_turn", %{ pid: nextPid, players: players })
    {:noreply, state}
  end

  def handle_cast(%{:action => :save_state, :gid => gid, :pid => pid, :game => updates}, state) do
    game = Game.save_state(state.games[gid], pid, updates)
    state = put_in(state.games[gid], game)
    players = Game.players_by_turn(game)
    Endpoint.broadcast!("game:#{gid}", "game:saved", %{ pid: pid, players: players })
    {:noreply, state}
  end

  def handle_cast(%{:action => :log_event, :gid => gid, :event => event}, state) do
    game = Game.add_log_event(state.games[gid], event)
    state = put_in(state.games[gid], game)
    Endpoint.broadcast!("game:#{gid}", "game:event", %{ event: event })
    {:noreply, state}
  end

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
        IO.puts "new pid joined: #{player.pid}"
        game = put_in(game.players, Map.put(game.players, player.pid, player))
               |> Game.add_log_event(%{ pid: player.pid, entry: "#{player.name} joined the game" })
        {"game:joined", game, player.pid}
      { _, nil } ->
        IO.puts "existing pid joined: #{pid}"
        player = %Player{ name: name, pid: pid }
        game = put_in(game.players, Map.put(game.players, player.pid, player))
               |> Game.add_log_event(%{ pid: player.pid, entry: "#{player.name} joined the game" })
        {"game:joined", game, pid}
      { _, _ } -> # continue game
        IO.puts "existing player continued:#{pid}"
        {"game:continued", game, pid}
    end
  end
end
