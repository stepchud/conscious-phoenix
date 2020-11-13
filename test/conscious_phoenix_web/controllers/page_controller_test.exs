defmodule ConsciousPhoenixWeb.PageControllerTest do
  use ConsciousPhoenixWeb.ConnCase

  test "GET /", %{conn: conn} do
    conn = get(conn, "/")
    assert html_response(conn, 200) =~ "<h1>The Conscious Boardgame</h1>"
  end
end
