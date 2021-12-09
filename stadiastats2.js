var myTable = "";
var myName = "";
var myDiv = "";
var myMetric = "";
var myYAxis = "";
var currentDate = new Date;
var lastMonday = new Date;
var startMonth = new Date;
var globalMax = 10000;
lastMonday.setDate(currentDate.getDate() - ((currentDate.getDay() + 6) % 7));
startMonth.setDate(1);                  
var lastMondayTS = Math.floor(lastMonday/1000/3600/24)*1000*3600*24;
var startMonthTS = Math.floor(startMonth/1000/3600/24)*1000*3600*24;
console.log('getDate '+currentDate.getDate());
console.log('getDay '+currentDate.getDay());
console.log(-1%7);
console.log('last Monday '+lastMondayTS);
console.log('start month '+startMonthTS);

function changeTable(newTable) {
  var nextURL = "";
  if (myName) {
    nextURL = 'https://stadiastats.jdeslip.com/index2.html?table='+newTable+'&name='+myName+'&derivative='+myDiv;
  } else {
    nextURL = 'https://stadiastats.jdeslip.com/index2.html?table='+newTable+'&derivative='+myDiv;
  }
  window.location = nextURL;
}

function changeDiv(newDiv) {
  var nextURL = "";
  if (myName) {
    nextURL = 'https://stadiastats.jdeslip.com/index2.html?table='+myTable+'&name='+myName+'&derivative='+newDiv;
  } else {
    nextURL = 'https://stadiastats.jdeslip.com/index2.html?table='+myTable+'&derivative='+newDiv;
  }
  window.location = nextURL;  
}

function setPlot() {
  myDate = getUrlParameter('date');
  myTable = getUrlParameter('table');
  myName = getUrlParameter('name'); 
  myDiv = getUrlParameter('derivative');
  
  $('#'+myTable).addClass('active');
  
  if (myDiv == "true") {
    $('#derivative').addClass('active');
    myMetric = "Growth Rate";
    myYAxis = "Growth Rate Per Day";
  } else if (myDiv == "week") {
    $('#week').addClass('active');
    myMetric = "Growth Rate"; 
    myYAxis = "Growth Rate Per Week";
  } else if (myDiv == "month") {
    $('#month').addClass('active');
    myMetric = "Growth Rate";
    myYAxis = "Growth Rate Per Month";
  } else {
    $('#value').addClass('active');
    myMetric = "Growth";
    myYAxis = "Members";
  }

  if (myTable == "combined") {
    updatePlotCombined();
  } else { 
    updatePlot();
  }
}

