var dataset=[]
var startRadius = 100
var minRadius = 9
var maxRadius = 300
var defaultApdex = 0
var defaultPageLoadTime = 0
var svg

var w = 2048;
var h = 1024;
var xScale;
var yScale;
var xAxis;
var yAxis;
var xAxisGroup;
var yAxisGroup;
var padding = 35;

function fetchUniqueVisitorsFromGoogleAnalytics(pos, fetchNext){
  var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
  $.getJSON(fetchUrl, function(data){
    try{
      console.log('R '+dataset[pos].name+' returned '+data.site.unique_visitors); 
      dataset[pos].uniqueVisitors = parseInt(data.site.unique_visitors);
    }catch(error){
      dataset[pos].uniqueVisitors = minRadius;        
    }
    updateBubbles(pos, fetchNext);
  });
};

function fetchPageLoadTimeFromGoogleAnalytics(pos, fetchNext){
  var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
  $.getJSON(fetchUrl, function(data){
    try{
      console.log('R '+dataset[pos].name+' returned '+data.site.average_page_load_time); 
      dataset[pos].pageLoadTime = parseFloat(data.site.average_page_load_time);
    }catch(error){
      dataset[pos].pageLoadTime = defaultPageLoadTime;        
    }
    updateBubbles(pos, fetchNext);
  });
};

function fetchApdexFromNewRelic(pos, fetchNext){
  var fetchUrl = 'http://localhost:3000/new-relic.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
  $.getJSON(fetchUrl, function(data){
    try{
      console.log('R '+dataset[pos].name+' returned '+data.site.apdex); 
      dataset[pos].apdex = parseFloat(data.site.apdex);
    }catch(error){
      dataset[pos].apdex = defaultApdex;        
    }
    updateBubbles(pos, fetchNext);
  });
};

function updateBubbles(pos, fetchNext){
  updateScales();
  updateAxis();
  svg.selectAll('circle')
     .data(dataset)
     .transition()
     .duration('1000')
     .each('start', function(d, i){
       if(i == 0){
         console.log('A');
       }
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
          fetchNext(pos+1, fetchNext);
        }
      }
     });
}

function updateScales(){
  xScale = d3.scale.linear()
                   .domain([0, d3.max(dataset, function(d) {return d.pageLoadTime;})])
                   .range([padding, w - padding])
                   .clamp(true);

  yScale = d3.scale.linear()
                   .domain([0, d3.max(dataset, function(d) {return d.apdex;})])
                   .range([padding, h - padding])
                   .clamp(true);

  rScale = d3.scale.linear()
                   .domain([0,
                            d3.max(dataset, function(d) {return d.uniqueVisitors;})])
                   .range([minRadius, maxRadius])
                   .clamp(true);
}

function updateAxis(){
  xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .ticks(5)

  xAxisGroup.call(xAxis)
            .attr("transform", "translate(0," + (h - padding) + ")");

  yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(5)

  yAxisGroup.call(yAxis)
            .attr("transform", "translate(" + padding + ",0)");
}

function updateUniqueVisitorsFromGoogleAnalytics(){
  fetchUniqueVisitorsFromGoogleAnalytics(0, fetchUniqueVisitorsFromGoogleAnalytics);
}

function updatePageLoadTimeFromGoogleAnalytics(){
  fetchPageLoadTimeFromGoogleAnalytics(0, fetchPageLoadTimeFromGoogleAnalytics);
}

function updateApdexFromNewRelic(){
  fetchApdexFromNewRelic(0, fetchApdexFromNewRelic)
}

$(function(){
  $.each(sites, function(key, value){
    dataset.push({'name' : value, 'uniqueVisitors' : startRadius, 'pageLoadTime' : defaultPageLoadTime, 'apdex' : defaultApdex})
  });


  svg = d3.select('body')
          .append('svg')
          .attr('width', w)
          .attr('height', h);

  var circles = svg.selectAll('circle')
                    .data(dataset)
                    .enter() 
                    .append('circle');

  circles.attr('r', startRadius)
         .attr('cx', function(d, i){
           return (i * 200)+startRadius
         }) 
         .attr('cy', 200)
         .attr('fill', 'grey')
         .attr('stroke', 'lightgrey')
         .attr('stroke-width', '5px')

  var text = svg.selectAll('text')
                .data(dataset)
                .enter()
                .append('text')
                .text(function(d, i){
                  return d.name
                })
                .attr('x', function(d, i){
                  return (i * 200)+100
                })
                .attr('y', 200)
                .attr('text-anchor', 'middle')
                .attr('fill', 'white');

  xAxisGroup = svg.append('g');
  yAxisGroup = svg.append('g');

  updateAxis(); 
});
  

