defmodule ConsciousPhoenix.MixProject do
  use Mix.Project

  def project do
    [
      app: :conscious_phoenix,
      version: "0.2.0",
      elixir: "~> 1.13",
      elixirc_paths: elixirc_paths(Mix.env()),
      compilers: [:phoenix, :gettext] ++ Mix.compilers(),
      start_permanent: Mix.env() == :prod,
      aliases: aliases(),
      description: description(),
      package: package(),
      deps: deps()
    ]
  end

  # Configuration for the OTP application.
  #
  # Type `mix help compile.app` for more information.
  def application do
    [
      mod: {ConsciousPhoenix.Application, []},
      extra_applications: [:logger, :runtime_tools]
    ]
  end

  defp package do
    [
      files: ["assets", "lib", "mix.exs", "README*", "LICENSE*"],
      maintainers: ["stepchud"],
      licenses: ["MIT"],
      links: %{"GitHub" => "https://github.com/stepchud/conscious-phoenix"}
    ]
  end

  defp description do
    """
    The Conscious Boardgame: a game about developing consciousness
    """
  end

  # Specifies which paths to compile per environment.
  defp elixirc_paths(:test), do: ["lib", "test/support"]
  defp elixirc_paths(_), do: ["lib"]

  # Specifies your project dependencies.
  #
  # Type `mix help deps` for examples and options.
  defp deps do
    [
      {:phoenix, "~> 1.6"},
      {:phoenix_pubsub, "~> 2.0"},
      {:phoenix_ecto, "~> 4.4"},
      {:quantum, "~> 3.4"},
      {:ecto_sql, "~> 3.7"},
      {:postgrex, ">= 0.0.0"},
      {:phoenix_html, "~> 3.2"},
      {:phoenix_live_reload, "~> 1.3", only: :dev},
      {:phoenix_live_view, "~> 0.17.6"},
      {:floki, ">= 0.30.0", only: :test},
      {:gettext, "~> 0.19"},
      {:jason, "~> 1.3"},
      {:plug_cowboy, "~> 2.5"},
      {:uuid, "~> 1.1"}
    ]
  end

  # Aliases are shortcuts or tasks specific to the current project.
  # For example, to create, migrate and run the seeds file at once:
  #
  #     $ mix ecto.setup
  #
  # See the documentation for `Mix` for more info on aliases.
  defp aliases do
    [
      "ecto.setup": ["ecto.create", "ecto.migrate", "run priv/repo/seeds.exs"],
      "ecto.reset": ["ecto.drop", "ecto.setup"],
      test: ["ecto.create --quiet", "ecto.migrate", "test"]
    ]
  end
end
