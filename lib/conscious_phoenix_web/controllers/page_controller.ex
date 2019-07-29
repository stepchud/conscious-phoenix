defmodule ConsciousPhoenixWeb.PageController do
  use ConsciousPhoenixWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
