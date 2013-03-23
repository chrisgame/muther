require 'bundler'
Bundler.require
require 'net/http'
require 'net/https'
require 'uri'
require 'yaml'
require 'time'
require_relative './api_wrappers/new_relic'
require_relative './api_wrappers/google_analytics'
require_relative './api_wrappers/team_city'
require_relative './api_wrappers/heroku'

class Muther < Sinatra::Base
  if ENV['RACK_ENV'] == 'offline'
    require 'vcr'
    VCR.configure do |c|
    c.cassette_library_dir = 'fixtures/vcr_cassettes/offline'
    c.hook_into :webmock
    end
  end

  set :sprockets, Sprockets::Environment.new(root)
  set :precompile, [ /\w+(.js)$/, /\w+(.coffee)$/, /\w+(.css.scss)$/, /\w+(.css)$/ ]
  set :assets_prefix, '/assets'
  set :digest_assets, false
  set(:assets_path) { File.join public_folder, assets_prefix }
  
  configure do
    sprockets.append_path File.join(root, 'assets', 'stylesheets')
    sprockets.append_path File.join(root, 'assets', 'javascripts')
    sprockets.append_path File.join(root, 'assets', 'images')
    sprockets.append_path File.join(public_folder, 'assets', 'ext')

    if ENV['RACK_ENV'] != 'offline'
      sprockets.js_compressor = YUI::JavaScriptCompressor.new
      sprockets.css_compressor = YUI::CssCompressor.new
    end

    Sprockets::Helpers.configure do |config|
      config.environment = sprockets
      config.prefix      = assets_prefix
      config.digest      = digest_assets
      config.public_path = public_folder
    end
  end

  helpers do
    include Sprockets::Helpers
  end


  configure do
    CONFIG = YAML::load(File.open('sites.yaml'))
    pp CONFIG
  end

  before do
    VCR.insert_cassette('all', :record => :new_episodes) if ENV['RACK_ENV'] == 'offline'
  end

  get '/'do
   haml :index 
  end

  get '/monitor' do
    case params[:view]
      when 'list'
        haml :list
      when 'bubbles'
        haml :bubbles
    end
  end

  get '/config.json' do
    content_type 'application/json'
    CONFIG.to_json
  end

  get '/new-relic.json' do
    start_date = DateTime.parse(params[:startdate])
    end_date = DateTime.parse(params[:enddate])
    puts "Querying New Relic from "+start_date.to_s+" to "+end_date.to_s

    unless params[:site].nil?
      Jbuilder.encode do |json|
        fetch :new_relic, params[:site].to_sym, start_date, end_date, json
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :new_relic, key, start_date, end_date, json
        end
      end
    end
  end

  get '/google-analytics.json' do
    start_date = DateTime.parse(params[:startdate])
    end_date = DateTime.parse(params[:enddate])
    puts "Google analytics from "+start_date.to_s+" to "+end_date.to_s

    unless params[:site].nil?
      Jbuilder.encode do |json|
        fetch :google_analytics, params[:site].to_sym, start_date, end_date, json
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :google_analytics, key, start_date, end_date, json
        end
      end
    end
  end

  get '/team-city.json' do
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
          puts "Fetching from teamcity for "+CONFIG[key][:team_city][:project_id]
          team_city = TeamCity.new CONFIG[key][:team_city]
          eval("json.#{key.to_s} team_city.to_builder")
        rescue
          eval("json.#{key.to_s}")
        end
      end
    end
  end

  get '/heroku.json' do
    start_date = DateTime.parse(params[:startdate])
    end_date = DateTime.parse(params[:enddate])
    puts "Heroku from "+start_date.to_s+" to "+end_date.to_s

    unless params[:site].nil?
      Jbuilder.encode do |json|
        fetch :heroku, params[:site].to_sym, start_date, end_date, json
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :heroku, key, start_date, end_date, json
        end
      end
    end
  end

  after do
    VCR.eject_cassette if ENV['RACK_ENV'] == 'offline'
  end

  helpers do
    def fetch source, site, start_date, end_date, json
      source_class_name = get_class_name(source.to_s)
	begin
	  puts "Fetching from "+source.to_s+" for "+site.to_s
	  source_class = eval("#{source_class_name}.new start_date, end_date, CONFIG[site][source]")
	  eval("json.#{site.to_s} source_class.to_builder")
	rescue
	  eval("json.#{site.to_s}")
	end
    end

    def get_class_name string
      string.gsub('_',' ').split(' ').map(&:capitalize).join('')
    end 
  end

end



