var dataset={nodes:[], links:[]}
var startRadius = 100
var startX = 100
var startY = 100
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

  update: function(){
      bubbles.updateScales();
      bubbles.updateAxis();
      var i = -1,
          n = dataset.nodes.length;


      while (++i < n) {
        dataset.nodes[i].r = rScale(dataset.nodes[i].uniqueVisitors);
        dataset.nodes[i].x = xScale(dataset.nodes[i].pageLoadTime);
        dataset.nodes[i].y = yScale(dataset.nodes[i].apdex);
      }
  }
};
  
$(function(){
  var i = 0;

  while (++i < sites.length){
    dataset.nodes.push({'name': sites[i], 'fixed': false, 'type': 0, 'r': startRadius+i, 'x': startX+i, 'y': startY+i})
  } 

  force = d3.layout.force()
      .gravity(0)
      .charge(0)
      .nodes(dataset.nodes)
      .size([w, h]);
  
  force.start();

  var svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

//  svg.append('svg:rect')
  //    .attr('width', w)
  //    .attr('height', h);

  svg.selectAll('circle')
      .data(dataset.nodes)
      .enter().append('svg:circle')
      .style('fill', 'green')
      .attr('r', function(d) {return d.r - 2});

  force.on('tick', function(e){
      var q = d3.geom.quadtree(dataset.nodes),
	  k = e.alpha * .1,
	  i = 0,
	  n = dataset.nodes.length,
	  o,
	  group = 0;



      while (++i < n) {
        o = dataset.nodes[i];
	if (o.fixed) continue;
	c = dataset.nodes[o.type];
	o.x += (c.x - o.x) * k;
	o.y += (c.y - o.y) * k;
	q.visit(markCollisions(o, o.name));
      }

      i = 0;

      while (++i < n) {
	var collisionList = [],
	    i2 = -1;
        
	while (++i2 < n){
          if (dataset.nodes[i2].collisions == dataset.nodes[i].name || dataset.nodes[i2].name == dataset.nodes[i].name) {
            collisionList.push(dataset.nodes[i2])
	  } 
        }

	if (collisionList.length > 0){
	  collisionList.sort(function(a,b){return a.r > b.r}).reverse()
	  collisionList[0].fixed = true;

	  var i3 = 0;

	  while (++i3 < collisionList.length){
            collisionList[i3].type = collisionList[0].index
            collisionList[i3].fixed = false
	  }
	}
      }

      i = 0;

      while (++i < n) {
        o = dataset.nodes[i];
	if (o.fixed) continue;
	c = dataset.nodes[o.type];
	o.x += (c.x - o.x) * k;
	o.y += (c.y - o.y) * k;
	q.visit(collide(o));
      }

      svg.selectAll('circle')
	 .attr('id', function(d) { return d.name; })
	 .attr('cx', function(d) { return d.x; })
	 .attr('cy', function(d) { return d.y; })
	 .attr('r', function(d) { return d.r; })
	 .style('fill', function(d) { if (d.fixed == true) {return 'blue'} else {return 'green'}});


	function collide(node) {
	    var r = node.r + 16,
		nx1 = node.x - r,
		nx2 = node.x + r,
		ny1 = node.y - r,
		ny2 = node.y + r;
	    return function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== node)) {
		var x = node.x - quad.point.x,
		    y = node.y - quad.point.y,
		    l = Math.sqrt(x * x + y * y),
		    r = node.r + quad.point.r;
		if (l < r) {
		  l = (l - r) / l * .5;
		  node.px += x * l;
		  node.py += y * l;
		}
	      }
	      return x1 > nx2
		  || x2 < nx1
		  || y1 > ny2
		  || y2 < ny1;
	    };
        }

	function markCollisions(node, group) {
	    var r = node.r,
		nx1 = node.x - r,
		nx2 = node.x + r,
		ny1 = node.y - r,
		ny2 = node.y + r;
	    return function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== node)) {
		var x = node.x - quad.point.x,
		    y = node.y - quad.point.y,
		    l = Math.sqrt(x * x + y * y),
		    r = node.r + quad.point.r;
		if (l < r) {
		  node.collisions = group
		  quad.point.collisions = group
		}
	      }
	      return x1 > nx2
		  || x2 < nx1
		  || y1 > ny2
		  || y2 < ny1;
	    };
        }

      force.start();

  });

  
});

$(function(){

        xAxisGroup = d3.select('svg')
	               .append('g')
	               .attr('class', 'axis');

        yAxisGroup = d3.select('svg')
	               .append('g')
	               .attr('class', 'axis') 

	deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday());
	deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday());
	deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime());
//	deferedFetch.updateBuildStatusFromTeamCity(dataset);
});
