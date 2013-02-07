muther = {};

muther.feeds= {
  init: function(){
    $.getJSON('team-city.json', function(data){
      var items = [];
      $.each(data, function(key, value){
        items.push('<li id="'+key+'"><span class="uniqueVisitors"></span><h2>'+key+'</h2><span class="buildStatus"></span><span class="apdex"></span><span class="averagePageLoadTime"></span><span class="releaseCount"></span></li>');
      });
      $('#buildList').append(items.join(''));
    });
  },
  fetch_from_team_city: function(){
    $.getJSON('team-city.json', function(data){
      $.each(data, function(key, value){
        $('#'+key+' .buildStatus').html(value.build_status)
      });
    });
  },
  fetch_from_new_relic: function(){
    $.getJSON('new-relic.json', function(data){
      $.each(data, function(key, value){
        $('#'+key+' .apdex').html(value.apdex)
      });
    });
  },
  fetch_from_google_analytics: function(){
    $.getJSON('google-analytics.json', function(data){
      $.each(data, function(key, value){
        $('#'+key+' .uniqueVisitors').html(value.unique_visitors)
        $('#'+key+' .averagePageLoadTime').html(value.average_page_load_time)
      });
    });
  },
  fetch_from_heroku: function(){
    $.getJSON('heroku.json', function(data){
      $.each(data, function(key, value){
        $('#'+key+' .releaseCount').html(value.release_count)
      });
    });
  },
};

$(function(){
  muther.feeds.init();
  muther.feeds.fetch_from_team_city();
  muther.feeds.fetch_from_new_relic();
  muther.feeds.fetch_from_google_analytics();
  muther.feeds.fetch_from_heroku();
});(jQuery);

