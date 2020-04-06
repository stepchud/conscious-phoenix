defmodule ConsciousPhoenix.Player do
  # alias __MODULE__

  @derive {Jason.Encoder,
    only: [:uid, :name, :age, :alive, :position]}

  defstruct(
    uid: "",
    name: "anon",
    alive: true,
    age: 0,
    position: 0,
    current_turn: "",
    completed_trip: false,
    death_space: 244,
    laws_passed: 0,
    hand: [ ],
    laws: %{ },
    fd: %{ },
    ep: %{ }
  )
end
