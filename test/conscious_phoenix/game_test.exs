defmodule ConsciousPhoenix.GameTest do
  use ExUnit.Case

  test '#fifth_striving' do
    lower = missing_one_for_school()
    higher = one_to_offer()
    { eligible_player, cards } = ConsciousPhoenix.Player.fifth_striving_eligible(
      %{ lower.pid => lower, higher.pid => higher },
      higher,
      [lower.pid, higher.pid]
    )
    assert Enum.count(cards) == 1
  end

  defp multiplicity_needs_one do
    missing_one = missing_one_for_school()
    offers_one = one_to_offer()
    game = %ConsciousPhoenix.Game{
      players: %{
        missing_one.pid => missing_one,
        offers_one.pid => offers_one,
      },
      turns: [ missing_one.pid, offers_one.pid ],
    }
    { result, game } = ConsciousPhoenix.Game.fifth_striving(game, offers_one)
    assert result == :one
    lower = game.players[missing_one.pid]
    higher = game.players[offers_one.pid]
    assert Enum.count(lower.cards) == 2
    assert Enum.count(higher.cards) == 4
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
        "school_type" => "Fakir"
      },
      hand: [%{"c" => "3D"}, %{"c" => "6S"}]
    }
  end
end
