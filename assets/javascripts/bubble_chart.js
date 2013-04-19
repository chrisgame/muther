var dataset=[]
var startRadius = 100
var minRadius = 9
var maxRadius = 300
var defaultApdex = 0
var defaultPageLoadTime = 0
var defaultBuildStatus = 'unknown'
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


function updateBubbles(dataset, startDate, endDate, pos, fetchNext){
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

function updateLabels(){

  svg.selectAll('text')
     .data(dataset)
     .text(function(d, i){
       return formating.prettyText(d.name)
     })
     .attr('x', function(d, i){
       return xScale(d.pageLoadTime);
     }) 
     .attr('y', function(d, i){
       return yScale(d.apdex) - (i*10);
     })
     .attr('text-anchor', 'middle')
     .attr('fill', 'black');
}

$(function(){
  $.each(sites, function(key, value){
    dataset.push({'name' : value, 'uniqueVisitors' : startRadius, 'pageLoadTime' : defaultPageLoadTime, 'apdex' : defaultApdex})
  });


  svg = d3.select('body')
          .append('svg')
          .attr('id', 'monitor')
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

  xAxisGroup = svg.append('g')
                  .attr('class', 'axis');
  yAxisGroup = svg.append('g')
                  .attr('class', 'axis');

  recursiveFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
  recursiveFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
  recursiveFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())
  recursiveFetch.updateBuildStatusFromTeamCity(dataset);

  window.setInterval(function(){recursiveFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){recursiveFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){recursiveFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())}, 60000);
  window.setInterval(function(){recursiveFetch.updateBuildStatusFromTeamCity(dataset)}, 30000);

});
  

