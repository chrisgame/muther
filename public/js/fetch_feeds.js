muther = {};

function parseIntNegForNull(value){
  result = parseInt(value);
  if (isNaN(result)){
    return -1
  }else{
    return result
  };
};

function parseIntZeroForNull(value){
  result = parseInt(value);
  if (isNaN(result)){
    return 0
  }else{
    return result
  };
};

function apdexStatus(cautionValue, criticalValue, value){
  if (value <= criticalValue){
    return 'failure'
  }else if (value <= cautionValue){
    return 'caution'
  }else if (isNaN(value)){
    return 'undefined'
  }else{
    return 'success'
  }
};

function pageLoadStatus(cautionValue, criticalValue, value){
  if (value >= criticalValue){
    return 'failure'
  }else if (value >= cautionValue){
    return 'caution'
  }else if (isNaN(value)){
    return 'undefined'
  }else{
    return 'success'
  }
}

function prettyText(text){
  var with_spaces = text.replace("_", " ");
  var capitalised = with_spaces.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
  return capitalised
}

function update_list(){
  $('#buildList').html('');
  $.each(sites, function(index, value){
    list_item = '<li id="'+value.name+'">'+
      '<span class="unique-visitors counter-analog" data-direction="up" data-interval="0.1" data-format="99999999" data-stop="'+parseIntZeroForNull(value.unique_visitors)+'">'+parseIntZeroForNull(value.unique_visitors)+'</span>'+
      '<h2>'+prettyText(value.name)+'</h2>'+
      '<p class="build-status '+value.build_status+'" data-status="'+value.build_status+'"/>'+
      '<span class="apdex '+apdexStatus(parseFloat(value.apdex_caution_value), parseFloat(value.apdex_critical_value), parseFloat(value.apdex))+'" data-caution-value="'+value.apdex_caution_value+'" data-critical-value="'+value.apdex_critical_value+'">'+value.apdex+'</span>'+
      '<span class="average-page-load-time '+pageLoadStatus(1.5, 2.5, parseFloat(value.average_page_load_time).toFixed(1))+'" data-caution-value="1.5" data-critical-value="2.5">'+parseFloat(value.average_page_load_time).toFixed(1)+'</span>'+
      '<span class="release-count counter-analog" data_direction="up" data-interval="1" data-format="99" data-stop="'+parseIntZeroForNull(value.release_count)+'">0</span>'+
      '</li>'
    $('#buildList').append(list_item);
  });
  console.log('updated list');
}

var sites = [];
muther.feeds= {

  init: function(){
    var defObj = $.Deferred();
    $.getJSON('team-city.json', function(data){
      $.each(data, function(key, value){
        sites.push({'name' : key})
      });
      defObj.resolve();
    });
    console.log('initialized');
    return defObj.promise();
  },
  fetch_from_team_city: function(){
    var defObj = $.Deferred();
    $.getJSON('team-city.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.build_status = value.build_status};});
      });
      console.log('finished team city loop')
      defObj.resolve();
    });
    console.log('fetched from team city');
    return defObj.promise();
  },
  fetch_from_new_relic: function(){
    var defObj = $.Deferred();
    $.getJSON('new-relic.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.apdex = value.apdex};});
        $.grep(sites, function(site){if (site.name == key){site.apdex_caution_value = value.caution_value};});
        $.grep(sites, function(site){if (site.name == key){site.apdex_critical_value = value.critical_value};});
      });
      console.log('finished new relic loop')
      defObj.resolve();
    });
    console.log('fetched from new relic');
    return defObj.promise();
  },
  fetch_from_google_analytics: function(){
    var defObj = $.Deferred();
    $.getJSON('google-analytics.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.unique_visitors = value.unique_visitors};});
        $.grep(sites, function(site){if (site.name == key){site.average_page_load_time = value.average_page_load_time};});
      });
      console.log('finished google analytics loop')
      defObj.resolve();
    });
    console.log('fetched from google analytics');
    return defObj.promise();
  },
  fetch_from_heroku: function(){
    var defObj = $.Deferred();
    $.getJSON('heroku.json', function(data){
      $.each(data, function(key, value){
        $.grep(sites, function(site){if (site.name == key){site.release_count = value.release_count};});
      });
      console.log('finished heroku loop')
      defObj.resolve();
    });
    console.log('fetched from heroku');
    return defObj.promise();
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
        muther.feeds.sort();
        update_list()
        $('.unique-visitors, .release-count').counter();
      })
    })
});(jQuery);

