defmodule ConsciousPhoenixWeb.GameController do
  use ConsciousPhoenixWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def show(conn, %{"param_rest" => message}) do
    render(conn, "show.html", message: message)
  end
end
