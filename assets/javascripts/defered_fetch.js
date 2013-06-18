
var deferedFetch = {
  fetchUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset.nodes[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        dataset.nodes[pos].uniqueVisitors = parseInt(data.site.unique_visitors);
      }catch(error){
        dataset.nodes[pos].uniqueVisitors = minRadius;        
      }
      bubbles.update(dataset, startDate, endDate, pos);
    });
  },

  fetchPageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset.nodes[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        dataset.nodes[pos].pageLoadTime = parseFloat(data.site.average_page_load_time);
      }catch(error){
        dataset.nodes[pos].pageLoadTime = defaultPageLoadTime;        
      }
      bubbles.update(dataset, startDate, endDate, pos);
    });
  },

  fetchApdexFromNewRelic: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/new-relic.json?site='+dataset.nodes[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        dataset.nodes[pos].apdex = parseFloat(data.site.apdex);
      }catch(error){
        dataset.nodes[pos].apdex = defaultApdex;        
      }
      bubbles.update(dataset, startDate, endDate, pos);
    });
  },

  fetchBuildStatusFromTeamCity: function(dataset, pos){
    var fetchUrl = 'http://localhost:3000/team-city.json?site='+dataset.nodes[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
    return $.getJSON(fetchUrl, function(data){
      try{
        dataset.nodes[pos].buildStatus = data.site.build_status;
      }catch(error){
        dataset.nodes[pos].buildStatus = defaultBuildStatus;        
      }
      bubbles.update(dataset, pos);
    });
  },

  updateUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate){
    console.log('###Started Unique Views From Google Analytics') 
    var fetchArray = [];
    for (i = 0; i < dataset.nodes.length; i += 1){
        fetchArray.push(deferedFetch.fetchUniqueVisitorsFromGoogleAnalytics(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('###Finished Unique Views From Google Analytics') 
    });
  },

  updatePageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate){
    console.log('###Started Pageload Time From Google Analytics') 
    var fetchArray = [];
    for (i = 0; i < dataset.nodes.length; i += 1){
        fetchArray.push(deferedFetch.fetchPageLoadTimeFromGoogleAnalytics(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('###Finished Pageload Time From Google Analytics') 
    });
  },

  updateApdexFromNewRelic: function(dataset, startDate, endDate){
    console.log('###Started Apdex From New Relic') 
    var fetchArray = [];
    for (i = 0; i < dataset.nodes.length; i += 1){
        fetchArray.push(deferedFetch.fetchApdexFromNewRelic(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('###Finished Apdex From New Relic') 
    });
  },

  updateBuildStatusFromTeamCity: function(dataset){
    console.log('###Started Build Status From Team City') 
    var fetchArray = [];
    for (i = 0; i < dataset.nodes.length; i += 1){
        fetchArray.push(deferedFetch.fetchBuildStatusFromTeamCity(dataset, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('###Finished Build Status From Team City') 
    });
  },
};
