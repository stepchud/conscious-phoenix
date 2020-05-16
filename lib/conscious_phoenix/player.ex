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

  def generate_pid() do
    String.slice(UUID.uuid4(), 0, 6)
  end
end
