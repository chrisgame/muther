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
  }
};
  
$(function(){
  var nodes = d3.range(5).map(function(i) {
    return {type: Math.random() * 5 | 0,
	    r: 30,
            fixed: true,
            type: i,
            x: (i+1) * (w / 6),
            y: h / 2,
            name: 'fixed '+i};
  }),
  color = d3.scale.category10();

  var i = 0;

  while (++i < sites.length){
    nodes.push({'name': sites[i], 'fixed': false, 'type': 0, 'r': startRadius+i, 'x': startX+i, 'y': startY+i})
  } 

  var force = d3.layout.force()
      .gravity(0)
      .charge(0)
      .nodes(nodes)
      .size([w, h]);
  
  force.start();

  var svg = d3.select('body')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

  svg.append('svg:rect')
      .attr('width', w)
      .attr('height', h);

  svg.selectAll('circle')
      .data(nodes)
      .enter().append('svg:circle')
      .attr('r', function(d) {return d.r - 2})
      .style('fill', function(d, i) {return color(d.type);});

  force.on('tick', function(e){
      var q = d3.geom.quadtree(nodes),
	  k = e.alpha * .1,
	  i = 0,
	  n = nodes.length,
	  o,
	  group = 0;

      while (++i < n) {
        o = nodes[i];
	if (o.fixed) continue;
	c = nodes[o.type];
	o.x += (c.x - o.x) * k;
	o.y += (c.y - o.y) * k;
	q.visit(markCollisions(o, o.name));
      }

      i = 0;

      while (++i < n) {
	var collisionList = [],
	    i2 = -1;
        
	while (++i2 < n){
          if (nodes[i2].collisions == nodes[i].name || nodes[i2].name == nodes[i].name) {
            collisionList.push(nodes[i2])
	  } 
        }

	if (collisionList.length > 0){
	  collisionList.sort(function(a,b){a.radius - b.radius}).reverse()
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
        o = nodes[i];
	if (o.fixed) continue;
	c = nodes[o.type];
	o.x += (c.x - o.x) * k;
	o.y += (c.y - o.y) * k;
	q.visit(collide(o));
      }

      svg.selectAll('circle')
	 .attr('cx', function(d) { return d.x; })
	 .attr('cy', function(d) { return d.y; });


	var p0;
	svg.on('mousemove', function() {
	  var p1 = d3.svg.mouse(this),
	      node = {r:Math.random() * 12 + 4, type: Math.random() * 5 | 0, x: p1[0], y: p1[1], px: (p0 || (p0 = p1))[0], py: p0[1]};

	  p0 = p1;

	  svg.append('svg:circle')
	      .data([node])
	      .attr('cx', function(d) { return d.x; })
	      .attr('cy', function(d) { return d.y; })
	      .attr('r', function(d) { return d.r - 2; })
	      .style('fill', function(d) { return color(d.type);})
	      .transition()
		.delay(3000)
		.attr('r', 1e-6)
		.each('end', function() { nodes.splice(6, 1); })
		.remove();

	   nodes.push(node);
	   force.resume();
	});

	function collide(node) {
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
  });
});
