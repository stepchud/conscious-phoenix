defmodule ConsciousPhoenix.PlayerTest do
  use ExUnit.Case

  test 'missing one diamond card' do
    lower = missing_one_for_school()
    higher = one_to_offer()
    { eligible_player, cards } = ConsciousPhoenix.Player.fifth_striving_eligible(
      %{ lower.pid => lower, higher.pid => higher },
      higher,
      [lower.pid, higher.pid]
    )
    assert eligible_player !== :none
    assert Enum.count(cards) == 1
  end

  defp missing_one_for_school do
    %ConsciousPhoenix.Player{
      pid: ConsciousPhoenix.Player.generate_pid(),
      ep: %{
        "level_of_being" => "MULTIPLICITY",
        "pieces" => [0,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      hand: [%{"c" => "2D"}]
    }
  end

  defp one_to_offer do
    %ConsciousPhoenix.Player{
      pid: ConsciousPhoenix.Player.generate_pid(),
      ep: %{
        "level_of_being" => "DEPUTY-STEWARD",
        "school_type" => "Fakir",
        "pieces" => [1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      hand: [%{"c" => "3D"}, %{"c" => "6S"}]
    }
  end
end
