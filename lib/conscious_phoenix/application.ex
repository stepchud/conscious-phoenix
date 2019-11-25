defmodule ConsciousPhoenix.Application do
  # See https://hexdocs.pm/elixir/Application.html
  # for more information on OTP Applications
  @moduledoc false

  use Application

  def start(_type, _args) do
    import Supervisor.Spec
    # List all child processes to be supervised
    children = [
      # Start the Ecto repository
      ConsciousPhoenix.Repo,
      # Start the endpoint when the application starts
      ConsciousPhoenixWeb.Endpoint,
      # Starts a worker by calling: ConsciousPhoenix.Worker.start_link(arg)
      # {ConsciousPhoenix.Worker, arg},
      worker(ConsciousPhoenix.GameServer, [[], ConsciousPhoenix.GameServer])
    ]

    # See https://hexdocs.pm/elixir/Supervisor.html
    # for other strategies and supported options
    opts = [strategy: :one_for_one, name: ConsciousPhoenix.Supervisor]
    Supervisor.start_link(children, opts)
  end

  # Tell Phoenix to update the endpoint configuration
  # whenever the application is updated.
  def config_change(changed, _new, removed) do
    ConsciousPhoenixWeb.Endpoint.config_change(changed, removed)
    :ok
  end
end
