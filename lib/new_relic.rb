require 'curb'
class NewRelic

  def initialize start_date, end_date, config = {}
    @api_key = config[:api_key]
    @account_id = get_account_id
    @application_id = get_application_id
  end

  def get_account_id 
    account_id = ''
    VCR.use_cassette('get_account_id') do
      response = call_new_relic 'https://api.newrelic.com/api/v1/accounts.xml'   
      account_id = XmlSimple.xml_in(response.body_str)['account'][0]['id'][0]['content']
    end
    account_id
  end

  def get_application_id 
    application_id = ''
    VCR.use_cassette('get_application_list') do
      response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications.xml"
      puts response.body_str
      application_id = XmlSimple.xml_in(response.body_str)['application'][0]['id'][0]['content']
    end
    application_id
  end

  def get_summary_metrics
    VCR.use_cassette("get_summary_metrics_for_#{@application_id}") do
      response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/threshold_values.xml"
      response.body_str
    end
  end

  def get_apdex
    VCR.use_cassette("get_apdex_for_#{@application_id}") do
      response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/data.xml?metrics[]=Apdex&field=score&summary=1&begin=2013-02-01T00:00:00Z&end=2013-02-01T23:59:59Z"
      XmlSimple.xml_in(response.body_str)['metric'][0]['field'][0]['content'] 
    end

  end

  def get_available_metrics
    VCR.use_cassette("get_available_metrics_for_#{@application_id}") do
      response = call_new_relic "https://api.newrelic.com/api/v1/applications/#{@application_id}/metrics.xml"
      response.body_str
    end
  end

  def get_end_user_apdex
    VCR.use_cassette("get_end_user_apdex_for_#{@application_id}") do
      response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/data.xml?metrics[]=EndUser/Apdex&field=score&summary=1&begin=2013-02-01T00:00:00Z&end=2013-02-01T23:59:59Z"
      puts response.body_str
      response.body_str
    end
  end


  def call_new_relic url
    Curl::Easy.perform(url) do |curl|
      curl.headers['x-api-key'] = @api_key
    end
  end

  def to_builder
    Jbuilder.new do |new_relic|
      new_relic.apdex get_apdex
    end
  end
end
