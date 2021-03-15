function setPlot() {
  var myTable = getUrlParameter('table');
  var myName = getUrlParameter('name');

  updatePlot(myTable,myName);
}

function updatePlot(myTable,myName) {

  var myTitles = new Array();
  
  myTitles['youtube'] = 'YouTube Creator Channel';
  myTitles['youtubeplatforms'] = 'YouTube Platform Channel';
  myTitles['twitter'] = 'Twitter Stadia Community Member';
  myTitles['twittterplatforms'] = 'Twitter Platform';
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
  
  var myURL = "http://54.219.108.39/stadiastats.php";

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
    var myNames = new Array();

    for ( var i = 0 ; i < result.length ; i++ ) {
      if (myNames.includes(result[i]['name'])) {
        var ts = new Date(result[i]['date']).getTime();
        myArray[result[i]['name']].push(new Array(ts,parseInt(result[i]['value'])));
      } else {
        //console.log(result[i]['name']);
        myNames.push(result[i]['name']);
        myArray[result[i]['name']] = new Array();
        var ts = new Date(result[i]['date']).getTime();
        myArray[result[i]['name']].push(new Array(ts,parseInt(result[i]['value'])));
      }
    }

    allSeries=new Array();
   
    for (var i = 0; i < myNames.length; i++) {
      allSeries.push({ name: myNames[i], data: myArray[myNames[i]], marker:{enabled:true, radius:4}, lineWidth: 4, showCheckbox: false, stickyTracking: false, type: 'scatter'});
    }

    //console.log(myArray[myNames[0]]);

    $('#plot-div').highcharts('StockChart',{
            chart : {
              zoomType: 'xy'
            },
            title: {
                text: myTitles[myTable] + ' Growth Over Time',
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
                xDateFormat: '%Y-%m-%d',
                dateTimeLabelFormats: {
                  day: "%Y-%m-%e",
                  month: "%Y-%m",
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
