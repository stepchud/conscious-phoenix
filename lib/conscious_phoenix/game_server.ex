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

  def start_after_wait(gid) do
    GenServer.cast(__MODULE__, %{action: :start_after_wait, gid: gid})
  end

  def wait_game(gid, name, sides) do
    GenServer.cast(__MODULE__, %{action: :wait_game, gid: gid, name: name, sides: sides})
  end

  def join_game(current_gid, gid, pid, name) do
    GenServer.cast(__MODULE__, %{action: :join_game, current_gid: current_gid, gid: gid, pid: pid, name: name})
  end

  def continue_game(current_gid, gid, pid) do
    GenServer.cast(__MODULE__, %{action: :continue_game, current_gid: current_gid, gid: gid, pid: pid})
  end

  def end_turn(gid, pid, game) do
    GenServer.cast(__MODULE__, %{action: :end_turn, gid: gid, pid: pid, game: game})
  end

  def save_state(gid, pid, game) do
    GenServer.cast(__MODULE__, %{action: :save_state, gid: gid, pid: pid, game: game})
  end

  def log_event(gid, pid, event) do
    GenServer.cast(__MODULE__, %{action: :log_event, gid: gid, pid: pid, event: event})
  end

  def game_over(gid, pid) do
    GenServer.cast(__MODULE__, %{action: :game_over, gid: gid, pid: pid})
  end

  def exchange_dupes(gid, pid) do
    GenServer.cast(__MODULE__, %{action: :exchange_dupes, gid: gid, pid: pid})
  end

  def fifth_striving(gid, pid, game) do
    GenServer.cast(__MODULE__, %{action: :fifth_striving, gid: gid, pid: pid, game: game})
  end

  def choose_fifth(gid, pid, lower, card) do
    GenServer.cast(__MODULE__, %{action: :choose_fifth, gid: gid, pid: pid, lower: lower, card: card})
  end

  def choose_astral(gid, pid, replace) do
    GenServer.cast(__MODULE__, %{action: :choose_astral, gid: gid, pid: pid, replace: replace})
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

  def handle_cast(%{
    action: :start_game,
    gid: gid, name: name, sides: sides
  }, state) do
    IO.puts "start_game<#{gid}> (#{name}, #{sides})"
    player = %Player{ name: name, pid: Player.generate_pid() }
    new_game = %Game{ players: %{ player.pid => player }, board: %{ sides: sides, roll: sides } }
               |> Game.log_event(%{ pid: player.pid, entry: "#{name} started the game as the dealer with #{sides}-sided dice." })
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:started", %{name: name, pid: player.pid, sides: sides})
    {:noreply, state}
  end

  def handle_cast(%{ action: :start_after_wait, gid: gid }, state) do
    IO.puts "start_after_wait<#{gid}>"
    game = state.games[gid]
    game = put_in(game.board.status, "active")
    state = put_in(state.games[gid], game)
    first = if (Enum.count(game.turns) > 1) do
      Enum.at(game.turns, -2)
    else
      hd(game.turns)
    end
    Endpoint.broadcast!("game:#{gid}", "game:started_after_wait", %{first: first})
    {:noreply, state}
  end

  def handle_cast(%{
    action: :wait_game,
    gid: gid, name: name, sides: sides
  }, state) do
    IO.puts "wait_game<#{gid}> (#{name}, #{sides})"
    player = %Player{ name: name, pid: Player.generate_pid() }
    new_game = %Game{ players: %{ player.pid => player }, board: %{ sides: sides, roll: sides, status: "wait" } }
               |> Game.log_event(%{ pid: player.pid, entry: "#{name} started the game as the dealer with #{sides}-sided dice." })
               |> Game.log_event(%{ pid: player.pid, entry: "Waiting for players to join." })
    state = put_in(state.games[gid], new_game)
    Endpoint.broadcast!("game:#{gid}", "game:waited", %{name: name, pid: player.pid, sides: sides})
    {:noreply, state}
  end

  def handle_cast(%{
    :action => :continue_game,
    :current_gid => current_gid, :gid => gid, :pid => pid
  }, state) do
    game = state.games[gid]
    if (is_nil(game)) do
      Endpoint.broadcast!("game:#{current_gid}",
        "modal:error", %{ error: %{ message: "Game not found!" } })
      {:noreply, state}
    else
      case { pid, game.players[pid] } do
        { nil, _ } ->
          Endpoint.broadcast!(
            "game:#{current_gid}",
            "modal:error",
            %{ error: %{ message: "Player id missing!" } }
          )
          {:noreply, state}
        { _, nil } ->
          Endpoint.broadcast!(
            "game:#{current_gid}",
            "modal:error",
            %{ error: %{ message: "Player not found!" } }
          )
          {:noreply, state}
        { _, _ } ->
          Endpoint.broadcast!(
            "game:#{current_gid}",
            "game:continued",
            %{ gid: gid, pid: pid, game: game }
          )
          {:noreply, state}
      end
    end
  end

  def handle_cast(%{
    :action => :join_game,
    :current_gid => current_gid, :gid => gid, :pid => pid, name: name
  }, state) do
    game = state.games[gid]
    if (is_nil(game)) do
      IO.puts "game not found! #{gid}"
      Endpoint.broadcast!("game:#{current_gid}", "modal:error", %{ error: %{ message: "Game not found!" } })
      {:noreply, state}
    else
      game = join_player(current_gid, gid, game, pid, name)
      state = put_in(state.games[gid], game)
      IO.inspect Map.keys(state.games[gid].players), label: "player joined"
      {:noreply, state}
    end
  end

  def handle_cast(%{:action => :end_turn, :gid => gid, :pid => pid, :game => updates}, state) do
    game = Game.end_turn(state.games[gid], pid, updates)
    state = put_in(state.games[gid], game)
    handle_offer_astral(gid, game)
    {:noreply, state}
  end

  def handle_cast(%{:action => :save_state, :gid => gid, :pid => pid, :game => updates}, state) do
    game = Game.save_state(state.games[gid], pid, updates)
    update_game(state, gid, pid, game)
  end

  def handle_cast(%{:action => :log_event, :gid => gid, :pid => pid, :event => event}, state) do
    game = Game.log_event(state.games[gid], %{ pid: pid, entry: event })
    state = put_in(state.games[gid], game)
    Endpoint.broadcast!("game:#{gid}", "game:event", %{ event: event })
    {:noreply, state}
  end

  def handle_cast(%{:action => :game_over, :gid => gid, :pid => pid}, state) do
    game = state.games[gid]
    entry = "#{game.players[pid].name}'s game is over."
    game = game
      |> Game.update_player_status(pid, Player.statuses.done)
      |> Game.log_event(%{ pid: pid, entry: entry })
    state = put_in(state.games[gid], game)
    { nextPid, _ } = Player.next_pid(game.players, game.turns)
    Endpoint.broadcast!("game:#{gid}", "game:next_turn", %{ pid: nextPid, game: game })
    {:noreply, state}
  end

  def handle_cast(%{:action => :exchange_dupes, :gid => gid, :pid => pid}, state) do
    game = Game.exchange_dupes(state.games[gid], pid)
    update_game(state, gid, pid, game)
  end

  def handle_cast(%{:action => :fifth_striving, :gid => gid, :pid => pid, :game => updates}, state) do
    game = Game.save_state(state.games[gid], pid, updates)
    case Game.fifth_striving(game, pid) do
      { :none, game } ->
        IO.puts("none fifth_striving")
        update_game(state, gid, pid, game)
      { :one, game } ->
        IO.puts("one fifth_striving")
        update_game(state, gid, pid, game)
      { :multi, { cards, lower, higher } } ->
        IO.puts("multi fifth_striving")
        Endpoint.broadcast!("game:#{gid}", "game:fifth_options", %{ pid: higher.pid, lower_pid: lower.pid, options: cards })
        state = put_in(state.games[gid], game)
        {:noreply, state}
    end
  end

  def handle_cast(%{:action => :choose_fifth, :gid => gid, :pid => pid, :lower => lower, :card => card}, state) do
    game = state.games[gid]
    higher = game.players[pid]
    lower = game.players[lower]
    IO.puts("one fifth_striving")
    update_game(state, gid, pid, Game.exchange_one_fifth(game, lower, higher, card))
  end

  def handle_cast(%{:action => :choose_astral, :gid => gid, :pid => pid, :replace => replace}, state) do
    game = state.games[gid]
    player = game.players[pid]
    game = if(replace, do: Game.replace_astral(game, player), else: Game.reject_astral(game, player))
    state = put_in(state.games[gid], game)
    handle_offer_astral(gid, game)
    {:noreply, state}
  end

  # def handle_cast(%{:action => :reset, :gid => gid}, state) do
  #   state = put_in(state.games[gid], %{})
  #   game = state.games[gid]
  #   Endpoint.broadcast!("game:#{gid}", "game:update", %{game: game})
  #   {:noreply, state}
  # end

  defp update_game(state, gid, pid, game) do
    state = put_in(state.games[gid], game)
    Endpoint.broadcast!("game:#{gid}", "game:update", %{ pid: pid, game: game })
    {:noreply, state}
  end

  defp join_player(current_gid, new_gid, game, pid, name) do
    case { pid, game.players[pid] } do
      { nil, _ } ->
        player = %Player{ name: name, pid: Player.generate_pid() }
        IO.puts "new pid joined: #{player.pid}"
        game = put_in(game.players, Map.put(game.players, player.pid, player))
               |> Game.save_turn(player.pid)
               |> Game.log_event(%{ pid: player.pid, entry: "#{player.name} joined the game" })
        Endpoint.broadcast!( "game:#{new_gid}", "player:joined", %{ gid: new_gid, pid: player.pid, game: game })
        Endpoint.broadcast!( "game:#{current_gid}", "game:joined", %{ gid: new_gid, pid: player.pid, game: game })
        game
      { _, nil } ->
        IO.puts "existing pid joined: #{pid}"
        player = %Player{ name: name, pid: pid }
        game = put_in(game.players, Map.put(game.players, player.pid, player))
               |> Game.save_turn(pid)
               |> Game.log_event(%{ pid: player.pid, entry: "#{player.name} joined the game" })
        Endpoint.broadcast!( "game:#{new_gid}", "player:joined", %{ gid: new_gid, pid: pid, game: game })
        Endpoint.broadcast!( "game:#{current_gid}", "game:joined", %{ gid: new_gid, pid: pid, game: game })
        game
      { _, _ } -> # continue game
        IO.puts "existing player continued:#{pid}"
        Endpoint.broadcast!( "game:#{current_gid}", "game:continued", %{ gid: new_gid, pid: pid, game: game })
        game
    end
  end

  defp handle_offer_astral(gid, game) do
    offered = Game.offered_players(game)
    if length(offered) > 0 do
      { opid, oplyr } = hd(offered)
      Endpoint.broadcast!("game:#{gid}", "game:offer_astral", %{ pid: opid, astral: oplyr.fd["offerAstral"], game: game })
    else
      { nextPid, _ } = Player.next_pid(game.players, game.turns)
      Endpoint.broadcast!("game:#{gid}", "game:next_turn", %{ pid: nextPid, game: game })
    end
  end
end
