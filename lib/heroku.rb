require 'curb'
require 'time'
require 'json'

class Heroku
  def initialize start_date, end_date, config = {}
    @start_date = start_date
    @end_date = end_date
    @api_key = config[:api_key]
    @app_name = config[:app_name]
  end

  def call_heroku url
    curl = Curl::Easy.new(url)
    curl.headers['Accept']='application/json'
    curl.http_auth_types = :basic
    curl.username = ''
    curl.password = @api_key
    curl.perform
    JSON curl.body_str
  end

  def get_release_count
    response = call_heroku "https://api.heroku.com/apps/#{@app_name}/releases"
    response.collect{|release| release['created_at']}.select{|time| (@start_date..@end_date).cover?(Time.parse(time))}.count
  end

  def to_builder
    Jbuilder.new do |heroku|
      heroku.release_count get_release_count
    end
  end
end
