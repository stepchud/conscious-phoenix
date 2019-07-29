defmodule ConsciousPhoenix.Repo do
  use Ecto.Repo,
    otp_app: :conscious_phoenix,
    adapter: Ecto.Adapters.Postgres
end
