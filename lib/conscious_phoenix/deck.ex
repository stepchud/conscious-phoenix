defmodule ConsciousPhoenix.Deck do
  alias __MODULE__

  @derive {Jason.Encoder,
    only: [
      :deck,
      :discards
    ]
  }

  defstruct(
    deck: [],
    discards: []
  )

  # NOTE: unused
  def generate_deck() do
    deck = Enum.flat_map(
      ["2D","3D","4D","2C","3C","4C","2H","3H","4H","2S","3S","4S"],
      fn x -> [x, x, x, x]
    end) ++ Enum.flat_map(
      ["5D","6D","7D","5C","6C","7C","5H","6H","7H","5S","6S","7S"],
      fn x -> [x, x, x]
    end) ++ Enum.flat_map(
      ["8D","9D","10D","8C","9C","10C","8H","9H","10H","8S","9S","10S"],
      fn x -> [x, x]
    end) ++ [
      "JS", "JS", "JS", "JS", "JD", "JD", "JD", "QD", "QD", "JC", "JC", "QC", "JH"
    ]
    Enum.shuffle(deck)
  end

  # draw one card, shuffling first if needed
  def draw_card(cards) do
    { deck, discards } = if Enum.empty?(cards.deck) do
      { Enum.shuffle(cards.discards), [] }
    else
      { cards.deck, cards.discards }
    end
    [ drawn | deck ] = deck
    {
      %{"c" => drawn, "selected" => false},
      %{ deck: deck, discards: discards }
    }
  end
end