function updatePlotCombined() {
  
  var myTS = '2021-01-01';
  if (myDate) {
    console.log('Setting new start date '+myDate);
    myTS = myDate;
  }
  var myNames = new Array();
  var myURL_base = "https://jdeslipweb.com/stadiastats/?date="+myTS;
  
  $("#plot-div").html("<center><img src='bounce.gif'><br><br>Plots Not Loading? Try <a href='http://stadiastats.jdeslip.com'>the Non SSL Version</a> while we migrate to our new host.</center>");

  nTotal = 6;
  nComplete = 0;
  
  myNames['reddit'] = 'r/Stadia';
  //myNames['youtubeplatforms'] = 'Stadia';
  myNames['twitterplatforms'] = 'GoogleStadia';
  //myNames['instagram'] = 'googlestadia';
  myNames['facebooklikes'] = 'Stadia'
  myNames['gplay'] = 'Stadia'
  myNames['ios'] = 'Stadia'
  myNames['discord'] = 'Stadia'
  
  var myTitles = new Array();
  myTitles['reddit'] = 'r/Stadia Members';
  //myNames['youtubeplatforms'] = 'Stadia';
  myTitles['twitterplatforms'] = 'GoogleStadia Twitter Followers';
  //myNames['instagram'] = 'googlestadia';
  myTitles['facebooklikes'] = 'Stadia Facebook Likes'
  myTitles['gplay'] = 'Stadia Reviews on Google Play'
  myTitles['ios'] = 'Stadia Reviews on iOS App Store'
  myTitles['discord'] = 'Stadia Discord Members'

  allSeries=new Array();

  for (const [myTableC, myNameC] of Object.entries(myNames)) {
    myURL = myURL_base+"&table="+myTableC;
    myURL = myURL+"&name="+myNameC;
    
    console.log('Starting query for '+myTableC+' '+myNameC+' '+myURL);
    
    $.ajax({url: myURL,dataType: 'json', async: true, cache: false, success: function(result){
      
        console.log('Back from '+myTableC+' '+myNameC);

        var myArray = new Array();
        var minVal = 0;
        var maxVal = parseInt(result[result.length-1]['value']);
        
        for ( var i = 0 ; i < result.length ; i++ ) {
          var ts = new Date(result[i]['date']).getTime();
          var value = parseInt(result[i]['value']);
          if ( i == 0 ) {
            minVal = value;
            maxVal = maxVal - minVal;
            if (myTableC == 'reddit') {
              globalMax = maxVal;
            }
            if (globalMax >= 0 && maxVal < 0) {
              maxVal = -1 * maxVal;
            }
          }
          value = parseInt((value - minVal)*1000000/maxVal);
          myArray.push(new Array(ts,value));
        }
        allSeries.push({ name: myTitles[myTableC], data: myArray, marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      
        console.log('done aggregation for '+myTableC+' '+myNameC);
        
        nComplete = nComplete + 1;
      
        if (nComplete == nTotal) {
          
          console.log('Im about to rescale '+globalMax);
          
          for ( var i = 0 ; i < allSeries.length ; i++ ){
            for ( var j = 0 ; j < allSeries[i]['data'].length ; j++ ) {
              allSeries[i]['data'][j][1] = allSeries[i]['data'][j][1]*globalMax/1000000;
            }
          }
          
          console.log('Im about to create the plot');
          
          $('#plot-div').highcharts('StockChart',{
            chart : {
              zoomType: 'xy'
            },
            exporting : {
              enabled: true,
            },
            title: {
                text: 'Stadia Metrics Over Time (Scaled to r/Stadia Growth)',
                x: -20 //center
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                },
            },
            rangeSelector:{
                enabled:false,
                selected:0
            },
            tooltip: {
                enabled: true,
                formatter: function () {
                   return '<b>' + this.series.name + '</b><br>' + Highcharts.dateFormat('%Y %m %d',this.x) + '<br>' + this.y;
                },
                snap: 0,
            },
            navigator:{
                enabled:true,
            },
            marginBottom: 100,
            marginRight: 5,
            marginLeft: 5,
            legend: {
                enabled: true,
                floating: false,
                align: "left",
                borderWidth: 0,
                layout: "horizontal",
                maxHeight: 120,
                verticalAlign: "bottom",
            },
            plotOptions: {
             series: {
              events: {
                legendItemClick: function(event) {
                    //console.log('legend item clicked');
                  
                    if (!this.visible) {
                      console.log('this is not visible');
                      return true;
                    }
                                  
                    //console.log('passed if statement');

                    var seriesIndex = this.index;
                    var series = this.chart.series;
                  
                    //console.log('this index is '+String(seriesIndex));
                    //console.log('length is '+String(series.length));
                    
                    for (var i = 0; i < series.length; i++) {
                        if (series[i].index != seriesIndex) {
                          //console.log('Turning off series '+String(series[i].index));
                             if (series[i].visible) {
                               series[i].setVisible(false,false); 
                             } else {
                               series[i].setVisible(true,false);
                             }
                        }
                    }
                    this.chart.redraw();
                    return false;
                }
              }
             }
            },
            yAxis: {
                title: {
                    text: myYAxis
                },
                //min : 0,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            credits: {
              enabled: false
            },
            series: allSeries,
          });
          
        }
      
    }});  
  }  
  
}

function updatePlot() {

  var myTitles = new Array();
  var items = ['youtube','tiktokcreators','youtubeplatforms','twitter','twitterplatforms','reddit','instagram','instagramcreators','facebook','facebooklikes','facebookgroups','gplay','gplaydownloads','ios','leaderboards','achievements','discord','discordcreators','misc','miscactivitynew','games','chromeextensions','twitch'];
  
  myTitles['youtube'] = 'YouTube Creator Channel';
  myTitles['tiktokcreators'] = 'Tiktok Creator Channel';
  myTitles['youtubeplatforms'] = 'YouTube Platform Channel';
  myTitles['twitter'] = 'Twitter Stadia Community Member Follower';
  myTitles['twitterplatforms'] = 'Twitter Platform Follower';
  myTitles['reddit'] = 'SubReddit';
  myTitles['instagram'] = 'Instagram Platform Follower'
  myTitles['instagramcreators'] = 'Instragram Creator Follower'
  myTitles['facebook'] = 'Facebook Follows';
  myTitles['facebooklikes'] = 'Facebook Likes';
  myTitles['facebookgroups'] = 'Facebook Group';
  myTitles['twittterplatforms'] = 'Twitter Platform';
  myTitles['gplay'] = 'Google Play Review Count';
  myTitles['gplaydownloads'] = 'Google Play Download Count (Estimated)';
  myTitles['ios'] = 'iOS Review Count';
  myTitles['leaderboards'] = 'Game Leaderboard'
  myTitles['achievements'] = 'Achievement Leaderboard';
  myTitles['discord'] = 'Discord Platform Channel';
  myTitles['discordcreators'] = 'Discord Creator Channel';
  myTitles['misc'] = 'Misc. Population';
  myTitles['miscactivitynew'] = 'Misc. Activity';
  myTitles['games'] = 'Game Availability';
  myTitles['chromeextensions'] = 'Chrome Extensions';
  myTitles['twitch'] = 'Twitch Creator Channel';
  
  var myURL = "https://jdeslipweb.com/stadiastats/";

  $("#plot-div").html("<center><img src='bounce.gif'><br><br>Plots Not Loading? Try <a href='http://stadiastats.jdeslip.com'>the Non SSL Version</a> while we migrate to our new host.</center>");

  if (myTable) {
    myURL = myURL+"?table="+myTable;
  } else {
    myTable = items[Math.floor(Math.random()*items.length)];
    console.log("Doing a random table "+myTable);
    //myTable="youtube";
    myURL = myURL+"?table="+myTable;
    $('#'+myTable).addClass('active');
  }

  if (myName) {
    myURL = myURL+"&name="+myName;
  }

  console.log(myURL);

  $.ajax({url: myURL,dataType: 'json', cache: false, success: function(result){
    //$("#plot-div").html(result);
    var myArray = new Array();
    var myDivArray = new Array();
    var myDifArray = new Array();
    var myNames = new Array();
    var myUrls = new Array();
    var mySum = 0;
    var mySumH = 0;

    for ( var i = 0 ; i < result.length ; i++ ) {
      if (myNames.includes(result[i]['name'])) {
        //var ts_last = new Date(result[i]['date']).getTime();
        var ts_last = myArray[result[i]['name']][myArray[result[i]['name']].length-1][0];
        var ts = new Date(result[i]['date']).getTime();
        //var value_last = parseInt(result[i]['value']);
        var value_last = myArray[result[i]['name']][myArray[result[i]['name']].length-1][1];
        var value = parseInt(result[i]['value']);
        myArray[result[i]['name']].push(new Array(ts,value));
        if (result[i]['name'] == "Destiny 2 Stadia Daily Users") {
          mySum = mySum + (parseInt(ts-ts_last)/1000/3600/24)*value;
          mySumH = mySumH + (parseInt(ts-ts_last)/1000/3600/24)*value_last;
          console.log("My Sum "+mySum+" "+mySumH);
        }
        var difference = (value-value_last);
        //myDifArray[result[i]['name']].push(new Array(ts,difference));
        var derivative = difference/(parseInt(ts-ts_last)/1000/3600/24);
        myDivArray[result[i]['name']].push(new Array(ts,parseInt(derivative)));
        
        //console.log("lastMondayTS "+lastMondayTS);
        //console.log("startMonthTS "+startMonthTS);
        
        if (myDiv == "week") {
          if (ts < lastMondayTS) {
            if ((parseInt(ts-ts_last)/1000/3600/24) < 7) {
              myDifArray[result[i]['name']].push(new Array(ts,difference));
            } else {
              var weekDifference = derivative * 7;
              myDifArray[result[i]['name']].push(new Array(ts,parseInt(weekDifference)));
            }
          } else {
            console.log("Too new data point "+ts+" ts_last "+lastMondayTS);
            console.log("getDate "+currentDate.getDate()+" getDay "+currentDate.getDay());
          }
        } else if (myDiv == "month") {
          if (ts < startMonthTS) {
            myDifArray[result[i]['name']].push(new Array(ts,difference));
          }
        } else {
          myDifArray[result[i]['name']].push(new Array(ts,difference));
        }
        
        //if (myArray[result[i]['name']].length > 2) {
        //  ts_last = myArray[result[i]['name']][myArray[result[i]['name']].length-3][0];
        //  value_last = myArray[result[i]['name']][myArray[result[i]['name']].length-3][1];
        //  derivative = (value-value_last)/(parseInt(ts-ts_last)/1000/3600/24);
        //  mySmoothDivArray[result[i]['name']].push(new Array(ts,derivative));
        //}
        //console.log('value '+value+' value_last '+value_last+' ts '+ts+' ts-ts_last '+(parseInt(ts-ts_last)/1000/3600/24));
      } else {
        //console.log(result[i]['name']);
        myNames.push(result[i]['name']);
        myUrls.push([result[i]['url'],result[i]['name']]);
        myArray[result[i]['name']] = new Array();
        myDivArray[result[i]['name']] = new Array();
        myDifArray[result[i]['name']] = new Array();
        //mySmoothDivArray[result[i]['name']] = new Array();
        var ts = new Date(result[i]['date']).getTime();
        myArray[result[i]['name']].push(new Array(ts,parseInt(result[i]['value'])));
      }
    }
    
    var myLinksText = '';
    for (var i = 0; i < myUrls.length; i++) {
      if (myUrls[i][0]) {
        myLinksText += "<a href='"+myUrls[i][0]+"'>"+myUrls[i][1]+"</a><br>";
      }
    }
    
    $('#pagelinks').html(myLinksText);

    allSeries=new Array();
   
    for (var i = 0; i < myNames.length; i++) {
      if (myDiv == "true") { 
        allSeries.push({ name: myNames[i], data: myDivArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      } else if (myDiv == "week") { 
        //allSeries.push({ name: myNames[i], data: mySmoothDivArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});allSeries.push({ name: myNames[i], data: mySmoothDivArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
        allSeries.push({ name: myNames[i], data: myDifArray[myNames[i]], marker:{enabled:true, radius:4}, dataGrouping:{enabled:true,approximation:'sum',forced:true,units:[['week',[1]]]},lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      } else if (myDiv == "month") {
        allSeries.push({ name: myNames[i], data: myDifArray[myNames[i]], marker:{enabled:true, radius:4}, dataGrouping:{enabled:true,approximation:'sum',forced:true,units:[['month',[1]]]},lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      } else {
        allSeries.push({ name: myNames[i], data: myArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      }
    }

    //console.log(myArray[myNames[0]]);

    $('#plot-div').highcharts('StockChart',{
            chart : {
              zoomType: 'xy'
            },
            exporting : {
              enabled: true,
            },
            title: {
                text: myTitles[myTable] + ' '+ myMetric +' Over Time',
                x: -20 //center
            },
            xAxis: {
                type: 'datetime',
                title: {
                    text: 'Date'
                },
            },
            rangeSelector:{
                enabled:false,
                selected:0
            },
            tooltip: {
                enabled: true,
                formatter: function () {
                   return '<b>' + this.series.name + '</b><br>' + Highcharts.dateFormat('%Y %m %d',this.x) + '<br>' + this.y;
                },
                snap: 0,
            },
            navigator:{
                enabled:true,
            },
            marginBottom: 100,
            marginRight: 5,
            marginLeft: 5,
            legend: {
                enabled: true,
                floating: false,
                align: "left",
                borderWidth: 0,
                layout: "horizontal",
                maxHeight: 120,
                verticalAlign: "bottom",
            },
            plotOptions: {
             series: {
              events: {
                legendItemClick: function(event) {
                    //console.log('legend item clicked');
                  
                    if (!this.visible) {
                      console.log('this is not visible');
                      return true;
                    }
                                  
                    //console.log('passed if statement');

                    var seriesIndex = this.index;
                    var series = this.chart.series;
                  
                    //console.log('this index is '+String(seriesIndex));
                    //console.log('length is '+String(series.length));
                    
                    for (var i = 0; i < series.length; i++) {
                        if (series[i].index != seriesIndex) {
                          //console.log('Turning off series '+String(series[i].index));
                             if (series[i].visible) {
                               series[i].setVisible(false,false); 
                             } else {
                               series[i].setVisible(true,false);
                             }
                        }
                    }
                    this.chart.redraw();
                    return false;
                }
              }
             }
            },
            yAxis: {
                title: {
                    text: myYAxis
                },
                //min : 0,
                plotLines: [{
                    value: 0,
                    width: 1,
                    color: '#808080'
                }]
            },
            credits: {
              enabled: false
            },
            series: allSeries,
    });



  }}); 
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function sleep100() {
  await sleep(100);
}

var getUrlParameter = function getUrlParameter(sParam) {
    var sPageURL = window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');

        if (sParameterName[0] === sParam) {
            return typeof sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
    return false;
};
