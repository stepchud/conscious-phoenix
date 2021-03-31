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
    |> handle_hasnamuss_lands_on(pid)
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
    discardedAstral = fd["current"]["astralDiscarded"]
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
    # IO.inspect(discardedAstral)
    put_in(game.players[pid], player)
    |> handle_discard_astral(player, discardedAstral)
  end

  def save_game(game, updates) do
    cardUpdate = Map.fetch!(updates, "cards")
    lawUpdate = Map.fetch!(updates, "laws")
    board = Map.merge(game.board, %{
      "roll" => updates["board"]["roll"],
      "spaces" => updates["board"]["spaces"]
    })
    %Game{ game |
      cards: %{ deck: cardUpdate["deck"], discards: cardUpdate["discards"] },
      laws: %{ deck: lawUpdate["deck"], discards: lawUpdate["discards"] },
      board: board
    }
  end

  # add `shared` laws to other players
  # clear shared_laws when the player's turn is done to track which players have obeyed already
  def end_turn(game, pid, updates) do
    lawUpdate = Map.fetch!(updates, "laws")
    game = game
           |> handle_shared_laws(pid, lawUpdate)
           |> save_state(pid, updates)
    offered = Game.offered_players(game)
    take_cards = game.players[pid].take_cards
    cond do
      take_cards && length(take_cards) > 0 ->
        IO.puts "take_cards!"
        { :take_cards, game }
      length(offered) > 0 ->
        { :offer_astral, game }
      true ->
        { :next_turn, game }
    end
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

    { game, entries } = Enum.reduce(other_players, { game, [] }, fn { _, offeree }, { acc_game, acc_entries } ->
      case Player.swap_dupes(offerer, offeree) do
        { :noop } ->
          { acc_game, acc_entries }
        { :swap, p1, c1, p2, c2 } ->
          acc_game = put_in(acc_game.players[p1.pid], p1)
          acc_game = put_in(acc_game.players[p2.pid], p2)
          acc_entries = [ "Dupes! Exchanged the #{c1["c"]} for #{c2["c"]} with #{p2.name}" | acc_entries ]
          { acc_game, acc_entries }
      end
    end)
    Enum.reduce(entries, game, fn entry, acc_game ->
      log_event(acc_game, %{ pid: pid, entry: entry, toast: true })
    end)
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
               |> log_event(%{ pid: pid, entry: entry, toast: true })
        { :one, game }
      cards_count > 1 ->
        { :multi, { helpful_cards, eligible_player, current } }
    end
  end

  # adds the helpful card to lower player
  # takes the helpful card from higher who also draws three cards
  def exchange_one_fifth(game, lower, higher, card) do
    lower_card = Map.put(card, "select", false)
    higher_card = Enum.find(higher.hand, &(&1["c"] == card["c"]))
    game = put_in(game.players[lower.pid].hand, [lower_card | lower.hand])
    game = put_in(game.players[higher.pid].hand, higher.hand -- [higher_card])
    game
    |> draw_card(higher.pid)
    |> draw_card(higher.pid)
    |> draw_card(higher.pid)
  end

  # put the astral body in the player's chips
  # remove offerAstral from all players' fd
  def replace_astral(game, player) do
    %{"offerAstral" => %{
        "food" => offer_food,
        "air" => offer_air,
        "impressions" => offer_imp },
      "current" => %{
        "food" => curr_food,
        "air" => curr_air,
        "impressions" => curr_imp } } = player.fd
    new_current = Map.merge(player.fd["current"], %{
      "food" => Enum.concat(offer_food, Enum.slice(curr_food, 8, 8)),
      "air" => Enum.concat(offer_air, Enum.slice(curr_air, 6, 6)),
      "impressions" => Enum.concat(offer_imp, Enum.slice(curr_imp, 4, 4))
    })
    game = put_in(game.players[player.pid].fd["current"], new_current)
    players = game.players
              |> Enum.map(fn {pid, plyr} ->
                { pid, put_in(plyr.fd, Map.delete(plyr.fd, "offerAstral")) }
              end)
              |> Enum.into(%{})
    put_in(game.players, players)
  end

  def try_to_take_card(game, pid, ask) do
    taker = game.players[pid]
    [ giverId | rest ] = taker.take_cards
    rest = if(length(rest)==0, do: nil, else: rest)
    game = put_in(game.players[pid].take_cards, rest)
    giver = game.players[giverId]
    cardIndex = Enum.find_index(giver.hand, fn card -> card["c"] == ask end)
    if is_nil(cardIndex) do
      game
      |> log_event(%{ pid: pid, entry: "#{taker.name} go fish!", toast: true })
    else
      { card, giverHand } = List.pop_at(giver.hand, cardIndex)
      game = put_in(game.players[giverId].hand, giverHand)
      put_in(game.players[pid].hand, [ %{ card | "selected" => false } | taker.hand ])
      |> log_event(%{ pid: pid, entry: "#{taker.name} takes #{ask} from #{giver.name}.", toast: true })
    end
  end

  # remove offerAstral from player,
  def reject_astral(game, player) do
    player = put_in(player.fd, Map.delete(player.fd, "offerAstral"))
    put_in(game.players[player.pid], player)
  end

  def offered_players(game) do
    Enum.filter(game.players, fn { _pid, oplyr } ->
      Map.has_key?(oplyr.fd, "offerAstral")
    end)
  end

  defp draw_card(game, pid) do
    hand = game.players[pid].hand
    {draw, cards} = Deck.draw_card(game.cards)
    # update player's hand
    game = put_in(game.players[pid].hand, [draw | hand])
    # update deck & discards
    put_in(game.cards, cards)
  end

  defp handle_discard_astral(game, player, discard) when is_map(discard) do
    %{ pid: pid, ep: %{ "being_type" => btype } } = player
    players = game.players
    |> Enum.map(fn { opid, other } ->
      %{
        ep: %{ "being_type" => otype },
        fd: %{ "current" => %{ "mental" => omental, "alive" => oalive } }
      } = other
      IO.puts("types #{btype} <> #{otype}")
      cond do
        pid !== opid && btype == otype && !oalive && !omental ->
          IO.puts("offerAstral to #{opid}")
          { opid, put_in(other.fd["offerAstral"], discard) }
        pid == opid ->
          { opid, put_in(other.fd["current"]["astralDiscarded"], true) }
        true ->
          { opid, other }
      end
    end)
    |> Enum.into(%{})
    put_in(game.players, players)
    |> log_event(%{ pid: player.pid, entry: "#{player.name} discarded their Astral body.", toast: true })
  end

  defp handle_discard_astral(game, _player, discard) when is_boolean(discard) do
    game
  end

  defp handle_shared_laws(game, pid, lawUpdate) do
    if Map.has_key?(lawUpdate, "shared") do
      players_shared = game.players
                       |> Enum.map(fn {key, player} ->
                         shared_laws = cond do
                           key===pid || !Player.alive?(player) -> [ ]
                           is_nil(player.shared_laws) -> lawUpdate["shared"]
                           true -> player.shared_laws ++ lawUpdate["shared"]
                         end
                         { key, put_in(player.shared_laws, shared_laws) }
                       end)
                       |> Enum.into(%{ })
      put_in(game.players, players_shared)
    else game
    end
  end

  defp handle_hasnamuss_lands_on(game, pid) do
    p = game.players[pid]
    with true <- Player.hasnamuss?(p),
         others <- Player.other_players_by_turn(game.players, p, game.turns),
         otherPids <- Enum.map(others, fn {pid, _} -> pid end),
         true <- length(otherPids) > 0 do
      put_in(game.players[pid].take_cards, otherPids)
    else
      _ -> game
    end
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
