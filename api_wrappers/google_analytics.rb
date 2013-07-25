class GoogleAnalytics
  class UniquePageViewsReport 
    extend Garb::Model
    metrics :unique_pageviews
  end

  class UniqueVisitorsReport
    extend Garb::Model
    metrics :visitors
  end

  class AveragePageLoadTimeReport
    extend Garb::Model
    metrics :avgPageLoadTime
  end

  class PercentageOfNewVisits
    extend Garb::Model
    metrics :percentNewVisits
  end

  def initialize config = {}, options = {}
    @web_property_id = config[:web_property]
    @date_range = {start_date: options[:start_date], end_date: options[:end_date]}
   
    Garb::Session.login config[:user_name], config[:password]
    
    get_profile
  end

  def get_profile 
    @profile = Garb::Management::Profile.all.detect {|profile| profile.web_property_id == @web_property_id}
  end
  
  def get_unique_pageviews
    begin 
      result = UniquePageViewsReport.results(@profile, @date_range)
      result.first.unique_pageviews
    rescue
      return 'undefined'
    end
  end

  def get_unique_visitors
    begin
      result = UniqueVisitorsReport.results(@profile, @date_range)
      result.first.visitors
    rescue
      return 'undefined'
    end
  end

  def get_average_page_load_time
    begin
      result = AveragePageLoadTimeReport.results(@profile, @date_range)
      result.first.avg_page_load_time
    rescue
      return 'undefined'
    end
  end

  def get_percentage_of_new_visits
    begin
      result = PercentageOfNewVisits.results(@profile, @date_range)
      result.first.percent_new_visits
    rescue
      return 'undefined'
    end
  end

  def to_builder
    Jbuilder.new do |google_analytics|
      google_analytics.unique_visitors get_unique_visitors
      google_analytics.average_page_load_time get_average_page_load_time
    end
  end
end

