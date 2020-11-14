ExUnit.start()
Ecto.Adapters.SQL.Sandbox.mode(ConsciousPhoenix.Repo, :manual)

defmodule ConsciousPhoenix.TestHelper do
  def debugger(module, line) do
    :debugger.start()
    :int.ni(module)
    :int.break(module, line)
  end
end

