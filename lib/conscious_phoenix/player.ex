defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

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

  def other_dupes(players, current, turns) do
    players
    |> filter_active
    |> filter_by_position(current.position)
    |> filter_others(current)
    |> order_by_turns(turns)
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
end
