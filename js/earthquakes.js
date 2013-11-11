/* earthquakes.js
    Script file for the INFO 343 Lab 7 Earthquake plotting page

    SODA data source URL: https://soda.demo.socrata.com/resource/earthquakes.json
    app token (pass as '$$app_token' query string param): Hwu90cjqyFghuAWQgannew7Oi
*/

//create a global variable namespace based on usgs.gov
//this is how JavaScript developers keep global variables
//separate from one another when mixing code from different
//sources on the same page
var gov = gov || {};
gov.usgs = gov.usgs || {};

//base data URL--additional filters may be appended (see optional steps)
//the SODA api supports the cross-origin resource sharing HTTP header
//so we should be able to request this URL from any domain via AJAX without
//having to use the JSONP technique
gov.usgs.quakesUrl = 'https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi';

//current earthquake dataset (array of objects, each representing an earthquake)
gov.usgs.quakes;

//reference to our google map
gov.usgs.quakesMap;

gov.usgs.iw;

//AJAX Error event handler
//just alerts the user of the error
$(document).ajaxError(function(event, jqXHR, err) {
    alert('Problem obtaining data: ' + jqXHR.statusText);
});

$(function() {
        getQuakes();
        $(".refresh-button").click(function() {
                var inputVal = $(".min-magnitude").val();
                getQuakes(inputVal);
        });
});

//getQuakes()
//queries the server for the list of recent quakes
//and plots them on a Google map
function getQuakes(minMagnitude) {
        //if minMagnitude was specified, add that as a filter
    var url = gov.usgs.quakesUrl;
    if (minMagnitude) {
        url += '&$where=magnitude>=' + minMagnitude;
    }

        $('.message').html('Loading... <img src="img/loading.gif">');
        $.getJSON(url, function(quakes) {
            //quakes is an array of objects, each of which represents info about a quake
            //see data returned from:
            //https://soda.demo.socrata.com/resource/earthquakes.json?$$app_token=Hwu90cjqyFghuAWQgannew7Oi

            //set our global variable to the current set of quakes
            //so we can reference it later in another event
            if (gov.usgs.quakes) {
                    $.each(gov.usgs.quakes, function() {
                            this.mapMarker.setMap(null);
                    });
                }

            gov.usgs.quakes = quakes;
            $(".message").html("Displaying " + quakes.length + " earthquakes");
            gov.usgs.quakesMap = new google.maps.Map($('.map-container')[0], {
                    center: new google.maps.LatLng(0,0),        //centered on 0/0
                    zoom: 2,                                    //zoom level 2
                    mapTypeId: google.maps.MapTypeId.TERRAIN,   //terrain map
                    streetViewControl: false                    //no street view
                });
                addQuakeMarkers(gov.usgs.quakes, gov.usgs.quakesMap);
        });
}

//addQuakeMarkers()
//parameters
// - quakes (array) array of quake data objects
// - map (google.maps.Map) Google map we can add markers to
// no return value
function addQuakeMarkers(quakes, map) {
    //loop over the quakes array and add a marker for each quake
    var quake;      //current quake data
    var idx;        //loop counter
    var infoWindow; //InfoWindow for quake
    for (idx = 0; idx < quakes.length; idx++) {
        quake = quakes[idx];
        //latitude of current quake = quake.location.latitude 
        //longitutde of current quake = quake.location.longitude

                //assuming that the variable 'quake' is set to 
                //the current quake object within the quakes array...
                if (quake.location) {
                        quake.mapMarker = new google.maps.Marker({
                            map: map,
                            position: new google.maps.LatLng(quake.location.latitude, quake.location.longitude)
                        });
                        infoWindow = new google.maps.InfoWindow({
                            content: new Date(quake.datetime).toLocaleString() + 
                ': magnitude ' + quake.magnitude + ' at depth of ' + 
                quake.depth + ' meters'
                        });
                        registerInfoWindow(map, quake.mapMarker, infoWindow);
                }
    }
}


function registerInfoWindow(map, marker, infoWindow) {
    google.maps.event.addListener(marker, 'click', function() {
                if (gov.usgs.iw) {
                 gov.usgs.iw.close();
        }
                gov.usgs.iw = infoWindow;
        infoWindow.open(map, marker);
    });                
} 