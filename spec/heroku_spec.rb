require 'bundler'
Bundler.require(:default, :development, :test)

ENV['RACK_ENV'] = 'offline'

require_relative '../app.rb'

describe 'the heroku api wrapper' do
  include Rack::Test::Methods

  def app
    Muther
  end

  it 'should return a release count for all site' do
    get '/heroku.json?startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"advanced_diagnostics":{"release_count":0},"announcements":{"release_count":0},"broadband_connection":{"release_count":0},"contact_us":{"release_count":0},"diagnostics":{"release_count":2},"help":{"release_count":0},"help_editor":{"release_count":3},"home_move":{"release_count":0},"service_status":{"release_count":0}}'
  end

  it 'should return a release count for an individual site' do
    get '/heroku.json?site=help_editor&startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"site":{"release_count":3}}'
  end
end
