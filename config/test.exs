use Mix.Config

# Configure your database
config :conscious_phoenix, ConsciousPhoenix.Repo,
  username: "postgres",
  password: "postgres",
  database: "conscious_phoenix_test",
  hostname: "localhost",
  pool: Ecto.Adapters.SQL.Sandbox

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :conscious_phoenix, ConsciousPhoenixWeb.Endpoint,
  http: [port: 4002],
  server: false

# Print only warnings and errors during test
config :logger, level: :warn
