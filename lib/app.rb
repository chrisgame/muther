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

  get '/new-relic.json' do
    start_date = DateTime.parse(params[:startdate])
    end_date = DateTime.parse(params[:enddate])
    puts "New Relic from "+start_date.to_s+" to "+end_date.to_s
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
          puts "Fetching from new relic for "+CONFIG[key][:new_relic][:api_key]
          new_relic = NewRelic.new start_date, end_date, CONFIG[key][:new_relic]
          eval("json.#{key.to_s} new_relic.to_builder")
        rescue
          eval("json.#{key.to_s}")
        end
      end
    end
  end

  get '/google-analytics.json' do
    start_date = DateTime.parse(params[:startdate])
    end_date = DateTime.parse(params[:enddate])
    puts "Google analytics from "+start_date.to_s+" to "+end_date.to_s
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
          puts "Fetching from google analytics for "+CONFIG[key][:google_analytics][:web_property]
          google_analytics = GoogleAnalytics.new start_date, end_date, CONFIG[key][:google_analytics]
          eval("json.#{key.to_s} google_analytics.to_builder")
        rescue
          eval("json.#{key.to_s}")
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
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
          puts "Fetching from heroku for "+CONFIG[key][:heroku][:app_name]
          heroku = Heroku.new start_date, end_date, CONFIG[key][:heroku]
          eval("json.#{key.to_s} heroku.to_builder")
        rescue
          eval("json.#{key.to_s}")
        end
      end
    end
  end

  after do
    VCR.eject_cassette if ENV['RACK_ENV'] == 'offline'
  end
end



