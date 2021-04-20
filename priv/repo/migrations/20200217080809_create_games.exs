defmodule ConsciousPhoenix.Repo.Migrations.CreateGames do
  use Ecto.Migration

  def change do
    create table(:games) do
      add :gid,     :string
      add :board,   :jsonb, default: "{}"
      add :players, :jsonb, default: "{}"
      add :cards,   :jsonb, default: "{}"
      add :laws,    :jsonb, default: "{}"
      add :log,     :jsonb, default: "[]"
      add :turns,   :jsonb, default: "[]"

      timestamps()
    end

    # gid is unique
    create unique_index(:games, [:gid])
  end
end
