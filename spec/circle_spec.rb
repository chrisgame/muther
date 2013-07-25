require 'bundler'
Bundler.require(:default, :development, :test)

ENV['RACK_ENV'] = 'offline'

require_relative '../app.rb'

describe 'the circle api wrapper' do
  include Rack::Test::Methods

  def app
    Muther
  end

  it 'should return a build status for all sites' do
    get '/circle.json'
    last_response.should be_ok
    last_response.body.should eq '{"diagnostics":{"status":"success"}}'
  end

  it 'should return a build status for a site' do
    get '/circle.json?site=diagnostics'
    last_response.should be_ok
    last_response.body.should eq '{"site":{"status":"success"}}'
  end
end
