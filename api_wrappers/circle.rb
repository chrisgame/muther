require 'curb'
require 'time'
require 'json'

class Circle
  def initialize config = {}, options = {}
    @token = config[:token]
    @project_name = config[:project_name]
  end

  def call_circle url
    curl = Curl::Easy.new(url)
    curl.headers['Accept']='application/json'
    curl.perform
    JSON curl.body_str
  end

  def get_build_status
    response = call_circle "https://circleci.com/api/v1/project/#{@project_name}?circle-token=#{@token}"
    response[0]['status']
  end

  def to_builder
    Jbuilder.new do |circle|
      circle.status get_build_status
    end
  end
end
