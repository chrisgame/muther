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
require_relative './api_wrappers/circle'

class Muther < Sinatra::Base
  if ENV['RACK_ENV'] == 'offline'
    require 'vcr'
    VCR.configure do |c|
    c.cassette_library_dir = 'fixtures/vcr_cassettes/offline'
    c.hook_into :webmock
    end
  end

  set :sprockets, Sprockets::Environment.new(root)
  set :precompile, [ /\w+(.js|.coffee|.css|.css.scss|.png)$/ ]
  set :assets_prefix, '/assets'
  set :digest_assets, false
  set(:assets_path) { File.join public_folder, assets_prefix }
  
  configure do
    sprockets.append_path File.join(root, 'assets', 'stylesheets')
    sprockets.append_path File.join(root, 'assets', 'javascripts')
    sprockets.append_path File.join(root, 'assets', 'images')
    sprockets.append_path File.join(public_folder, 'assets', 'ext')

    unless ENV['RACK_ENV'] != 'production'
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
        fetch_for_site :new_relic, params[:site].to_sym, json, start_date: start_date, end_date: end_date 
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :new_relic, key, json, start_date: start_date, end_date: end_date
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
        fetch_for_site :google_analytics, params[:site].to_sym, json, start_date: start_date, end_date: end_date
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :google_analytics, key, json, start_date: start_date, end_date: end_date
        end
      end
    end
  end

  get '/team-city.json' do
    unless params[:site].nil?
      Jbuilder.encode do |json|
        fetch_for_site :team_city, params[:site].to_sym, json 
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :team_city, key, json
        end
      end
    end
  end

  get '/circle.json' do
    unless params[:site].nil?
      Jbuilder.encode do |json|
        fetch_for_site :circle, params[:site].to_sym, json 
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :circle, key, json
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
        fetch_for_site :heroku, params[:site].to_sym, json, start_date: start_date, end_date: end_date 
      end
    else
      Jbuilder.encode do |json|
        CONFIG.keys.each do |key|
          fetch :heroku, key, json, start_date: start_date, end_date: end_date 
        end
      end
    end
  end

  after do
    VCR.eject_cassette if ENV['RACK_ENV'] == 'offline'
  end

  helpers do
    def fetch source, site, json, options={}
      source_class_name = get_class_name(source.to_s)
      begin
        puts "Fetching from "+source.to_s+" for "+site.to_s
        return nil if CONFIG[site][source].nil?
        source_class = eval("#{source_class_name}.new CONFIG[site][source], options")
        eval("json.#{site.to_s} source_class.to_builder")
      rescue
        eval("json.#{site.to_s}")
      end
    end

    def fetch_for_site source, site, json, options = {}
      source_class_name = get_class_name(source.to_s)
      begin
        puts "Fetching from "+source.to_s+" for "+site.to_s
        return nil if CONFIG[site][source].nil?
        source_class = eval("#{source_class_name}.new CONFIG[site][source], options")
        eval("json.site source_class.to_builder")
      rescue
        eval("error")
      end
    end

    def get_class_name string
      string.gsub('_',' ').split(' ').map(&:capitalize).join('')
    end 
  end

end



