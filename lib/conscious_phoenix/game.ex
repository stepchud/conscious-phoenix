defmodule ConsciousPhoenix.Game do
  alias __MODULE__
  alias ConsciousPhoenix.Player

  # use Ecto.Schema
  # import Ecto.Changeset

  @derive {Jason.Encoder,
    only: [:players, :board, :cards, :laws]}

  defstruct(
    players: %{ },
    board: %{ },
    cards: %{ },
    laws:  %{ },
    turns: [ ],
  )

  def save_state(game, pid, updates) do
    game = save_game(game, updates)
    players = save_player(pid, game.players, updates)
    turns = [pid | List.delete(game.turns)]
    %Game{ game | players: players, turns: turns }
  end

  # TODO: edge case when everyone is on first space
  def next_turn(game) do
    game.players
    |> filter_active
    |> filter_min_position
    |> last_by_turns(game.turns)
  end

  def save_player(pid, players, updates) do
    playerUpdate = Map.fetch!(updates, "player")
    boardUpdate = Map.fetch!(updates, "board")
    lawUpdate = Map.fetch!(updates, "laws")
    cardUpdate = Map.fetch!(updates, "cards")
    fd = Map.fetch!(updates, "fd")
    ep = Map.fetch!(updates, "ep")
    player = players[pid]
    IO.puts "save player:#{player.pid}, players:#{Map.keys(players)}"
    player = %Player{
      player |
      age: playerUpdate["age"],
      position: boardUpdate["position"],
      current_turn: boardUpdate["current_turn"],
      completed_trip: boardUpdate["completed_trip"],
      death_space: boardUpdate["death_space"],
      laws_passed: boardUpdate["laws_passed"],
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

  defp filter_active(players) do
    Enum.filter(players, fn {_, player} -> player.status == Player.Statuses.active end)
  end

  defp min_position(players) do
    players
    |> Map.values
    |> Enum.sort
    |> hd
  end

  defp filter_min_position(players) do
    position = min_position(players)
    Enum.filter(players, fn {_, player} -> player.position === position end)
  end

  defp last_by_turns(players, turns) do
    turns
    |> Enum.map(fn pid -> players[pid] end)
    |> Enum.reject(&is_nil(&1))
    |> hd
    |> elem(0)
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
