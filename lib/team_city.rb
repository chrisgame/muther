class TeamCity

  LIST_BUILDS = '/httpAuth/app/rest/projects/id:'  
  BUILD_STATUS = '/httpAuth/app/rest/builds/buildType:BUILD_TYPE/status'

  def initialize config = {}
    @base_url = config[:base_url]
    @user_name = config[:user_name]
    @password = config[:password]
    @project_id = config[:project_id]
  end

  def get_build_status
    project_id_response = call_team_city LIST_BUILDS+@project_id
    build_types = XmlSimple.xml_in(project_id_response)['buildTypes'][0]['buildType'].collect{|build_type| build_type['id']}
   
    result = 'success' 
    build_types.each do |build_type|
      result = 'failure' if call_team_city(BUILD_STATUS.gsub('BUILD_TYPE', build_type)) == 'FAILURE'
    end
    result
  end

  def call_team_city path
    curl = Curl::Easy.new("http://#{@base_url+path}/")
    curl.http_auth_types = :basic
    curl.username = @user_name
    curl.password = @password
    curl.perform
    curl.body_str
  end

  def to_builder
    Jbuilder.new do |team_city|
      team_city.build_status get_build_status
    end
  end 
end
