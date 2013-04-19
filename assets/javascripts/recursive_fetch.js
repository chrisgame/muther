var recursiveFetch = {
  fetchUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate, pos, fetchNext){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.unique_visitors); 
        dataset[pos].uniqueVisitors = parseInt(data.site.unique_visitors);
      }catch(error){
        dataset[pos].uniqueVisitors = minRadius;        
      }
      updateBubbles(dataset, startDate, endDate, pos, fetchNext);
    });
  },

  fetchPageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate, pos, fetchNext){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.average_page_load_time); 
        dataset[pos].pageLoadTime = parseFloat(data.site.average_page_load_time);
      }catch(error){
        dataset[pos].pageLoadTime = defaultPageLoadTime;        
      }
      updateBubbles(dataset, startDate, endDate, pos, fetchNext);
    });
  },

  fetchApdexFromNewRelic: function(dataset, startDate, endDate, pos, fetchNext){
    var fetchUrl = 'http://localhost:3000/new-relic.json?site='+dataset[pos].name+'&startdate='+formating.urlDate(startDate)+'&enddate='+formating.urlDate(endDate);
    return $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.apdex); 
        dataset[pos].apdex = parseFloat(data.site.apdex);
      }catch(error){
        dataset[pos].apdex = defaultApdex;        
      }
      updateBubbles(dataset, startDate, endDate, pos, fetchNext);
    });
  },

  fetchBuildStatusFromTeamCity: function(dataset, pos, fetchNext){
    var fetchUrl = 'http://localhost:3000/team-city.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
    return $.getJSON(fetchUrl, function(data){
      try{
        console.log('R '+dataset[pos].name+' returned '+data.site.build_status); 
        dataset[pos].buildStatus = data.site.build_status;
      }catch(error){
        dataset[pos].buildStatus = defaultBuildStatus;        
      }
      updateBubbles(dataset, pos, fetchNext);
    });
  },

  updateUniqueVisitorsFromGoogleAnalytics: function(dataset, startDate, endDate){
    return recursiveFetch.fetchUniqueVisitorsFromGoogleAnalytics(dataset, startDate, endDate, 0, recursiveFetch.fetchUniqueVisitorsFromGoogleAnalytics);
  },

  updatePageLoadTimeFromGoogleAnalytics: function(dataset, startDate, endDate){
    return recursiveFetch.fetchPageLoadTimeFromGoogleAnalytics(dataset, startDate, endDate, 0, recursiveFetch.fetchPageLoadTimeFromGoogleAnalytics);
  },

  updateApdexFromNewRelic: function(dataset, startDate, endDate){
    return recursiveFetch.fetchApdexFromNewRelic(dataset, startDate, endDate, 0, recursiveFetch.fetchApdexFromNewRelic)
  },

  updateBuildStatusFromTeamCity: function(dataset){
    return recursiveFetch.fetchBuildStatusFromTeamCity(dataset, 0, recursiveFetch.fetchBuildStatusFromTeamCity)
  },

  updateBubbles: function(dataset, startDate, endDate, pos, fetchNext){
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
            fetchNext(dataset, startDate, endDate, pos+1, fetchNext);
          }
        }
       });
  }
};
