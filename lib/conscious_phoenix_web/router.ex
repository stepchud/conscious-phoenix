defmodule ConsciousPhoenixWeb.Router do
  use ConsciousPhoenixWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", ConsciousPhoenixWeb do
    pipe_through :browser

    get "/", PageController, :index
    get "/game", GameController, :index
    get "/game/:param_rest", GameController, :show
  end

  # Other scopes may use custom stacks.
  # scope "/api", ConsciousPhoenixWeb do
  #   pipe_through :api
  # end
end
