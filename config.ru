require 'rubygems'
require 'bundler'
Bundler.setup()
require './lib/app'

class Muther 
  VCR.configure do |c|
    c.cassette_library_dir = 'fixtures/vcr_cassettes/offline'
    c.hook_into :webmock
  end
 
  configure do
    CONFIG = YAML::load(File.open('sites.yaml'))
    
  end 
end

run Muther


