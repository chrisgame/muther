require 'rubygems'
require 'bundler'
Bundler.setup()

require 'pp'
require './lib/app'

class Muther 

  if ENV['RACK_ENV'] == 'offline'
    VCR.configure do |c|
      c.cassette_library_dir = 'fixtures/vcr_cassettes/offline'
      c.hook_into :webmock
    end
  end
 
  configure do
    set :public_folder, 'public'
    CONFIG = YAML::load(File.open('sites.yaml'))
    pp CONFIG
  end 
end

run Muther


