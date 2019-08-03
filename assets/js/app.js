// We need to import the CSS so that webpack will load it.
// The MiniCssExtractPlugin is used to separate it out into
// its own CSS file.
import css from "../css/app.css"

import 'phoenix_html'

// webpack automatically bundles all modules in your
// entry points. Those entry points can be configured
// in "webpack.config.js".
//
// Import dependencies
//
import ConsciousBoardgame from './conscious-react/conscious_boardgame'

// Import local files
//
// Local files can be imported directly using relative paths, for example:
// import socket from "./socket"
