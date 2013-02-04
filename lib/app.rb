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
require_relative 'new_relic'
require_relative 'google_analytics'
require_relative 'team_city'

class Muther < Sinatra::Base

  before do
    VCR.insert_cassette('all', :record => :new_episodes) if ENV['RACK_ENV'] == 'offline'
  end

  get '/'do
   haml :index 
  end

  get '/new-relic.json' do
    start_date = Date.new(2013,02,01)
    end_date = Date.new(2013,02,02)
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
          new_relic = NewRelic.new start_date, end_date, CONFIG[key][:new_relic]
          eval("json.#{key.to_s} new_relic.to_builder")
        rescue
          eval("json.#{key.to_s}")
        end
      end
    end
  end

  get '/google-analytics.json' do
    start_date = Date.new(2013,02,01)
    end_date = Date.new(2013,02,02)
    Jbuilder.encode do |json|
      CONFIG.keys.each do |key|
        begin
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
          team_city = TeamCity.new CONFIG[key][:team_city]
          eval("json.#{key.to_s} team_city.to_builder")
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



