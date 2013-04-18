muther = {};

var sites = []

muther.feeds= {
  sites: function(){
    $.getJSON('http://localhost:3000/config.json', function(data){
      $.each(data, function(key, value){
        sites.push(key)
      });
    });
  },
};

