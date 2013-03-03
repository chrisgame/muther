require 'sinatra/base'
require 'vcr'
require 'net/http'
require 'net/https'
require 'uri'
require 'xmlsimple'
require 'pry'
require 'garb'
require 'haml'
require 'yaml'
require 'jbuilder'
require 'time'
require_relative 'new_relic'
require_relative 'google_analytics'
require_relative 'team_city'
require_relative 'heroku'

class Muther < Sinatra::Base

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



