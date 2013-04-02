var dataset=[]
var defaultRadius = 100
var svg

function updateDataFromGoogleAnalytics(){
  $.each(dataset, function(i, value){
    var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+value.name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
    $.getJSON(fetchUrl, function(data){
      try{ 
        dataset[i].uniqueVisitors = data.site.unique_visitors;  
      }catch(error){
        dataset[i].uniqueVisitors = 9;        
      }
    })
    svg.selectAll('circle')
       .data(dataset)
       .transition()
       .duration('1000')
       .attr('r', function(d, i){
         return d.uniqueVisitors / 500
       })
       .attr('cx', function(d, i){
         return (i * 200) + (d.uniqueVisitors / 500)
       }) 
       .attr('cy', 200);
  });
}

$(function(){
  $.each(sites, function(key, value){
    dataset.push({'name' : value, 'uniqueVisitors' : defaultRadius, 'pageLoadSpeed' : '', 'apdex' : ''})
  });

  svg = d3.select('body')
          .append('svg')
          .attr('width', '2048')
          .attr('height', '1024');

  var circles = svg.selectAll('circle')
                    .data(dataset)
                    .enter() 
                    .append('circle');

  circles.attr('r', defaultRadius)
         .attr('cx', function(d, i){
           return (i * 200)+defaultRadius
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

  
});
  

