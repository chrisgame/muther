
var deferedFetch = {
  fetchUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.unique_visitors); 
        dataset[pos].uniqueVisitors = parseInt(data.site.unique_visitors);
      }catch(error){
        dataset[pos].uniqueVisitors = minRadius;        
      }
      deferedFetch.updateBubbles(dataset, startDate, endDate, pos);
    });
  },

  fetchPageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.average_page_load_time); 
        dataset[pos].pageLoadTime = parseFloat(data.site.average_page_load_time);
      }catch(error){
        dataset[pos].pageLoadTime = defaultPageLoadTime;        
      }
      deferedFetch.updateBubbles(dataset, startDate, endDate, pos);
    });
  },

  fetchApdexFromNewRelic: function(dataset, startDate, endDate, pos){
    var fetchUrl = 'http://localhost:3000/new-relic.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.apdex); 
        dataset[pos].apdex = parseFloat(data.site.apdex);
      }catch(error){
        dataset[pos].apdex = defaultApdex;        
      }
      deferedFetch.updateBubbles(dataset, startDate, endDate, pos);
    });
  },

  fetchBuildStatusFromTeamCity: function(dataset, pos){
    var fetchUrl = 'http://localhost:3000/team-city.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
    $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.build_status); 
        dataset[pos].buildStatus = data.site.build_status;
      }catch(error){
        dataset[pos].buildStatus = defaultBuildStatus;        
      }
      deferedFetch.updateBubbles(dataset, pos);
    });
  },

  updateUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate){
    var fetchArray = [];
    for (i = 0; i < dataset.length; i += 1){
        fetchArray.push(deferedFetch.fetchUniqueVisitorsFromGoogleAnalytics(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('Finished Unique Views From Google Analytics') 
    });
  },

  updatePageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate){
    var fetchArray = [];
    for (i = 0; i < dataset.length; i += 1){
        fetchArray.push(deferedFetch.fetchPageLoadTimeFromGoogleAnalytics(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('Finished Pageload Time From Google Analytics') 
    });
  },

  updateApdexFromNewRelic: function(dataset, startDate, endDate){
    var fetchArray = [];
    for (i = 0; i < dataset.length; i += 1){
        fetchArray.push(deferedFetch.fetchApdexFromNewRelic(dataset, startDate, endDate, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('Finished Apdex From New Relic') 
    });
  },

  updateBuildStatusFromTeamCity: function(dataset){
    var fetchArray = [];
    for (i = 0; i < dataset.length; i += 1){
        fetchArray.push(deferedFetch.fetchBuildStatusFromTeamCity(dataset, i));
    };
    $.when.apply($, fetchArray).done(function(){
      console.log('Finished Build Status From Team City') 
    });
  },

  updateBubbles: function(dataset, startDate, endDate, pos){
    updateScales();
    updateAxis();
    updateLabels();
    svg.selectAll('circle')
       .data(dataset)
       .transition()
       .duration('1000')
       .each('start', function(d, i){
         if(i == 0){
           console.log('A');
         }
       })
       .attr('class', function(d, i){
         return 'build-status-'+d.buildStatus
       })
       .attr('r', function(d, i){
         return rScale(d.uniqueVisitors);
       })
       .attr('cx', function(d, i){
         return xScale(d.pageLoadTime);
       }) 
       .attr('cy', function(d, i){
         return yScale(d.apdex);
       })
       .each('end', function(d, i){
        if(i == dataset.length-1){
          console.log('F');
          if(pos < dataset.length-1){
            console.log('F All Anim')
          }
        }
       });
  }
};
