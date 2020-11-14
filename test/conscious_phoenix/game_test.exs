defmodule ConsciousPhoenix.GameTest do
  use ExUnit.Case

  test '#fifth_striving single fakir possibility' do
    lower = missing_one_fakir()
    higher = one_to_offer()
    game = game_with(lower: lower, higher: higher)
    { result, game } = ConsciousPhoenix.Game.fifth_striving(game, higher.pid)
    assert result == :one
    lower_after = game.players[lower.pid]
    higher_after = game.players[higher.pid]
    assert Enum.count(lower_after.hand) == 2
    assert Enum.count(higher_after.hand) == 4
  end

  test '#fifth_striving multiple balanced possibility' do
    lower = missing_one_balanced()
    higher = several_to_offer()
    game = game_with(lower: lower, higher: higher)
    { result, { cards, lower_after, higher_after } } = ConsciousPhoenix.Game.fifth_striving(game, higher.pid)
    assert result == :multi
    assert Enum.count(cards) == 3
  end

  defp game_with(lower: lower, higher: higher) do
    %ConsciousPhoenix.Game{
      players: %{
        lower.pid => lower,
        higher.pid => higher,
      },
      turns: [ lower.pid, higher.pid ],
      cards: %{ deck: ["2S", "4D", "7C", "10H"], discards: [] }
    }
  end

  defp missing_one_fakir do
    %ConsciousPhoenix.Player{
      pid: ConsciousPhoenix.Player.generate_pid(),
      ep: %{
        "level_of_being" => "MULTIPLICITY",
        "pieces" => [0,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      hand: [%{"c" => "2D"}]
    }
  end

  defp missing_one_balanced do
    %ConsciousPhoenix.Player{
      pid: ConsciousPhoenix.Player.generate_pid(),
      ep: %{
        "level_of_being" => "MULTIPLICITY",
        "pieces" => [0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      hand: [%{"c" => "8H"}, %{"c" => "5H"}, %{"c" => "6S"}]
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

  defp several_to_offer do
    %ConsciousPhoenix.Player{
      pid: ConsciousPhoenix.Player.generate_pid(),
      ep: %{
        "level_of_being" => "DEPUTY-STEWARD",
        "school_type" => "Balanced",
        "pieces" => [1,1,2,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
      },
      hand: [%{"c" => "9H"}, %{"c" => "10H"}, %{"c" => "7S"}]
    }
  end
end
