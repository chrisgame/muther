var formating = {
  prettyText: function (text){
    var with_spaces = text.replace("_", " ");
    var capitalised = with_spaces.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
    return capitalised
  },

  urlDate: function(date){
    month = date.getMonth()+1;
    return date.getFullYear()+'-'+month+'-'+date.getDate()+'T'+date.getHours()+':'+date.getMinutes()+':'+date.getSeconds();
  }
}
