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
  collide: function(node){
    var r = node.r,
        nx1 = node.x - r,
        nx2 = node.x + r,
        ny1 = node.y - r,
        ny2 = node.y + r;

    return function(quad, x1, y1, x2, y2){
      if (quad.point && (quad.point !== node) && quad.point && node){
        var x = node.x - quad.point.x,
	    y = node.y - quad.point.y,
	    distance = Math.sqrt(x * x + y * y),
	    minDistance = node.r + quad.point.r;
	    if (node.name == 'help'){
	      console.log('node name '+node.name+' quad name '+quad.point.name+' distance '+distance+' minDistance '+minDistance)
	    }
	if (distance < minDistance) {
          var newNodeX = (node.r + quad.point.r + quad.point.x)/2,
	      newNodeY = (node.r + quad.point.r + quad.point.x)/2;
	  if (node.name == 'help'){
	    console.log('Moving '+node.name+' x '+(node.x - newNodeX)+' y '+(node.y - newNodeY));
	  }
	  node.x = newNodeX; 
	  node.y = newNodeY; 

	  var newQuadPointX = (quad.point.r + node.r + node.x)/2,
	      newQuadPointY = (quad.point.r + node.r + node.y)/2;
	  if (node.name == 'help'){
	    console.log('Moving '+quad.point.name+' x '+(newQuadPointX - quad.point.x)+' y '+(newQuadPointY - quad.point.y));
          }	  
	  quad.point.x = newQuadPointX;
	  quad.point.y = newQuadPointY;
	}	
      }
      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
    };    
  },
  updateCollisions: function(){
    var q = d3.geom.quadtree(dataset.nodes),
        i = 0,
        n = dataset.nodes.length;

    while (++i < n) q.visit(bubbles.collide(dataset.nodes[i]));
  },
  updateNode: function(node){
    node.r = rScale(node.uniqueVisitors);
    node.x = xScale(node.pageLoadTime);
    node.y = yScale(node.apdex);
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
  

