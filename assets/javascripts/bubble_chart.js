var dataset={nodes:[], links:[]}
var startRadius = 100
var startX = 100
var startY = 100
var minRadius = 5
var maxRadius = 250
var minFontSize = 14
var maxFontSize = 50
var defaultApdex = 0
var defaultPageLoadTime = 0
var defaultBuildStatus = 'unknown'
var svg

var padding = 35;
var w = window.innerWidth - 15;
var h = window.innerHeight - 25;
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

    fScale = d3.scale.linear()
                     .domain([0, d3.max(dataset.nodes, function(d) {return d.r;})])
                     .range([minFontSize, maxFontSize])
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

  detectCollisionsAndGroup: function(){

      console.log('Starting to update types');
      var defObj = $.Deferred();
      
      $.each(dataset.nodes, function(i, node1){  
	    
            $.each(dataset.nodes, function(i2, node2){
		 var x = node1.x - node2.x,
		     y = node1.y - node2.y,
		     l = Math.sqrt(x * x + y * y),
		     r = node1.r + node2.r;

		 if (l < r) {
		   node2.collisions = node1.name;
		 }
	    });
	}); 

      $.each(dataset.nodes, function(i, node){
        var collisionList = _.where(dataset.nodes,{collisions: dataset.nodes[i].name});
        
	      if (collisionList.length > 0){
		collisionList.sort(function(a,b){return a.r > b.r}).reverse();
		collisionList[0].type = collisionList[0].index;
		collisionList[0].fixed = true;

	        var i3 = 0;

		while (++i3 < collisionList.length){
		  collisionList[i3].type = collisionList[0].index;
	          collisionList[i3].fixed = false;
		}
	      }

	if (i = dataset.nodes.length){
	  console.log('Finished updating types');
	  defObj.resolve();
	}

      });

      return defObj.promise();

  },

  setNodes: function(){
    console.log('Starting to set nodes');

    var defObj = $.Deferred();

    $.each(dataset.nodes, function(i, node){
      node.r = rScale(node.uniqueVisitors);
      node.x = xScale(node.pageLoadTime);
      node.y = yScale(node.apdex);
    });


    if (i == dataset.nodes.length -1){
      console.log('Finished setting nodes');
      defObj.resolved();
    }

    return defObj.resolve();
  },

  resetFreeNodes: function(){
    console.log('Starting to reset free nodes');

    var defObj = $.Deferred();
    var freeNodes = _.where(dataset.nodes,{fixed: false});

    $.each(freeNodes, function(i, node){
      console.log('Resetting free node '+node.name); 
     // node.x = xScale(node.pageLoadTime);
     node.x = (window.innerWidth/2) - padding;
     node.px = (window.innerWidth/2) - padding;
     node.y = 0;
    //  node.y = yScale(node.apdex);
     node.py = 0;      

      if (i == freeNodes.length -1){
	console.log('Finished resetting free nodes');
	defObj.resolve();
      }
    });

    return defObj.promise();
  },

  resetFixedNodes: function(){
	  //fixed nodes not moving
	  console.log('Starting to reset fixed nodes');

	  var defObj = $.Deferred();
	  var fixedNodes = _.where(dataset.nodes,{fixed: true});

	  $.each(fixedNodes, function(i, node){
		  console.log('Resetting fixed node '+node.name);
		  node.r = rScale(node.uniqueVisitors);
		  node.x = xScale(node.pageLoadTime);
		  node.y = yScale(node.apdex);
      node.px = node.x;
      node.py = node.y;

		  if (i == fixedNodes.length -1){

    svg.selectAll('circle')
		  .transition()
		  .duration('1000')
		  .attr('id', function(d) { return d.name; })
		  .attr('cx', function(d) { return d.x; })
		  .attr('cy', function(d) { return d.y; })
		  .attr('r', function(d) { return d.r; })
		  .attr('class', function(d) { if (d.buildStatus == 'success') {return 'green-build'} 
			  else if (d.buildStatus == 'failure') {return 'red-build'}
			  else {return 'grey-build'}})

	  svg.selectAll('text')
		  .transition()
		  .duration('1000')
		  .text(function(d){ return formating.prettyText(d.name); })
		  .attr('x', function(d){ return d.x; }) 
		  .attr('y', function(d){ return d.y; })
		  .attr('class', function(d){ return d.r<100?'small':'large'})
		  .attr('font-size', function(d){ return fScale(d.r)});

	  console.log('Finished resetting fixed nodes');
	  defObj.resolve();
		  }
	  });

	  return defObj.promise();
  },

  resumeForce: function(){
      console.log('Starting force');

      force.start()
  },

  update: function(){
      console.log('Stopping force');

      force.stop();

      $.when(bubbles.setNodes())
       .then(bubbles.detectCollisionsAndGroup())
       .then(bubbles.resetFreeNodes())
       .then(bubbles.resetFixedNodes())
       .then(bubbles.resumeForce())
       .then(bubbles.updateScales())
       .then(bubbles.updateAxis());
  },

  debugCoordinates: function(){
    $('#debug-coordinates').remove();

    $('body').append('<div id="debug-coordinates"> </div>');

    var table = $('<table></table>');
	  table.append('<tr><th>Name</th><th>Collisions</th><th>dataset x</th><th>px</th><th>cx</th><th>dataset y</th><th>py</th><th>cy</th><th>dataset r</th><th>svg r</th><th>Fixed</th></tr>');

    $.each(dataset.nodes, function(i, node){
      table.append('<tr><td>'+node.name+'</td><td>'+node.collisions+'</td><td>'+node.x+'</td><td>'+node.px+'</td><td>'+$('#'+node.name).attr('cx')+'</td><td>'+node.y+'</td><td>'+node.py+'</td><td>'+$('#'+node.name).attr('cy')+'</td><td>'+node.r+'</td><td>'+$('#'+node.name).attr('r')+'</td><td>'+node.fixed+'</td><tr>');
    });

    $('#debug-coordinates').append(table);
  },

  debugData: function(){
    $('#debug-data').remove();

    $('body').append('<div id="debug-data"> </div>');

    var table = $('<table></table>');
	  table.append('<tr><th>Name</th><th>apdex</th><th>cy</th><th>page load time</th><th>cx</th><th>unique visitors</th><th>svg r<th>build status</th><th>Fixed<th></tr>');

    $.each(dataset.nodes, function(i, node){
      table.append('<tr><td>'+node.name+'</td><td>'+node.apdex+'</td><td>'+$('#'+node.name).attr('cy')+'</td><td>'+node.pageLoadTime+'</td><td>'+$('#'+node.name).attr('cx')+'</td><td>'+node.uniqueVisitors+'</td><td>'+node.r+'</td><td>'+node.buildStatus+'</td><td>'+node.fixed+'</td><tr>');
    });

    $('#debug-data').append(table);
  }
};
  
