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

class Muther < Sinatra::Base
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
        google_analytics = GoogleAnalytics.new start_date, end_date, CONFIG[key][:google_analytics]
        eval("json.#{key.to_s} google_analytics.to_builder")
      end
    end
  end
end



