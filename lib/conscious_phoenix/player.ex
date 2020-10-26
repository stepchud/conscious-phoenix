defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  @levels_of_being ["MULTIPLICITY": 0, "DEPUTY-STEWARD": 1, "STEWARD": 2, "MASTER": 3]

  @statuses %{ present: :present, away: :away, done: :done, quit: :quit }
  @suits = ["D","C","H","S"]

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
      :status
    ]
  }

  defstruct([
    :pid,
    :name,
    :current_turn,
    :death_space,
    :laws_passed,
    :fd,
    :ep,
    age: 0,
    position: 0,
    direction: 1,
    completed_trips: 0,
    alive: true,
    hand: [ ],
    laws: %{ active: [ ], hand: [ ] },
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
    |> filter_by_position(current.position)
    |> filter_others(current)
    |> order_by_turns(turns)
  end

  # find the first player in same position who can offer/recv help
  def fifth_striving_eligible(players, current, turns) do
    other_players = other_players_by_turn(players, current, turns)
    Enum.reduce(other_players, { [], :none }, fn { _other_pid, other }, { options, elig_pid } ->
      if elig_pid === :none do
        exchange_fifth(current, other)
      else # already found a match, pass it along (no-op)
        { options, elig_pid }
      end
    end)
  end

  defp exchange_fifth(player, other) do
    with { lower, higher } <- compare_levels(player, other),
         options <- cards_to_level_up(lower, higher),
         true <- Enum.count(options) > 0 do
      { options, other.pid }
    else
      :same_level -> { [], :none }
      :no_options -> { [], :none }
      false       -> { [], :none }
    end
  end

  defp filter_active(players) do
    Enum.filter(players, fn {_, p} -> p.status == statuses().present end)
  end

  defp filter_min_position(players) do
    position = min_position(players)
    filter_by_position(players, position)
  end

  defp filter_others(players, current) do
    players
    |> Enum.filter(fn {other_pid, _} -> other_pid !== current.pid end)
  end

  defp filter_by_position(players, position) do
    players
    |> Enum.filter(fn {_, player} -> player.position === position end)
  end

  defp order_by_turns(players, turns) do
    players
    |> Enum.sort_by(
      fn {pid, _} ->
        Enum.find_index(turns, fn turnPid -> pid == turnPid end)
      end
    )
  end

  defp min_position(players) do
    players
    |> Enum.map(fn {_, p} -> p.position end)
    |> Enum.sort
    |> hd
  end

  defp compare_levels(p1, p2) do
    p1_lob = Keyword.get(@levels_of_being, String.to_atom(p1.ep["level_of_being"]))
    p2_lob = Keyword.get(@levels_of_being, String.to_atom(p2.ep["level_of_being"]))

    cond do
      p1_lob === p2_lob -> :same_level
      p1_lob > p2_lob -> { p2, p1 }
      p1_lob < p2_lob -> { p1, p2 }
    end
  end

  defp cards_to_level_up(lower, higher) do
    lower_needs = cards_needed(lower)
    Enum.filter(higher.hand, fn card ->
      if lower.ep["level_of_being"] === "MULTIPLICITY" do
        # lower player needs school, only offer help based on higher's school
        case higher.ep["school_type"] do
          "Fakir" ->
            String.ends_with?(card["c"], "D") &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
          "Yogi" -> {}
            String.ends_with?(card["c"], "C") &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
          "Monk" -> {}
            String.ends_with?(card["c"], "H") &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
          "Sly"  -> {}
            String.ends_with?(card["c"], "S") &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
          "Balanced" ->
            String.starts_with?(card["c"], ["5","6","7","8","9","10","Q"]) &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
        end
      else
        Enum.any?(lower_needs, fn need -> need === card["c"] end)
      end
    end)
  end

  # check if they need one card to earn the next level
  # they don't already have it in their hand
  # RETURN: a list of cards which could earn the next level
  # e.g. ['2D', '5S']
  defp cards_needed(player) do
    case potential_level_of_being(player) do
      "MULTIPLICITY" -> school_cards_needed(player)
      "DEPUTY-STEWARD" -> steward_cards_needed(player)
      "STEWARD" -> master_cards_needed(player)
      "MASTER" -> []
    end
  end

  # 1) convert cards in the hand into chips
  # 2) add these card pieces to the ones on the board
  # 3) combine lower to higher pieces
  # 4) bump pieces up
  defp potential_pieces(hand, pieces) do
    pieces_in_hand = card_pieces(hand)
    |> Enum.with_index
    |> Enum.map(fn(pieces, index) -> pieces + pieces_in_hand[index] end)
    |> make_aces
    |> make_xjos
    |> bump_pieces
  end

  # level of being given the potential chips already in hand
  defp potential_level_of_being(player) do
    pieces = potential_pieces(card_hand(player), player.ep["pieces"])
    [jd, qd, kd, jc, qc, kc, jh, qh, kh, js, qs, ks, ad, ac, ah, as, xj, jo] = pieces
    cond do
      jo > 0 -> "MASTER"
      as > 0 and ah > 0 and ac > 0 and ad > 0 -> "STEWARD"
      jd > 0 and qd > 0 and kd > 0      -> "DEPUTY-STEWARD"
      jc > 0 and qc > 0 and kc > 0      -> "DEPUTY-STEWARD"
      jh > 0 and qh > 0 and kh > 0      -> "DEPUTY-STEWARD"
      js > 0 and qs > 0 and ks > 0      -> "DEPUTY-STEWARD"
      count_queens_or_kings(pieces) > 2 -> "DEPUTY-STEWARD"
      true -> "MULTIPLICITY"
    end
  end

  # player has not found school nor has it in their hand yet
  defp school_cards_needed(player) do
    pieces = potential_pieces(card_hand(player), player.ep["pieces"])
    hand = card_hand(player)
    Enum.reduce(0..3, [], fn i, acc -> acc ++ one_of_suit_for_school(pieces, hand, i) end)
    ++ one_queen_king_for_school(pieces, hand)
  end

  # deputy-steward
  # player needs one card to be able to make all four aces
  defp steward_cards_needed(player) do
    pieces = potential_pieces(card_hand(player), player.ep["pieces"])
    hand = card_hand(player)
    Enum.reduce(0..3, [], fn i, acc -> acc ++ one_of_suit_for_steward(pieces, hand, i) end)
  end

  # player needs one card to be able to bump through XJ
  defp master_cards_needed(player) do
    pieces = potential_pieces(card_hand(player), player.ep["pieces"])
    hand = card_hand(player)
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
      ace_index = suit_index / 3 + 12
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
    { card, pieces } = { cards, pieces }
      |> maybe_play_cards_add_chips(["2D", "3D", "4D"])
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

    if card_count === length(cards) do
      pieces
    else
      number_card_pieces(cards, pieces)
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

  # player needs one diamond card to become Fakir
  defp one_diamond(jd, qd, kd, hand) do
    cond do
      jd == 0 and qd > 0 and kd > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "2D")) -> ["3D", "4D", "JD"]
          Enum.any?(hand, &(&1 == "3D")) -> ["2D", "4D", "JD"]
          Enum.any?(hand, &(&1 == "4D")) -> ["2D", "3D", "JD"]
          true -> ["JD"]
        end
      qd == 0 and jd > 0 and kd > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "5D")) -> ["6D", "7D", "QD"]
          Enum.any?(hand, &(&1 == "6D")) -> ["5D", "7D", "QD"]
          Enum.any?(hand, &(&1 == "7D")) -> ["5D", "6D", "QD"]
          true -> ["QD"]
        end
      kd == 0 and jd > 0 and qd > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "8D")) -> ["9D", "10D", "KD"]
          Enum.any?(hand, &(&1 == "9D")) -> ["8D", "10D", "KD"]
          Enum.any?(hand, &(&1 == "10D")) -> ["8D", "9D", "KD"]
          true -> ["KD"]
        end
      true -> []
    end
  end

  # player needs one club card to become Yogi
  defp one_club(jc, qc, kc, hand) do
    cond do
      jc == 0 and qc > 0 and kc > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "2C")) -> ["3C", "4C", "JC"]
          Enum.any?(hand, &(&1 == "3C")) -> ["2C", "4C", "JC"]
          Enum.any?(hand, &(&1 == "4C")) -> ["2C", "3C", "JC"]
          true -> ["JC"]
        end
      qc == 0 and jc > 0 and kc > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "5C")) -> ["6C", "7C", "QC"]
          Enum.any?(hand, &(&1 == "6C")) -> ["5C", "7C", "QC"]
          Enum.any?(hand, &(&1 == "7C")) -> ["5C", "6C", "QC"]
          true -> ["QC"]
        end
      kc == 0 and jc > 0 and qc > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "8C")) -> ["9C", "10C"]
          Enum.any?(hand, &(&1 == "9C")) -> ["8C", "10C"]
          Enum.any?(hand, &(&1 == "10C")) -> ["8C", "9C"]
          true -> []
        end
      true -> []
    end
  end

  # player needs one heart card to become Monk
  defp one_heart(jh, qh, kh, hand) do
    cond do
      jh == 0 and qh > 0 and kh > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "2H")) -> ["3H", "4H", "JH"]
          Enum.any?(hand, &(&1 == "3H")) -> ["2H", "4H", "JH"]
          Enum.any?(hand, &(&1 == "4H")) -> ["2H", "3H", "JH"]
          true -> ["JH"]
        end
      qh == 0 and jh > 0 and kh > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "5H")) -> ["6H", "7H"]
          Enum.any?(hand, &(&1 == "6H")) -> ["5H", "7H"]
          Enum.any?(hand, &(&1 == "7H")) -> ["5H", "6H"]
          true -> []
        end
      kh == 0 and jh > 0 and qh > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "8H")) -> ["9H", "10H"]
          Enum.any?(hand, &(&1 == "9H")) -> ["8H", "10H"]
          Enum.any?(hand, &(&1 == "10H")) -> ["8H", "9H"]
          true -> []
        end
      true -> []
    end
  end

  # player needs one card from the suit to find their School
  defp one_of_suit_for_school(pieces, hand, i) do
    suit = @suits[i]
    jcnt = pieces[3*i]
    qcnt = pieces[3*i + 1]
    kcnt = pieces[3*i + 2]
    cond do
      jcnt == 0 and qcnt > 0 and kcnt > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "2#{suit}")) -> ["3#{suit}", "4#{suit}", "J#{suit}"]
          Enum.any?(hand, &(&1 == "3#{suit}")) -> ["2#{suit}", "4#{suit}", "J#{suit}"]
          Enum.any?(hand, &(&1 == "4#{suit}")) -> ["2#{suit}", "3#{suit}", "J#{suit}"]
          true -> ["J#{suit}"]
        end
      qcnt == 0 and jcnt > 0 and kcnt > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "5#{suit}")) -> ["6#{suit}", "7#{suit}"]
          Enum.any?(hand, &(&1 == "6#{suit}")) -> ["5#{suit}", "7#{suit}"]
          Enum.any?(hand, &(&1 == "7#{suit}")) -> ["5#{suit}", "6#{suit}"]
          true -> []
        end
      kcnt == 0 and jcnt > 0 and qcnt > 0 ->
        cond do
          Enum.any?(hand, &(&1 == "8#{suit}")) -> ["9#{suit}", "10#{suit}"]
          Enum.any?(hand, &(&1 == "9#{suit}")) -> ["8#{suit}", "10#{suit}"]
          Enum.any?(hand, &(&1 == "10#{suit}")) -> ["8#{suit}", "9#{suit}"]
          true -> []
        end
      true -> []
    end
  end

  # player needs one queen or king card to become a Balanced man
  defp one_queen_king_for_school(pieces, hand) do
    qk_count = count_queens_or_kings(pieces)
    if qk_count == 2 do
      Enum.reduce(0..3, [], fn i, acc ->
        jcnt = pieces[3*i]
        qcnt = pieces[3*i + 1]
        kcnt = pieces[3*i + 2]
        if (qcnt == 0 and kcnt == 0) do
          acc ++ one_qk_card(jcnt, qcnt, kcnt, hand, @suits[i])
        else
          acc
        end
      end)
    else
      []
    end
  end

  # TODO: check for bumping through other cards
  defp one_of_suit_for_steward(pieces, hand, i) do
    suit = @suits[i]
    suit_ace = pieces[i + 12]
    other_suits_filled = Enum.reduce(
      Enum.to_list(0..3) -- [i],
      true,
      &(&1 && pieces[&2 + 12] > 0 end) # all other suits have at least one 1 piece
    )
    if (suit_ace == 0 and other_suits_filled) do
      conventional_ace = Enum.reduce(2..10, [], fn acc, rank -> maybe_ace_with_card(pieces, acc, "#{rank}#{suit}", hand, i + 12))
      conventional_ace ++ maybe_bumped_to_index(pieces, i + 12)
    else
      []
    end
  end

  defp count_pieces(pieces)
    Enum.reduce(pieces, &(&1 + &2))
  end

  defp count_queens_or_kings(pieces) do
    Enum.reduce(0..3, 0, fn i, count ->
      if (piece[3*i + 1] > 0 or piece[3*i + 2] > 0), do: count + 1, else: count
    end)
  end

  defp card_hand(player) do
    Enum.map(player.hand, fn card -> card["c"] end)
  end

  defp one_qk_card(j, q, k, hand, suit) do
    pieces = card_pieces(hand)
    pieces_count = count_pieces(pieces)
    needs = if (j == 2), do: maybe_bump_jacks(hand, suit), else: []
    needs = Enum.reduce(5..10, needs, fn rank, acc -> maybe_piece_with_card(acc, "#{rank}#{suit}", hand, pieces_count) end)
    needs
  end

  defp maybe_bump_jacks(hand, suit) do
    pieces = card_pieces(hand)
    pieces_count = count_pieces(pieces)
    cards = []
    cards = Enum.reduce(2..4, cards, fn rank, acc -> maybe_piece_with_card(acc, "#{rank}#{suit}", hand, pieces_count)
    cards
  end

  # add cards that would make a new piece on the board
  defp maybe_piece_with_card(cards, card, hand, prev_count) do
    new_count = count_pieces(card_pieces([card | hand]))
    if (new_count > prev_count), do: [card | cards], else: cards
  end

  # add cards that would create an Ace in the ace_index position
  defp maybe_ace_with_card(pieces, cards, card, hand, ace_index) do
    new_pieces = potential_pieces([card | hand], pieces)
    if (new_pieces[ace_index] > 0), do: [card | cards], else: cards
  end

  # add cards that would cause a bump into the index pos
  defp maybe_bumped_to_index(pieces, index) do
    bumpable_indexes = Enum.take_while(Enum.to_list((index-1)..0), &(Enum.at(pieces, &1) == 2))
    # scan the bumpable_indexes to see if we can bump them
  end
end