$(function(){
  var i = 0;

  while (++i < sites.length){
    dataset.nodes.push({'name': sites[i], 'fixed': false, 'type': 0, 'r': startRadius+i, 'x': startX+i, 'y': startY+i})
  } 

  force = d3.layout.force()
      .gravity(0)
      .charge(1)
      .nodes(dataset.nodes)
      .size([w, h]);
  
  svg = d3.select('#viz')
      .append('svg')
      .attr('width', w)
      .attr('height', h)

  svg.selectAll('circle')
      .data(dataset.nodes)
      .enter().append('svg:circle')
      .attr('class', 'grey-build')
      .attr('r', function(d) {return d.r - 2});

  svg.selectAll('text')
      .data(dataset.nodes)
      .enter().append('svg:text')
      .text(function(d){ return formating.prettyText(d.name); })
      .attr('x', function(d){ return d.x; }) 
      .attr('y', function(d){ return d.y; })
      .attr('class', function(d){ return d.r<100?'small':'large'});

  force.on('tick', function(e){

      console.log('Tick'); 

      var q = d3.geom.quadtree(dataset.nodes),
	  k = e.alpha * .09,
	  i = 0,
	  n = dataset.nodes.length,
	  o,
	  group = 0;

      i = 0;

      $.each(dataset.nodes, function(i, o){
	      if (o.fixed) {
		      console.log('NOT applying any force to '+o.name);
	      } else {
		      console.log('Applying force to '+o.name);
		      c = dataset.nodes[o.type];
		      o.x += (c.x - o.x) * k;
		      o.y += (c.y - o.y) * k;
		      q.visit(collide(o));
	      }
      });


      svg.selectAll('circle')
	 .attr('id', function(d) { return d.name; })
	 .attr('cx', function(d) { return d.x; })
	 .attr('cy', function(d) { return d.y; })
	 .attr('r', function(d) { return d.r; })
	 .attr('class', function(d) { if (d.buildStatus == 'success') {return 'green-build'} 
		                      else if (d.buildStatus == 'failure') {return 'red-build'}
	                              else {return 'grey-build'}})
	 .call(force.drag);

      svg.selectAll('text')
        .text(function(d){ return formating.prettyText(d.name); })
	.attr('x', function(d){ return d.x; }) 
	.attr('y', function(d){ return d.y; })
        .attr('class', function(d){ return d.r<100?'small':'large'})
	.attr('font-size', function(d){ return fScale(d.r)});

      bubbles.updateAxis();
      if (urlParams.debug == 'coordinates'){
        bubbles.debugCoordinates();
      } else if (urlParams.debug == 'data'){
        bubbles.debugData();
      }

	function collide(node) {

	    var r = node.r + maxRadius,
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
		  quad.point.px = quad.point.px;
		  quad.point.py = quad.point.py;
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

$(function(){

        xAxisGroup = d3.select('svg')
	               .append('g')
	               .attr('class', 'axis');

        yAxisGroup = d3.select('svg')
	               .append('g')
	               .attr('class', 'axis') 

	bubbles.updateScales();

	$.when(deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday()))
	.then(deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday()))
	.then(deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime()))
//	.then(deferedFetch.updateBuildStatusFromTeamCity(dataset));


	window.setInterval(function(){
	  $.when(deferedFetch.updateUniqueVisitorsFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday()))
	  .then(deferedFetch.updatePageLoadTimeFromGoogleAnalytics(dataset, timePoints.startOfYesterday(), timePoints.endOfYesterday()));
	}, 86400000);

       window.setInterval(function(){
	  $.when(deferedFetch.updateApdexFromNewRelic(dataset, timePoints.oneHourAgo(), timePoints.currentDateTime()))
//	  .then(deferedFetch.updateBuildStatusFromTeamCity(dataset));
       }, 60000);
})
