require 'bundler'
Bundler.require

require 'pp'
require 'json'
require './app'

map Muther.assets_prefix do
  run Muther.sprockets
end

map '/' do
  run Muther
end

run Muther


