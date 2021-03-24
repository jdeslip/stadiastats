var myTable = "";
var myName = "";
var myDiv = "";
var myMetric = "";

function changeTable(newTable) {
  var nextURL = "";
  if (myName) {
    nextURL = 'https://stadiastats.jdeslip.com?table='+newTable+'&name='+myName+'&derivative='+myDiv;
  } else {
    nextURL = 'https://stadiastats.jdeslip.com?table='+newTable+'&derivative='+myDiv;
  }
  window.location = nextURL;
}

function changeDiv(newDiv) {
  var nextURL = "";
  if (myName) {
    nextURL = 'https://stadiastats.jdeslip.com?table='+myTable+'&name='+myName+'&derivative='+newDiv;
  } else {
    nextURL = 'https://stadiastats.jdeslip.com?table='+myTable+'&derivative='+newDiv;
  }
  window.location = nextURL;  
}

function setPlot() {
  myTable = getUrlParameter('table');
  myName = getUrlParameter('name'); 
  myDiv = getUrlParameter('derivative');
  
  $('#'+myTable).addClass('active');
  
  if (myDiv == "true") {
    $('#derivative').addClass('active');
    myMetric = "Growth Rate";
  } else {
    $('#value').addClass('active');
    myMetric = "Growth";
  }

  updatePlot();
}

function updatePlot() {

  var myTitles = new Array();
  
  myTitles['youtube'] = 'YouTube Creator Channel';
  myTitles['youtubeplatforms'] = 'YouTube Platform Channel';
  myTitles['twitter'] = 'Twitter Stadia Community Member';
  myTitles['twitterplatforms'] = 'Twitter Platform';
  myTitles['reddit'] = 'SubReddit';
  myTitles['facebook'] = 'Facebook Page';
  myTitles['facebookgroups'] = 'Facebook Group';
  myTitles['twittterplatforms'] = 'Twitter Platform';
  myTitles['gplay'] = 'Google Play Review Count';
  myTitles['ios'] = 'iOS Review Count';
  myTitles['leaderboards'] = 'Game Leaderboard'
  myTitles['achievements'] = 'Achievement Leaderboard';
  myTitles['discord'] = 'Discord Channel';
  myTitles['misc'] = 'Miscellaneous';
  myTitles['games'] = 'Game Availability';
  
  var myURL = "https://stats.stadiasource.com/";

  $("#plot-div").html("<center><img src='bounce.gif'><br><br>Plots Not Loading? Try <a href='http://stadiastats.jdeslip.com'>the Non SSL Version</a> while we migrate to our new host.</center>");

  if (myTable) {
    myURL = myURL+"?table="+myTable;
  } else {
    myTable="youtube";
    myURL = myURL+"?table=youtube";
  }

  if (myName) {
    myURL = myURL+"&name="+myName;
  }

  console.log(myURL);

  $.ajax({url: myURL,dataType: 'json', success: function(result){
    //$("#plot-div").html(result);
    var myArray = new Array();
    var myDivArray = new Array();
    var myNames = new Array();

    for ( var i = 0 ; i < result.length ; i++ ) {
      if (myNames.includes(result[i]['name'])) {
        //var ts_last = new Date(result[i]['date']).getTime();
        var ts_last = myArray[result[i]['name']][myArray[result[i]['name']].length-1][0];
        var ts = new Date(result[i]['date']).getTime();
        //var value_last = parseInt(result[i]['value']);
        var value_last = myArray[result[i]['name']][myArray[result[i]['name']].length-1][1];
        var value = parseInt(result[i]['value']);
        myArray[result[i]['name']].push(new Array(ts,value));
        var derivative = (value-value_last)/(parseInt(ts-ts_last)/1000/3600/24);
        myDivArray[result[i]['name']].push(new Array(ts,derivative));
        //console.log('value '+value+' value_last '+value_last+' ts '+ts+' ts-ts_last '+(parseInt(ts-ts_last)/1000/3600/24));
      } else {
        //console.log(result[i]['name']);
        myNames.push(result[i]['name']);
        myArray[result[i]['name']] = new Array();
        myDivArray[result[i]['name']] = new Array();
        var ts = new Date(result[i]['date']).getTime();
        myArray[result[i]['name']].push(new Array(ts,parseInt(result[i]['value'])));
      }
    }

    allSeries=new Array();
   
    for (var i = 0; i < myNames.length; i++) {
      if (myDiv != "true") { 
        allSeries.push({ name: myNames[i], data: myArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      } else {
        allSeries.push({ name: myNames[i], data: myDivArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
      }
    }

    //console.log(myArray[myNames[0]]);

    $('#plot-div').highcharts('StockChart',{
            chart : {
              zoomType: 'xy'
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
                    text: 'Members'
                },
                min : 0,
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
