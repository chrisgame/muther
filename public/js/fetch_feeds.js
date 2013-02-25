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
      '<span class="unique-visitors counter-analog" data-direction="up" data-interval="0.1" data-format="999999" data-stop="'+parseIntZeroForNull(value.unique_visitors)+'">'+parseIntZeroForNull(value.unique_visitors)+'</span>'+
      '<h2>'+prettyText(value.name)+'</h2>'+
      '<p class="build-status '+value.build_status+'" data-status="'+value.build_status+'"/>'+
      '<img class="trowel-icon" src="/images/trowel.png"/>'+
      '<p class="apdex '+apdexStatus(parseFloat(value.apdex_caution_value), parseFloat(value.apdex_critical_value), parseFloat(value.apdex))+'" data-caution-value="'+value.apdex_caution_value+'" data-critical-value="'+value.apdex_critical_value+'" data-value="'+value.apdex+'"></p>'+
      '<img class="new-relic-icon" src="/images/newRelic.png"/>'+
      '<p class="average-page-load-time '+pageLoadStatus(1.5, 2.5, parseFloat(value.average_page_load_time).toFixed(1))+'" data-caution-value="1.5" data-critical-value="2.5" data-value="'+parseFloat(value.average_page_load_time).toFixed(1)+'"></p>'+
      '<img class="downloads-icon" src="/images/downloads.png"/>'+
      '<span class="release-count counter-analog" data_direction="up" data-interval="10" data-format="99" data-stop="'+parseIntZeroForNull(value.release_count)+'">0</span>'+
      '</li>'
    $('#buildList').append(list_item);
  });
  console.log('updated list');
}

function update_display(){
  update_list()
  $('.unique-visitors, .release-count').counter();
  $('.release-count').counter('play');
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
  fetch_from_new_relic: function(startDate, endDate){
    console.log('fetching from new relic feed for the period '+startDate+' to '+endDate);
    var defObj = $.Deferred();
    $.getJSON('new-relic.json?startdate='+muther.feeds.format_date(startDate)+'&enddate='+muther.feeds.format_date(endDate), function(data){
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
  fetch_from_google_analytics: function(startDate, endDate){
    console.log('fetching from google analytics feed for the period '+startDate+' to '+endDate);
    var defObj = $.Deferred();
    $.getJSON('google-analytics.json?startdate='+muther.feeds.format_date(startDate)+'&enddate='+muther.feeds.format_date(endDate), function(data){
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
  fetch_from_heroku: function(startDate, endDate){
    console.log('fetching from the heroku feed for the period '+startDate+' to '+endDate);
    var defObj = $.Deferred();
    $.getJSON('heroku.json?startdate='+muther.feeds.format_date(startDate)+'&enddate='+muther.feeds.format_date(endDate), function(data){
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
  current_date_time: function(){
    if (app_mode == 'offline'){
      date = new Date;
      date.setYear('2013');
      date.setMonth('01');
      date.setDate('01');
      date.setHours('00');
      date.setMinutes('00');
      date.setSeconds('00')
      return date
    }else{
      return new Date;
    };
  },
  format_date: function(date){
    month = date.getMonth()+1;
    return date.getFullYear()+'-'+month+'-'+date.getDate()+'T'+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  },
};

$(function(){
  var current_date_time = muther.feeds.current_date_time();
  var one_hour_ago = muther.feeds.current_date_time();
  one_hour_ago.setHours(current_date_time.getHours()-1);
  console.log('One hour ago '+one_hour_ago)
  
  var start_of_today = muther.feeds.current_date_time();
  start_of_today.setHours(0);
  start_of_today.setMinutes(0);
  start_of_today.setSeconds(0);
  console.log('Start of today '+start_of_today)
  
  var end_of_today = muther.feeds.current_date_time();
  end_of_today.setHours(23);
  end_of_today.setMinutes(59);
  end_of_today.setSeconds(59);
  console.log('End of today '+end_of_today)
  
  var start_of_yesterday = muther.feeds.current_date_time();
  start_of_yesterday.setDate(start_of_yesterday.getDate()-1);
  start_of_yesterday.setHours(0);
  start_of_yesterday.setMinutes(0);
  start_of_yesterday.setSeconds(0);
  console.log('Start of yesterday '+start_of_yesterday)
  
  var end_of_yesterday = muther.feeds.current_date_time();
  end_of_yesterday.setDate(end_of_yesterday.getDate()-1);
  end_of_yesterday.setHours(23);
  end_of_yesterday.setMinutes(59);
  end_of_yesterday.setSeconds(59);
  console.log('End of yesterday '+end_of_yesterday)

  $.when(muther.feeds.init())
    .done(function(){
      $.when(
        muther.feeds.fetch_from_team_city()
       ,muther.feeds.fetch_from_new_relic(one_hour_ago, current_date_time)
       ,muther.feeds.fetch_from_google_analytics(start_of_yesterday, end_of_yesterday)
       ,muther.feeds.fetch_from_heroku(start_of_today, end_of_today)
      ).done(function(){
        muther.feeds.sort();
        update_display();
      })
    })

  function fetch_from_team_city_and_update_display(){
    $.when(muther.feeds.fetch_from_team_city()).done(function(){
      muther.feeds.sort();
      update_display();
      console.log('Fetched from team city')
    });
  }
  
  function fetch_from_new_relic_and_update_display(){
    $.when(muther.feeds.fetch_from_new_relic(one_hour_ago, current_date_time)).done(function(){
      muther.feeds.sort();
      update_display();
      console.log('Fetched from new relic')
    });
  }

  function fetch_from_google_analytics_and_update_display(){
    $.when(muther.feeds.fetch_from_google_analytics(start_of_yesterday, end_of_yesterday)).done(function(){
      muther.feeds.sort();
      update_display();
      console.log('Fetched from google analytics')
    });
  }
  
  function fetch_from_heroku_and_update_display(){
    $.when(muther.feeds.fetch_from_heroku(start_of_today, end_of_today)).done(function(){
      muther.feeds.sort();
      update_display();
      console.log('Fetched from heroku')
    });
  }

  window.setInterval(fetch_from_team_city_and_update_display(), 30000);
  window.setInterval(fetch_from_new_relic_and_update_display(), 60000);
  window.setInterval(fetch_from_google_anaylitics_and_update_display(), 86400000);
  window.setInterval(fetch_from_heroku_and_update_display(), 86400000);
});(jQuery);

