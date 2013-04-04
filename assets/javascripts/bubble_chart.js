var dataset=[]
var defaultRadius = 100
var noGoogleAnalyticsRadius = 9
var svg

function fetchFromGoogleAnalytics(pos){
  var fetchUrl = 'http://localhost:3000/google-analytics.json?site='+dataset[pos].name+'&startdate=2013-01-31T00:00&enddate=2013-02-01T00:00';
  $.getJSON(fetchUrl, function(data){
    try{
      console.log('R '+dataset[pos].name+' returned '+data.site.unique_visitors); 
      dataset[pos].uniqueVisitors = data.site.unique_visitors;
    }catch(error){
      dataset[pos].uniqueVisitors = noGoogleAnalyticsRadius;        
    }
    updateBubbles(pos);
  });
};

function updateBubbles(pos){
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
       return d.uniqueVisitors / 500
     })
     .attr('cx', function(d, i){
       return (i * 200) + (d.uniqueVisitors / 500)
     }) 
     .attr('cy', 200)
     .each('end', function(d, i){
      if(i == dataset.length-1){
        console.log('F');
        if(pos < dataset.length-1){
          fetchFromGoogleAnalytics(pos+1);
        }
      }
     });  
}

function updateDataFromGoogleAnalytics(){
  fetchFromGoogleAnalytics(0)
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
  

