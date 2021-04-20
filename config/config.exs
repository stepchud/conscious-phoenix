# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :conscious_phoenix,
  ecto_repos: [ConsciousPhoenix.Repo]

config :conscious_phoenix, ConsciousPhoenix.Scheduler,
  overlap: false, # NOTE: defaults all jobs not to overlap
  jobs: [
    # {"* * * * *", {ConsciousPhoenix.SyncGamesJob, :sync, []}} # Every minute
    {{:extended, "*/10"}, {ConsciousPhoenix.SyncGamesJob, :sync, []}} # Every 10 seconds
  ]

# Configures the endpoint
config :conscious_phoenix, ConsciousPhoenixWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "rVnGRIGpAlHMfMOVMPgI2JQUkbGX7Ff0v+t/Eg/moKoeNT3ZvR+KwoG8HHawJSrf",
  render_errors: [view: ConsciousPhoenixWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: ConsciousPhoenix.PubSub, adapter: Phoenix.PubSub.PG2]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
