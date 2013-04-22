var dataset=[]
var startRadius = 100
var minRadius = 9
var maxRadius = 300
var defaultApdex = 0
var defaultPageLoadTime = 0
var defaultBuildStatus = 'unknown'
var svg

var padding = 35;
var w = window.innerWidth - padding;
var h = window.innerHeight - padding;
var xScale;
var yScale;
var xAxis;
var yAxis;
var xAxisGroup;
var yAxisGroup;

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

  deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
  deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
  deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())
  deferedFetch.updateBuildStatusFromTeamCity(dataset);

  window.setInterval(function(){deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())}, 60000);
  window.setInterval(function(){deferedFetch.updateBuildStatusFromTeamCity(dataset)}, 30000);

});
  

