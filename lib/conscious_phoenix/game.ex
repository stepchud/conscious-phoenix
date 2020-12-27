defmodule ConsciousPhoenix.Game do
  alias __MODULE__
  alias ConsciousPhoenix.Player
  alias ConsciousPhoenix.Deck

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
    cards: %Deck{},
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

  # add `shared` laws to other players, track which players have obeyed
  def end_turn(game, pid, updates) do
    lawUpdate = Map.fetch!(updates, "laws")
    save_state(game, pid, updates)
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

  # find the first player on the same spot as pid that:
  #  1. is lower level of being
  #  2. can receive help from cards in pid's hand
  # if there is only one card, automatically exchange and draw three
  # if there are multiple helpful_cards, display them to the higher player for choice
  def fifth_striving(game, pid) do
    current = game.players[pid]
    { eligible_player, helpful_cards } = Player.fifth_striving_eligible(game.players, current, game.turns)
    cards_count = Enum.count(helpful_cards)
    cond do
      eligible_player == :none ->
        { :none, log_event(game, %{ pid: pid, entry: "No players eligible for fifth striving" }) }
      cards_count == 1 ->
        card = hd(helpful_cards)
        entry = "#{current.name} fulfills the fifth striving for #{eligible_player.name}"
        game = exchange_one_fifth(game, eligible_player, current, card)
               |> log_event(%{ pid: pid, entry: entry })
        { :one, game }
      cards_count > 1 ->
        { :multi, { helpful_cards, eligible_player, current } }
    end
  end

  # adds the helpful card to lower player
  # takes the helpful card from higher who also draws three cards
  def exchange_one_fifth(game, lower, higher, card) do
    IO.inspect(card)
    lower_card = Map.put(card, "select", false)
    higher_card = Enum.find(higher.hand, &(&1["c"] == card["c"]))
    game = put_in(game.players[lower.pid].hand, [lower_card | lower.hand])
    game = put_in(game.players[higher.pid].hand, higher.hand -- [higher_card])
    game
    |> draw_card(higher.pid)
    |> draw_card(higher.pid)
    |> draw_card(higher.pid)
  end

  defp draw_card(game, pid) do
    hand = game.players[pid].hand
    {draw, cards} = Deck.draw_card(game.cards)
    # update player's hand
    game = put_in(game.players[pid].hand, [draw | hand])
    # update deck & discards
    put_in(game.cards, cards)
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
