var dataset={nodes:[], links:[]}
var startRadius = 100
var minRadius = 9
var maxRadius = 300
var defaultApdex = 0
var defaultPageLoadTime = 0
var defaultBuildStatus = 'unknown'
var svg

var padding = 35;
var w = window.innerWidth;
var h = window.innerHeight - 5;
var xScale;
var yScale;
var xAxis;
var yAxis;
var xAxisGroup;
var yAxisGroup;
var force;
var nodes;
var text;

var bubbles = {
  updateScales: function(){
    xScale = d3.scale.linear()
                     .domain([0, d3.max(dataset.nodes, function(d) {return d.pageLoadTime;})])
                     .range([padding, w - padding])
                     .clamp(true);

    yScale = d3.scale.linear()
                     .domain([0, d3.max(dataset.nodes, function(d) {return d.apdex;})])
                     .range([padding, h - padding])
                     .clamp(true);

    rScale = d3.scale.linear()
                      .domain([0, d3.max(dataset.nodes, function(d) {return d.uniqueVisitors;})])
                      .range([minRadius, maxRadius])
                      .clamp(true);
  },
  updateAxis: function(){
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
  },
  updateLabels: function(){

    text.transition()
        .duration('1000')
        .text(function(d, i){
	  return formating.prettyText(d.name)
	})
	.attr('x', function(d, i){
	  return d.x;
	}) 
	.attr('y', function(d, i){
	  return d.y;
	})
	.attr('fill', 'black');
  },
  updateForce: function(){

    force.nodes(dataset.nodes)
	 .each()
	 .charge(function(d){
	   0 - (rScale(d.uniqueVisitors) * 1.5)
	 })
         .gravity([0.0000000000000015])

  },
  overlap: function(node, otherNode){
    if (node.name == otherNode.name){return};
    debugger;
    var r = node.r,
	lowerXLimit = node.x - r,
	upperXLimit = node.x + r,
	lowerYLimit = node.y - y,
	upperYLimit = node.y + y;

    return otherNode.x > 

  },
  overlappingNodes: function(node){
    var i = 0,
        n = dataset.nodes.length,
	result = [];

    while (++i < n ){
      var otherNode = dataset.nodes[i];
      if (bubbles.overlap(node, otherNode)){
        result.push(otherNode);
      }	
    }
  },
  getFoci: function(node){
    var i = 0, 
        overlappingNodes = bubbles.overlappingNodes(node);
    while (++i < overlappingNodes.length){
      if (node.r > overlappingNode[i].r){
        return  true;
      }
      else{ 
        return overlapingNodes.sort(function(a, b){a.r - b.r})[0]  
      }
    }
  },
  updateNode: function(node){
    node.r = rScale(node.uniqueVisitors);
    node.x = xScale(node.pageLoadTime);
    node.y = yScale(node.apdex);
    node.foci = bubbles.getFoci(node);
  },
  updateDataset: function(){
    var i = 0,
        n = dataset.nodes.length;

    while (++i < n ) bubbles.updateNode(dataset.nodes[i]);
  },
  update: function(){
  
    force.stop 
    bubbles.updateScales();
    bubbles.updateAxis();
    bubbles.updateDataset();

    svg.selectAll('circle')
       .data(dataset.nodes)
       .transition()
       .duration('1000')
       .each('start', function(d, i){
         if(i == 0){
           console.log('A');
	 }
       })
       .attr('data-name', function(d, i){
         return d.name
       })
       .attr('class', function(d, i){
         return 'build-status-'+d.buildStatus
       })
       .attr('r', function(d, i){
         return d.r
       })
       .attr('cx', function(d, i){
	 return d.x
       }) 
       .attr('cy', function(d, i){
	 return d.y
       })
       .each('end', function(d, i){
         bubbles.updateLabels();

         if(i == dataset.length-1){
	   console.log('F');
	   if(pos < dataset.length-1){
	     console.log('F All Anim')
           }
         }
       });


  },
  initialize: function(){

    force = d3.layout.force()
              .nodes(dataset.nodes)
              .charge([-500])
	      .gravity([0.03])
	      .size([w, h])
	      .start();

    nodes.attr('r', startRadius)
         .attr('cx', function(d, i){
           return (i * 200)+startRadius
         }) 
         .attr('cy', 200)
         .attr('fill', 'grey')
         .attr('stroke', 'lightgrey')
         .attr('stroke-width', '5px')
	 .call(force.drag);
      
    text = svg.selectAll('text')
              .data(dataset.nodes)
              .enter()
              .append('text')
              .text(function(d, i){
                return d.name
              })
              .attr('x', function(d, i){
                return d.x;
              })
              .attr('y', function(d, i){
	        return d.y;
              })
              .attr('text-anchor', 'middle')
              .attr('fill', 'white');

    force.on('tick', function(){
      nodes.attr('cx', function(d){return d.x;})
           .attr('cy', function(d){return d.y;})
 
      text.text(function(d, i){
            return formating.prettyText(d.name)
          })
	    .attr('x', function(d, i){
            return d.x;
          }) 
          .attr('y', function(d, i){
	    return d.y;
          })
    });
  }  
};
$(function(){
  $.each(sites, function(key, value){
    dataset.nodes.push({'name' : value, 'uniqueVisitors' : startRadius, 'pageLoadTime' : defaultPageLoadTime, 'apdex' : defaultApdex})
  });


  svg = d3.select('body')
          .append('svg')
          .attr('id', 'monitor')
          .attr('width', w)
          .attr('height', h);

  nodes = svg.selectAll('circle')
	     .data(dataset.nodes)
	     .enter() 
	     .append('circle');

  force = d3.layout.force()
	           .nodes(dataset.nodes)


  xAxisGroup = svg.append('g')
                  .attr('class', 'axis');
  yAxisGroup = svg.append('g')
                  .attr('class', 'axis');


  bubbles.initialize();

  window.setTimeout(function(){
	  
	  deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
	  deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())
	  deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())
	  deferedFetch.updateBuildStatusFromTeamCity(dataset);
  }, 3000);

  window.setInterval(function(){deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday())}, 86400000);
  window.setInterval(function(){deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime())}, 60000);
  window.setInterval(function(){deferedFetch.updateBuildStatusFromTeamCity(dataset)}, 30000);

});
  

