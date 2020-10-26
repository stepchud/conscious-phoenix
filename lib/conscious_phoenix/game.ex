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
    game
    |> save_game(updates)
    |> save_player(pid, updates)
    |> save_turn(pid)
  end

  def save_turn(game, pid) do
    turns = [pid | List.delete(game.turns, pid)]
    %Game{ game | turns: turns }
  end

  def save_player(game, pid, updates) do
    playerUpdate = Map.fetch!(updates, "player")
    lawUpdate = Map.fetch!(updates, "laws")
    cardUpdate = Map.fetch!(updates, "cards")
    fd = Map.fetch!(updates, "fd")
    ep = Map.fetch!(updates, "ep")
    player = game.players[pid]
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
    put_in(game.players[pid], player)
  end

  def save_game(game, updates) do
    cardUpdate = Map.fetch!(updates, "cards")
    lawUpdate = Map.fetch!(updates, "laws")
    board = Map.merge(game.board, %{ "roll" => updates["board"]["roll"] })
    %Game{ game |
      cards: %{ deck: cardUpdate["deck"], discards: cardUpdate["discards"] },
      laws: %{ deck: lawUpdate["deck"], discards: lawUpdate["discards"] },
      board: board
    }
  end

  def log_event(game, event) do
    %Game{ game | log: [ event | game.log ] }
  end

  def update_player_status(game, pid, status) do
    put_in(game.players[pid].status, status)
  end

  # player(pid) automatically exchanges dupes with all players at the same position
  def exchange_dupes(game, pid) do
    offerer = game.players[pid]
    # active players with dupes at same position, ordered by turn
    other_players = Player.other_players_by_turn(game.players, offerer, game.turns)

    { status, game } = Enum.reduce(other_players, { :noop, game }, fn { _, offeree }, { status, acc_game } ->
      case Player.swap_dupes(offerer, offeree) do
        { :noop, _, _ } ->
          { status, acc_game }
        { :swap, p1, p2 } ->
          acc_game = put_in(acc_game.players[p1.pid], p1)
          acc_game = put_in(acc_game.players[p2.pid], p2)
          { :swap, acc_game }
      end
    end)
    entry = if (status == :noop), do: "No dupes to exchange", else: "Dupes exchanged"
    log_event(game, %{ pid: pid, entry: entry })
  end

  # find the first player on the same spot that can exchange 5th striving card (either give or take)
  # if there is only one card, automatically exchange and draw three
  # if there are options, display them to the higher player for choice
  def fifth_striving(game, pid) do
    initiator = game.players[pid]
    { options, eligible_player_id } = Player.fifth_striving_eligible(game.players, initiator, game.turns)
    options_count = Enum.count(options)
    cond do
      options_count == 0 -> { :none, log_event(game, %{ pid: pid, entry: "No options for fifth striving" }) }
      options_count == 1 -> { :one, exchange_one_fifth(game, pid, eligible_player_id) }
      options_count  > 1 -> { :multi, show_fifth_options(game, pid, eligible_player_id) }
    end
  end

  # lower player gets the helping card and draw three cards for higher
  defp exchange_one_fifth(game, opid, epid) do
  end

  # return { options, player_id } where options array of cards, player_id for higher-player w choice
  defp show_fifth_options(game, opid, epid) do
  end

  # draw one card, shuffling first if needed
  defp draw_card(game, pid) do
    cards = game.cards
    hand = game.players[pid].hand
    { deck, discards } = if Enum.empty?(cards.deck) do
      { Enum.shuffle(cards.discards), [] }
    else
      { cards.deck, cards.discards }
    end
    drawn = hd(deck)
    deck = tl(deck)
    # update player's hand
    game = put_in(game.players[pid].hand, [drawn | hand])
    # update deck & discards
    put_in(game.cards, Map.merge(game.cards, %{ deck: deck, discards: discards }))
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
