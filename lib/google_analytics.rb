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

  def initialize start_date, end_date, config = {}
    @web_property_id = config[:web_property]
    @date_range = {start_date: start_date, end_date: end_date}
    
    Garb::Session.login config[:user_name], config[:password]
    
    get_profile
  end

  def get_profile 
    @profile = Garb::Management::Profile.all.detect {|profile| profile.web_property_id == @web_property_id}
  end
  
  def get_unique_pageviews
    result = UniquePageViewsReport.results(@profile, @date_range)
    result.first.unique_pageviews
  end

  def get_unique_visitors
    result = UniqueVisitorsReport.results(@profile, @date_range)
    result.first.visitors
  end

  def get_average_page_load_time
    result = AveragePageLoadTimeReport.results(@profile, @date_range)
    result.first.avg_page_load_time
  end

  def get_percentage_of_new_visits
    result = PercentageOfNewVisits.results(@profile, @date_range)
    result.first.percent_new_visits
  end

  def to_builder
    Jbuilder.new do |google_analytics|
      google_analytics.unique_pageviews get_unique_pageviews
      google_analytics.unique_visitors get_unique_visitors
      google_analytics.average_page_load_time get_average_page_load_time
      google_analytics.percentage_of_new_visits get_percentage_of_new_visits
    end
  end
end

