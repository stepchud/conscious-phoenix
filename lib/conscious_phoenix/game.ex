defmodule ConsciousPhoenix.Game do
  alias __MODULE__
  alias ConsciousPhoenix.Player

  # use Ecto.Schema
  # import Ecto.Changeset

  @derive {Jason.Encoder,
    only: [:players, :board, :cards, :laws]}

  defstruct(
    players: [ ],
    board: %{ },
    cards: %{ },
    laws:  %{ }
  )

  def save_turn(game, updates) do
    game = save_game(game, updates)
    %Game{ game | players: save_player(game.players, updates) }
  end

  def save_player(players, updates) do
    player_idx = Enum.find_index(players, fn p -> p.uid == updates.player.uid end)
    player = Enum.at(players, player_idx)
    player = %Player{
      player |
      age: updates.player.age,
      position: updates.board.position,
      current_turn: updates.board.current_turn,
      completed_trip: updates.board.completed_trip,
      death_space: updates.board.death_space,
      laws_passed: updates.board.laws_passed,
      hand: updates.cards.hand,
      laws: %{ active: updates.laws.active, hand: updates.laws.hand },
      fd: updates.fd,
      ep: updates.ep
    }
    List.replace_at(players, player_idx, player)
  end

  def save_game(game, updates) do
    cards = %{ deck: updates.cards.deck, discards: updates.cards.discards }
    laws = %{ deck: updates.laws.deck, discards: updates.laws.discards }
    %Game{ game | cards: cards, laws: laws }
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
