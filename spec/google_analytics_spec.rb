require 'bundler'
Bundler.require(:default, :development, :test)

ENV['RACK_ENV'] = 'offline'

require_relative '../app.rb'

describe 'the google analytics api wrapper' do
  include Rack::Test::Methods

  def app
    Muther
  end

  it 'should return information for all sites' do
    get '/google-analytics.json?startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"advanced_diagnostics":{"unique_visitors":"8188","average_page_load_time":"3.938288732394366"},"broadband_connection":{"unique_visitors":"28288","average_page_load_time":"4.661843205574913"},"contact_us":{"unique_visitors":"71061","average_page_load_time":"5.450470104223807"},"diagnostics":{"unique_visitors":"8188","average_page_load_time":"3.938288732394366"},"help":{"unique_visitors":"129763","average_page_load_time":"5.572747933884298"},"home_move":{"unique_visitors":"623","average_page_load_time":"5.658600000000001"},"production_young_river":{"unique_visitors":"623","average_page_load_time":"5.658600000000001"}}'
  end

  it 'should return information for an individual site' do
    get '/google-analytics.json?site=help&startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"help":{"unique_visitors":"129763","average_page_load_time":"5.572747933884298"}}'
  end
end
