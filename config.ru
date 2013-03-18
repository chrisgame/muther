require 'rubygems'
require 'bundler'
Bundler.require(:default, :app, ENV['RACK_ENV'].to_sym)

require 'pp'
require './lib/app'
require './config/sprockets'

class Muther 

  if ENV['RACK_ENV'] == 'offline'
    VCR.configure do |c|
      c.cassette_library_dir = 'fixtures/vcr_cassettes/offline'
      c.hook_into :webmock
    end
  end

  if ENV['RACK_ENV'] === 'offline'
    require './config/sprockets'
    assets = Muther::Assets::Environment.get File.realdirpath(".")
    map('/assets') { run assets.index}
  end
 
  configure do
    set :production, ENV['RACK_ENV'] === 'production'
    set :app_root, File.realdirpath('.')
    set :assets, Muther::Assets::Environment.get(settings.app_root, settings.production)

    Sprockets::Helpers.configure do |config|
      config.environment = settings.assets
      config.prefix      = '/assets'
      config.digest      = true
      config.public_path = settings.public_folder
    end

    CONFIG = YAML::load(File.open('sites.yaml'))
    pp CONFIG
  end 
end

run Muther


