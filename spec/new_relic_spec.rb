require 'bundler'
Bundler.require(:default, :development, :test)

ENV['RACK_ENV'] = 'offline'

require_relative '../app.rb'

describe 'the new relic api wrapper' do
  include Rack::Test::Methods

  def app
    Muther
  end

  it 'should return information for all sites' do
    get '/new-relic.json?startdate=2013-01-31T00:00:00&enddate=2013-02-01T23:59:59'
    last_response.should be_ok
    last_response.body.should eq '{"advanced_diagnostics":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"broadband_connection":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"contact_us":{"apdex":"1.0","caution_value":"0.9","critical_value":"0.7"},"diagnostics":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"help":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"help_editor":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"home_move":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"},"service_status":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"}}'
  end

  it 'should return information for an individual site' do
    get '/new-relic.json?site=help&startdate=2013-01-31&enddate=2013-02-01T00:00'
    last_response.should be_ok
    last_response.body.should eq '{"site":{"apdex":"1.0","caution_value":"0.85","critical_value":"0.7"}}'
  end
end
