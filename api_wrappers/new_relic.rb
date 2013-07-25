require 'curb'
class NewRelic

  DATE_FORMAT = "%Y-%m-%dT%H:%m:%SZ"

  def initialize config = {}, options = {}
    @api_key = config[:api_key]
    @account_id = get_account_id
    @application_id = get_application_id
    @start_date = options[:start_date]
    @end_date = options[:end_date]
  end

  def get_account_id 
    response = call_new_relic 'https://api.newrelic.com/api/v1/accounts.xml'   
    account_id = XmlSimple.xml_in(response.body_str)['account'][0]['id'][0]['content']
  end

  def get_application_id 
    response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications.xml"
    application_id = XmlSimple.xml_in(response.body_str)['application'][0]['id'][0]['content']
  end

  def get_summary_metrics
    response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/threshold_values.xml"
    response.body_str
  end

  def get_apdex
    response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/data.xml?metrics[]=Apdex&field=score&summary=1&begin=#{@start_date.strftime(DATE_FORMAT)}&end=#{@end_date.strftime(DATE_FORMAT)}"
    XmlSimple.xml_in(response.body_str)['metric'][0]['field'][0]['content'] 
  end

  def get_available_metrics
    response = call_new_relic "https://api.newrelic.com/api/v1/applications/#{@application_id}/metrics.xml"
    response.body_str
  end

  def get_end_user_apdex
    response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/data.xml?metrics[]=EndUser/Apdex&field=score&summary=1&begin=#{@start_date.strftime(DATE_FORMAT)}&end=#{@end_date.strftime(DATE_FORMAT)}"
    response.body_str
  end

  def get_thresholds
    response = call_new_relic "https://api.newrelic.com/api/v1/accounts/#{@account_id}/applications/#{@application_id}/thresholds.xml"
    {caution_value: XmlSimple.xml_in(response.body_str)['threshold'][0]['caution-value'][0],critical_value: XmlSimple.xml_in(response.body_str)['threshold'][0]['critical-value'][0]} 
  end

  def call_new_relic url
    Curl::Easy.perform(url) do |curl|
      curl.headers['x-api-key'] = @api_key
    end
  end

  def to_builder
    Jbuilder.new do |new_relic|
      new_relic.apdex get_apdex
      thresholds = get_thresholds
      new_relic.caution_value thresholds[:caution_value]
      new_relic.critical_value thresholds[:critical_value]
    end
  end
end
