defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  LOB = [ 'MULTIPLICITY', 'DEPUTY-STEWARD', 'STEWARD', 'MASTER' ]

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
    Enum.reduce(other_players, { [], :none }, fn { other_pid, other}, { options, elig_pid } ->
      if elig_pid === :none do
        exchange_fifth(current, other)
      else # already found a match, pass it along (no-op)
        { options, elig_pid }
      end
    end
  end

  defp exchange_fifth(player, other) do
    with { lower, higher } <- compare_levels(current, other),
         options <- cards_to_level_up(lower, higher),
         true <- Enum.count(options) > 0) do
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
    p1_lob = Enum.find_index(LOB, p1.ep["level_of_being"])
    p2_lob = Enum.find_index(LOB, p2.ep["level_of_being"])

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
            String.starts_with?(card["c"], ["5","6","7","8","9","10","Q"]]) &&
            Enum.any?(lower_needs, fn need -> need === card["c"] end)
        end
      else
        Enum.any?(lower_needs, fn need -> need === card["c"] end)
      end
    end
  end

  # first convert cards in the hand into chips, then see what's needed
  # check they don't already have it in their hand
  defp cards_needed(lower) do
    pcs = lower.ep["pieces"]
    case lower.ep["level_of_being"]
      "MULTIPLICITY" -> school_cards_needed(lower)
      "DEPUTY-STEWARD" -> steward_cards_needed(lower)
      "STEWARD" -> master_cards_needed(lower)
    end
  end

  # make sure they don't already have it in their hand
  defp school_cards_needed(lower) do
  end

  # make sure they don't already have it in their hand
  defp steward_cards_needed(lower) do
    pcs = lower.ep["pieces"]
  end

  defp master_cards_needed(lower) do
    pcs = lower.ep["pieces"]
    xj = pcs[16] + trunc((pcs[14] + pcs[13] + pcs[12])/2)
    as = pcs[15] + (
  end
end
