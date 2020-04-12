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
    laws:  %{ }
  )

  def save_turn(game, updates) do
    IO.puts "save_turn 1"
    game = save_game(game, updates)
    IO.puts "save_turn 2"
    %Game{ game | players: save_player(game.players, updates) }
  end

  # TODO: implement the real next player rules
  def next_turn(game) do
    { pid, _ } = Enum.random(game.players)
    pid
  end

  def save_player(players, updates) do
    playerUpdate = Map.fetch!(updates, "player")
    boardUpdate = Map.fetch!(updates, "board")
    lawUpdate = Map.fetch!(updates, "laws")
    cardUpdate = Map.fetch!(updates, "cards")
    pid = playerUpdate["pid"]
    player = players[pid]
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
      fd: updates["fd"],
      ep: updates["ep"]
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
