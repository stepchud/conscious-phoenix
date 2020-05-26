defmodule ConsciousPhoenix.Game do
  alias __MODULE__
  alias ConsciousPhoenix.Player

  # use Ecto.Schema
  # import Ecto.Changeset

  @derive {Jason.Encoder,
    only: [
      :players,
      :board,
      :cards,
      :laws,
      :log,
      :turns
    ]
  }

  defstruct(
    players: %{ },
    board: %{ },
    cards: %{ },
    laws:  %{ },
    log: [ ],
    turns: [ ]
  )

  def save_state(game, pid, updates) do
    game = save_game(game, updates)
    players = save_player(pid, game.players, updates)
    turns = [pid | List.delete(game.turns, pid)]
    %Game{ game | players: players, turns: turns }
  end

  def next_pid(game) do
    game.players
    |> filter_active
    |> filter_min_position
    |> last_by_turns(game.turns)
  end

  def save_player(pid, players, updates) do
    playerUpdate = Map.fetch!(updates, "player")
    lawUpdate = Map.fetch!(updates, "laws")
    cardUpdate = Map.fetch!(updates, "cards")
    fd = Map.fetch!(updates, "fd")
    ep = Map.fetch!(updates, "ep")
    player = players[pid]
    player = %Player{
      player |
      age: playerUpdate["age"],
      position: playerUpdate["position"],
      direction: playerUpdate["direction"],
      current_turn: playerUpdate["current_turn"],
      completed_trips: playerUpdate["completed_trips"],
      death_space: playerUpdate["death_space"],
      laws_passed: playerUpdate["laws_passed"],
      hand: cardUpdate["hand"],
      laws: %{ active: lawUpdate["active"], hand: lawUpdate["hand"] },
      fd: fd,
      ep: ep,
    }
    put_in(players[pid], player)
  end

  def save_game(game, updates) do
    cardUpdate = Map.fetch!(updates, "cards")
    lawUpdate = Map.fetch!(updates, "laws")
    %Game{ game |
      cards: %{ deck: cardUpdate["deck"], discards: cardUpdate["discards"] },
      laws: %{ deck: lawUpdate["deck"], discards: lawUpdate["discards"] }
    }
  end

  def add_log_event(game, event) do
    %Game{ game | log: [ event | game.log ] }
  end

  def update_player_status(game, pid, status) do
    put_in(game.players[pid].status, status)
  end

  def players_by_turn(game) do
    Enum.map(game.turns, fn pid ->
      player = game.players[pid]
      %{ pid: pid, name: player.name, position: player.position }
    end)
  end

  defp filter_active(players) do
    Enum.filter(players, fn {_, player} -> player.status == Player.statuses().present end)
    |> Enum.into(%{})
  end

  defp min_position(players) do
    players
    |> Map.values
    |> Enum.map(fn p -> p.position end)
    |> Enum.sort
    |> hd
  end

  defp filter_min_position(players) do
    position = min_position(players)
    Enum.filter(players, fn {_, player} -> player.position === position end)
    |> Enum.into(%{})
  end

  defp last_by_turns(players, turns) do
    players
    |> Map.keys
    |> Enum.sort_by(
      fn pid -> Enum.find_index(turns,
        fn turnPid ->
          pid == turnPid
        end)
      end)
    |> hd
  end
end

#   schema "games" do
#     field :board, :string
#     field :cards, :string
#     field :ep, :string
#     field :fd, :string
#     field :gid, :string
#     field :laws, :string
#     field :modal, :string
#
#     timestamps()
#   end
#
#   @doc false
#   def changeset(game, attrs) do
#     game
#     |> cast(attrs, [:gid, :board, :cards, :laws, :fd, :ep, :modal])
#     |> validate_required([:gid, :board, :cards, :laws, :fd, :ep, :modal])
#   end
# end
