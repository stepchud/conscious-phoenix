defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  @derive {Jason.Encoder,
    only: [
      :pid, :name, :age,
      :position, :current_turn, :completed_trip,
      :death_space, :laws_passed,
      :hand, :laws, :fd, :ep
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
    hand: [ ],
    laws: %{ active: [ ], hand: [ ] }
  ])

  def generate_pid() do
    String.slice(UUID.uuid4(), 0, 6)
  end
end
