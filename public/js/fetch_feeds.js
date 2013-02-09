muther = {};

function parseIntNegForNull(value){
  result = parseInt(value);
  if (isNaN(result)){
    return -1
  }else{
    return result
  };
};

function update_list(){
  $('#buildList').html('');
  $.each(sites, function(index, value){
    $('#buildList').append('<li id="'+value.name+'"><span class="uniqueVisitors">'+value.unique_visitors+'</span><h2>'+value.name+'</h2><span class="buildStatus">'+value.build_status+'</span><span class="apdex">'+value.apdex+'</span><span class="averagePageLoadTime">'+value.average_page_load_time+'</span><span class="releaseCount">'+value.release_count+'</span></li>');
  });
  console.log('updated list');
}

var sites = [];
muther.feeds= {

  init: function(){
    $.getJSON('team-city.json', function(data){
      $.each(data, function(key, value){
        sites.push({'name' : key})
      });
    });
    console.log('initialized');
  },
  fetch_from_team_city: function(){
    $.getJSON('team-city.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.build_status = value.build_status};});
      });
    });
    console.log('fetched from team city');
  },
  fetch_from_new_relic: function(){
    $.getJSON('new-relic.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.apdex = value.apdex};});
      });
    });
    console.log('fetched from new relic');
  },
  fetch_from_google_analytics: function(){
    $.getJSON('google-analytics.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.unique_visitors = value.unique_visitors};});
        $.grep(sites, function(site){if (site.name == key){site.average_page_load_time = value.average_page_load_time};});
        muther.feeds.sort();
      });
    });
    console.log('fetched from google analytics');
  },
  fetch_from_heroku: function(){
    $.getJSON('heroku.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.release_count = value.release_count};});
      });
    });
    console.log('fetched from heroku');
  },
  sort: function(){
    sites.sort(function(a,b) { return parseIntNegForNull(b.unique_visitors) - parseIntNegForNull(a.unique_visitors)});
    update_list();
    console.log('sorted sites');
  },
};

$(function(){
  $.when(muther.feeds.init())
    .done(function(){
      $.when(
        muther.feeds.fetch_from_team_city()
       ,muther.feeds.fetch_from_new_relic()
       ,muther.feeds.fetch_from_google_analytics()
       ,muther.feeds.fetch_from_heroku()
      ).done(function(){
        update_list()
      })
    })
});(jQuery);

