defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  @statuses %{ active: :active, away: :away, dead: :dead, complete: :complete, quit: :quit }

  def statuses, do: @statuses

  @derive {Jason.Encoder,
    only: [
      :pid, :name, :age,
      :position, :current_turn, :completed_trip,
      :death_space, :laws_passed,
      :hand, :laws, :fd, :ep, :status
    ]
  }

  defstruct([
    :pid,
    :name,
    :age,
    :position,
    :current_turn,
    :completed_trip,
    :death_space,
    :laws_passed,
    :fd,
    :ep,
    status: @statuses.active,
    hand: [ ],
    laws: %{ active: [ ], hand: [ ] },
  ])

  def generate_pid() do
    String.slice(UUID.uuid4(), 0, 6)
  end
end
