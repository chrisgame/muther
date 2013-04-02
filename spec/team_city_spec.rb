require 'bundler'
Bundler.require(:default, :development, :test)

ENV['RACK_ENV'] = 'offline'

require_relative '../app.rb'

describe 'the team city api wrapper' do
  include Rack::Test::Methods

  def app
    Muther
  end

  it 'should return information for all sites' do
    get '/team-city.json?startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"advanced_diagnostics":{"build_status":"success"},"announcements":{"build_status":"success"},"broadband_connection":{"build_status":"failure"},"contact_us":{"build_status":"success"},"diagnostics":{"build_status":"failure"},"help":{"build_status":"success"},"help_editor":{"build_status":"success"},"home_move":{"build_status":"success"},"service_status":{"build_status":"success"}}'
  end

  it 'should return information for an individual site' do
    get '/team-city.json?site=help&startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"site":{"build_status":"success"}}'
  end
end
