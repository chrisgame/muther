var timePoints = {
  currentDateTime: function(){
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

  oneHourAgo: function(){
    oneHourAgo = timePoints.currentDateTime();
    oneHourAgo.setHours(timePoints.currentDateTime().getHours()-1);
    console.log('One hour ago '+oneHourAgo)
    return oneHourAgo
  },

  startOfToday: function(){
    startOfToday = timePoints.currentDateTime();
    startOfToday.setHours(0);
    startOfToday.setMinutes(0);
    startOfToday.setSeconds(0);
    console.log('Start of today '+startOfToday)
    return startOfToday
  },

  endOfToday: function(){
    endOfToday = timePoints.currentDateTime();
    endOfToday.setHours(23);
    endOfToday.setMinutes(59);
    endOfToday.setSeconds(59);
    console.log('End of today '+endOfToday)
    return endOfToday
  },

  startOfYesterday: function(){
    startOfYesterday = timePoints.currentDateTime();
    startOfYesterday.setDate(startOfYesterday.getDate()-1);
    startOfYesterday.setHours(0);
    startOfYesterday.setMinutes(0);
    startOfYesterday.setSeconds(0);
    console.log('Start of yesterday '+startOfYesterday)
    return startOfYesterday
  },

  endOfYesterday: function(){
    endOfYesterday = timePoints.currentDateTime();
    endOfYesterday.setDate(endOfYesterday.getDate()-1);
    endOfYesterday.setHours(23);
    endOfYesterday.setMinutes(59);
    endOfYesterday.setSeconds(59);
    console.log('End of yesterday '+endOfYesterday)
    return endOfYesterday
  }
};
