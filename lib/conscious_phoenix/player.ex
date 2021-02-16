defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  @levels_of_being ["MULTIPLICITY": 0, "DEPUTY-STEWARD": 1, "STEWARD": 2, "MASTER": 3]

  @statuses %{ present: :present, away: :away, done: :done, quit: :quit }

  def statuses, do: @statuses

  @derive {Jason.Encoder,
    only: [
      :pid,
      :name,
      :current_turn,
      :death_space,
      :laws_passed,
      :fd,
      :ep,
      :age,
      :position,
      :direction,
      :completed_trips,
      :alive,
      :hand,
      :laws,
      :shared_laws,
      :status
    ]
  }

  defstruct([
    :pid,
    :name,
    :death_space,
    :laws_passed,
    :fd,
    :ep,
    age: 0,
    position: 0,
    direction: 1,
    current_turn: "initial",
    completed_trips: 0,
    alive: true,
    hand: [ ],
    laws: %{ active: [ ], hand: [ ] },
    shared_laws:  [ ],
    status: @statuses.present,
  ])

  # unique player ids
  def generate_pid() do
    String.slice(UUID.uuid4(), 0, 6)
  end

  # select out the duplicates from a players hand
  # by deleting all uniq cards once from hand
  def dupes(player) do
    uniq_cards = Enum.uniq_by(player.hand, fn card -> card["c"] end)
    player.hand -- uniq_cards
  end

  # if both players have dupes,
  # find a random one to exchange from both players,
  # exchanged dupe will be last card in hands
  def swap_dupes(p1, p2) do
    p1_dupes = dupes(p1)
    p2_dupes = dupes(p2)
    case { p1_dupes, p2_dupes } do
      { [], _ } ->
        { :noop, p1, p2 }
      { _, [] } ->
        { :noop, p1, p2 }
      { _, _ } ->
        rand1 = Enum.take_random(p1_dupes, 1)
        rand2 = Enum.take_random(p2_dupes, 1)
        p1 = put_in(p1.hand, (p1.hand -- rand1) ++ rand2)
        p2 = put_in(p2.hand, (p2.hand -- rand2) ++ rand1)
        { :swap, p1, p2 }
    end
  end

  def next_pid(players, turns) do
    players
    |> filter_active
    |> filter_min_position
    |> order_by_turns(turns)
    |> hd
  end

  def other_players_by_turn(players, current, turns) do
    players
    |> filter_active
    |> filter_by_position(current.position, current.completed_trips)
    |> filter_others(current)
    |> order_by_turns(turns)
  end

  # find the first player in same position who can offer/recv help
  def fifth_striving_eligible(players, current, turns) do
    other_players = other_players_by_turn(players, current, turns)
    Enum.reduce(other_players, { :none, [] }, fn { _other_pid, other }, { eligible_player, cards_help } ->
      if eligible_player === :none do
        exchange_fifth(current, other)
      else # already found a match, pass it along (no-op)
        { eligible_player, cards_help }
      end
    end)
  end

  defp compare_levels(p1, p2) do
    p1_lob = Keyword.get(@levels_of_being, String.to_atom(p1.ep["level_of_being"]))
    p2_lob = Keyword.get(@levels_of_being, String.to_atom(p2.ep["level_of_being"]))
    p1_potential = Keyword.get(@levels_of_being, String.to_atom(potential_level_of_being(p1)))
    p2_potential = Keyword.get(@levels_of_being, String.to_atom(potential_level_of_being(p2)))

    cond do
      p1_lob === p2_lob -> :same_level
      p1_lob > p2_lob && p1_lob > p2_potential -> :higher_level
      p2_lob > p1_lob && p2_lob > p1_potential -> :lower_level
      true -> :same_level
    end
  end

  defp exchange_fifth(player, other) do
    with :higher_level <- compare_levels(player, other),
         cards <- cards_to_level_up(other, player),
         true <- Enum.count(cards) > 0 do
      { other, cards }
    else
      :same_level -> { :none, [] }
      :lower_level -> { :none, [] }
      :no_options -> { :none, [] }
      false       -> { :none, [] }
    end
  end

  defp filter_active(players) do
    Enum.filter(players, fn {_, p} -> p.status == statuses().present end)
  end

  defp filter_min_position(players) do
    trips = players
    |> Enum.map(fn {_, p} -> p.completed_trips end)
    |> Enum.sort
    |> hd
    sort_dir = if(rem(trips, 2) == 0, do: &<=/2, else: &>=/2)
    position = players
    |> Enum.filter(fn {_, p} -> p.completed_trips == trips end)
    |> Enum.map(fn {_, p} -> p.position end)
    |> Enum.sort(sort_dir)
    |> hd
    filter_by_position(players, position, trips)
  end

  defp filter_others(players, current) do
    players
    |> Enum.filter(fn {other_pid, _} -> other_pid !== current.pid end)
  end

  defp filter_by_position(players, position, trips) do
    players
    |> Enum.filter(fn {_, player} ->
      player.position === position && player.completed_trips == trips
    end)
  end

  defp order_by_turns(players, turns) do
    players
    |> Enum.sort_by(
      fn {pid, _} ->
        Enum.find_index(turns, fn turnPid -> pid == turnPid end)
      end
    )
  end

  # filter cards from higher that would help lower level up more than they can already
  defp cards_to_level_up(lower, higher) do
    orig_potential = potential_level_of_being(lower)
    Enum.filter(higher.hand, fn card ->
      lower_with_card = %{lower | hand: [ card | lower.hand ]}
      new_potential = potential_level_of_being(lower_with_card)
      cond do
        orig_potential === new_potential -> false
        orig_potential === "MULTIPLICITY" ->
          # lower player needs school, only offer help based on higher's school
          case higher.ep["school_type"] do
            "Fakir" ->
              String.ends_with?(card["c"], "D")
            "Yogi" -> {}
              String.ends_with?(card["c"], "C")
            "Monk" -> {}
              String.ends_with?(card["c"], "H")
            "Sly"  -> {}
              String.ends_with?(card["c"], "S")
            "Balanced" ->
              String.starts_with?(card["c"], ["5","6","7","8","9","10","Q"])
          end
        true -> true
      end
    end)
  end

  # 1) convert cards in the hand into chips
  # 2) add these card pieces to the ones on the board
  # 3) combine lower to higher pieces
  # 4) bump pieces up
  defp potential_pieces(hand, current_pieces) do
    new_pieces_in_hand = card_pieces(hand)
    pieces_with_index = Enum.with_index(new_pieces_in_hand)
    # require IEx; IEx.pry
    pieces_with_index
    |> Enum.map(
      fn(piece_tuples) ->
        { new_pieces, index } = piece_tuples
        Enum.at(current_pieces, index) + new_pieces
      end)
    |> make_aces
    |> make_xjos
    |> bump_pieces
  end

  # level of being given the potential chips already in hand
  defp potential_level_of_being(player) do
    level_of_being(potential_pieces(card_hand(player), player.ep["pieces"]))
  end

  defp level_of_being(pieces) do
    [jd, qd, kd, jc, qc, kc, jh, qh, kh, js, qs, ks, ad, ac, ah, as, xj, jo] = pieces
    # count XJ 'aces'
    distinctAces = if xj > 1, do: 3, else: 0
    distinctAces = if xj == 1, do: 2, else: distinctAces
    # add 1 for non-spade aces
    distinctAces = if ah > 0, do: distinctAces + 1, else: distinctAces
    distinctAces = if ac > 0, do: distinctAces + 1, else: distinctAces
    distinctAces = if ad > 0, do: distinctAces + 1, else: distinctAces
    cond do
      jo > 0 -> "MASTER"
      as > 0 and distinctAces >= 3 -> "STEWARD"
      as > 0 and ah > 0 and ac > 0 and ad > 0 -> "STEWARD"
      ad > 1 -> "DEPUTY-STEWARD"
      ac > 1 -> "DEPUTY-STEWARD"
      ah > 1 -> "DEPUTY-STEWARD"
      jd > 0 and qd > 0 and kd > 0 -> "DEPUTY-STEWARD"
      jc > 0 and qc > 0 and kc > 0 -> "DEPUTY-STEWARD"
      jh > 0 and qh > 0 and kh > 0 -> "DEPUTY-STEWARD"
      js > 0 and qs > 0 and ks > 0  -> "DEPUTY-STEWARD"
      ad == 1 && (jd > 0 || qd > 0 || kd > 0) -> "DEPUTY-STEWARD"
      ac == 1 && (jc > 0 || qc > 0 || kc > 0) -> "DEPUTY-STEWARD"
      ah == 1 && (jh > 0 || qh > 0 || kh > 0) -> "DEPUTY-STEWARD"
      as == 1 && (js > 0 || qs > 0 || ks > 0) -> "DEPUTY-STEWARD"
      count_queens_or_kings(pieces) > 2 -> "DEPUTY-STEWARD"
      true -> "MULTIPLICITY"
    end
  end

  # maximize the number of aces for each suit
  defp make_aces(pieces) do
    pieces
    |> convert_aces(0)
    |> convert_aces(3)
    |> convert_aces(6)
    |> convert_aces(9)
  end

  defp convert_aces(pieces, suit_index) do
    has_chips = Enum.with_index(pieces)
                |> Enum.filter(fn {cnt, idx} ->
                  idx >= suit_index and idx < suit_index + 3 && cnt > 0
                end)
    if length(has_chips) > 2 do
      [{cnt1, idx1}, {cnt2, idx2}] = has_chips
                                     |> Enum.sort_by(&(elem(&1, 0)), &>=/2)
                                     |> Enum.take(2)
      ace_index = trunc(suit_index / 3 + 12)
      ace_val = Enum.at(pieces, ace_index)
      pieces = pieces
               |> List.replace_at(ace_index, ace_val + 1)
               |> List.replace_at(idx1, cnt1 - 1)
               |> List.replace_at(idx2, cnt2 - 1)
      convert_aces(pieces, suit_index)
    else
      pieces
    end
  end

  # maximize the number of xjos for aces
  defp make_xjos(pieces) do
    has_chips = Enum.with_index(pieces)
                |> Enum.filter(fn {cnt, idx} ->
                  idx >= 12 and idx <= 14 && cnt > 0
                end)
    if length(has_chips) > 2 do
      [{cnt1, idx1}, {cnt2, idx2}] = has_chips
                                     |> Enum.sort_by(&(elem(&1, 0)), &>=/2)
                                     |> Enum.take(2)
      pieces = pieces
               |> List.replace_at(16, Enum.at(pieces, 16) + 1)
               |> List.replace_at(idx1, cnt1 - 1)
               |> List.replace_at(idx2, cnt2 - 1)
      make_xjos(pieces)
    else
      pieces
    end
  end

  defp bump_pieces(pieces) do
    if Enum.any?(Enum.take(pieces, 17), &(&1 > 2)) do
      Enum.with_index(pieces)
      |> Enum.reduce(pieces, fn {_, index}, acc ->
        cond do
          index == 17 or Enum.at(acc, index) < 3 -> acc
          true -> List.replace_at(acc, index, Enum.at(acc, index) - 2)
                  |> List.replace_at(index+1, Enum.at(acc, index+1) + 1)
        end
      end)
      |> bump_pieces # recurse until no more bumping
    else
      pieces
    end
  end

  # convert cards to lob pieces: face cards, trips, and two card plays
  def card_pieces(hand) do
    pieces = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
    { face_cards, num_cards } = Enum.split_with(hand, &(String.match?(&1, ~r/^[JQ]/)))
    # add face cards
    pieces = Enum.reduce(face_cards, pieces, fn face_card, acc ->
      case face_card do
        "JD" -> List.update_at(acc, 0, &(&1 + 1))
        "QD" -> List.update_at(acc, 1, &(&1 + 1))
        "JC" -> List.update_at(acc, 3, &(&1 + 1))
        "QC" -> List.update_at(acc, 4, &(&1 + 1))
        "JH" -> List.update_at(acc, 6, &(&1 + 1))
        "JS" -> List.update_at(acc, 9, &(&1 + 1))
      end
    end)
    # add number cards
    pieces = number_card_pieces(num_cards, pieces)
    pieces
  end

  # add all card plays into pieces list
  # called recursively until there are no more card plays
  defp number_card_pieces(cards, pieces) do
    card_count = length(cards)
    { next_cards, next_pieces } =
      maybe_play_cards_add_chips({cards, pieces}, ["2D", "3D", "4D"])
      |> maybe_play_cards_add_chips(["5D", "6D", "7D"])
      |> maybe_play_cards_add_chips(["8D", "9D", "10D"])
      |> maybe_play_cards_add_chips(["2C", "3C", "4C"])
      |> maybe_play_cards_add_chips(["5C", "6C", "7C"])
      |> maybe_play_cards_add_chips(["8C", "9C", "10C"])
      |> maybe_play_cards_add_chips(["2H", "3H", "4H"])
      |> maybe_play_cards_add_chips(["5H", "6H", "7H"])
      |> maybe_play_cards_add_chips(["8H", "9H", "10H"])
      |> maybe_play_cards_add_chips(["2S", "3S", "4S"])
      |> maybe_play_cards_add_chips(["5S", "6S", "7S"])
      |> maybe_play_cards_add_chips(["8S", "9S", "10S"])

    if card_count === length(next_cards) do
      pieces
    else
      number_card_pieces(next_cards, next_pieces)
    end
  end

  # if the player has the cards in their hand, this function:
  # removes a single card play combination from cards
  # adds the proper number of pieces to the board
  defp maybe_play_cards_add_chips(cards_pieces, cards_to_try) do
    { cards, pieces } = cards_pieces
    card_count = length(cards)
    [ first, second, third ] = cards_to_try
    cards = cond do
      first in cards and second in cards and third in cards ->
        Enum.reduce(cards_to_try, cards, &(List.delete(&2, &1)))
      first in cards and second in cards ->
        cards |> List.delete(first) |> List.delete(second)
      second in cards and third in cards ->
        cards |> List.delete(second) |> List.delete(third)
      first in cards and third in cards ->
        cards |> List.delete(first) |> List.delete(third)
      true -> cards
    end

    pieces_index = case first do
      "2D" -> 0
      "5D" -> 1
      "8D" -> 2
      "2C" -> 3
      "5C" -> 4
      "8C" -> 5
      "2H" -> 6
      "5H" -> 7
      "8H" -> 8
      "2S" -> 9
      "5S" -> 10
      "8S" -> 11
    end
    incr = case card_count - length(cards) do
      0 -> 0
      2 -> 1
      3 -> 2
    end
    pieces = List.update_at(pieces, pieces_index, &(&1 + incr))

    { cards, pieces }
  end

  defp count_queens_or_kings(pieces) do
    Enum.reduce(0..3, 0, fn i, count ->
      has_a = Enum.at(pieces, 12 + i) > 0
      has_q_or_k = Enum.at(pieces, 3*i + 1) > 0 or Enum.at(pieces, 3*i + 2) > 0
      if has_a || has_q_or_k, do: count + 1, else: count
    end)
  end

  defp card_hand(player) do
    Enum.map(player.hand, fn card -> card["c"] end)
  end
end
