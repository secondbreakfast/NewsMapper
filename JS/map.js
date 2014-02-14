//Would like it to pull more API's and add filtering w/localstorage if I have time. Right now, not many valid data points appear. 

$(document).ready(function () {
    init();
});


//Declaring lots of global variables because of Google Maps and its rigorous use of certain functions for mapping.

var i = 0;
var gmapData = {};
var newsSource = [];
var topicRegion = [];
var dataTemp;
var mapElement;
var map;
var infowindow = new google.maps.InfoWindow();


//Starts the map, with lots of map styling. 
function init() {

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 2,
        zoomControl: true,
        zoomControlOptions: {
            style: google.maps.ZoomControlStyle.DEFAULT,
        },
        disableDoubleClickZoom: true,
        mapTypeControl: true,
        mapTypeControlOptions: {
            style: google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        },
        scaleControl: true,
        scrollwheel: true,
        streetViewControl: true,
        draggable: true,
        overviewMapControl: true,
        overviewMapControlOptions: {
            opened: false,
        },
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: [{
            'featureType': 'water',
            'stylers': [{
                'color': '#021019'
            }]
        }, {
            'featureType': 'landscape',
            'stylers': [{
                'color': '#08304b'
            }]
        }, {
            'featureType': 'poi',
            'elementType': 'geometry',
            'stylers': [{
                'color': '#0c4152'
            }, {
                'lightness': 5
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#000000'
            }]
        }, {
            'featureType': 'road.highway',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#0b434f'
            }, {
                'lightness': 25
            }]
        }, {
            'featureType': 'road.arterial',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#000000'
            }]
        }, {
            'featureType': 'road.arterial',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#0b3d51'
            }, {
                'lightness': 16
            }]
        }, {
            'featureType': 'road.local',
            'elementType': 'geometry',
            'stylers': [{
                'color': '#000000'
            }]
        }, {
            'elementType': 'labels.text.fill',
            'stylers': [{
                'color': '#ffffff'
            }]
        }, {
            'elementType': 'labels.text.stroke',
            'stylers': [{
                'color': '#000000'
            }, {
                'lightness': 13
            }]
        }, {
            'featureType': 'transit',
            'stylers': [{
                'color': '#146474'
            }]
        }, {
            'featureType': 'administrative',
            'elementType': 'geometry.fill',
            'stylers': [{
                'color': '#000000'
            }]
        }, {
            'featureType': 'administrative',
            'elementType': 'geometry.stroke',
            'stylers': [{
                'color': '#144b53'
            }, {
                'lightness': 14
            }, {
                'weight': 1.4
            }]
        }],

    };

    mapElement = document.getElementById('map');
    map = new google.maps.Map(mapElement, mapOptions);

pullNews();

}

//API call to the New York Times.
function pullNews() {
    $.ajax({
        url: 'http://jsonp.jit.su/?url=http://api.nytimes.com/svc/news/v3/content/all/world/.json?api-key=ab2dad7cc399b957a35c3c2e0218e756%3A14%3A68754846',
        datatype: 'json',
        success: function (newsData) {
            //console.log(newsData);
/*           
    DEFINITIONS:
    newsData.results : Each news item returned. 
    newsData.results.geo_facet : Geographic tag included w/API. 
    newsData.results.country : New key-value that stores cleaned up country data. 

    Issue: Data could not be used as-is. Inconsistent tags and formats produced errors. 
    Resolution: If AJAX call sucessful, a new key-value (country) is added to result.  

    NOTES: 
    1) Attribute called Geo_Facet often had multiple values. Index 0 was chosen for simplicity in processing. 
    2) Geo_Facet tag is not formatted consistently. Sometimes refers to city, country, landmark, or combination of all.  

    */ 
            for (var i = 0; i < newsData.results.length; i++) {
                                try {
                    //If no geo tags, set country to null.
                    if (!newsData.results[i].geo_facet[0]) {
                        newsData.results[i].country = null;
                    //Some country info is in parentheses. Used regex to pull country name from tag. 
                    } else if (newsData.results[i].geo_facet[0].match(/\((.*)\)/)) {
                        newsData.results[i].country = newsData.results[i].geo_facet[0].match(/\((.*)\)/);
                        newsData.results[i].country = newsData.results[i].country[1];
                    //Someimes it's all good. If not empty or not with parentheses, just add the tag to country. 
                    } else {
                        newsData.results[i].country = newsData.results[i].geo_facet[0];
                    }
                    //If error, set country to null.
                } catch (e) {
                    newsData.results[i].country = null;
                }
            }
            //Sets news data to global variable. Not the best thing to do, but I had to get it to work. 
            gmapData = newsData;

            //Run next function, which is a workaround to asynchronous Goog functions. 
           forceSync(gmapData);

       }
   });
}

/*
This loop passes each result into the geocode function individually, which allows for custom infowidows. Each item at index i is passed into a temporary variable for geocoding.  

*/

function forceSync(gmapData){

    for (i = 0; i < gmapData.results.length; i++){
        dataTemp = gmapData.results[i];

    geocode(i, dataTemp);
}
}

/*
The bane of my existence for the past week. 
*/

function geocode(i, dataTemp) {

   var geocoder = new google.maps.Geocoder();
   geocoder.geocode({
    'address': dataTemp.country
}, function (results, status) {
   if (status == google.maps.GeocoderStatus.OK) {
    gmapData.results[i].loc = results[0].geometry.location;
    //gmapData.results[i].lat = results[0].geometry.location.lat();
    //gmapData.results[i].lon = results[0].geometry.location.lng();
    var marker = new google.maps.Marker({
                position: (results[0].geometry.location),
                map: map,
                icon: "https://s3-us-west-2.amazonaws.com/awesomez/marker_icon.png"
});
google.maps.event.addListener(marker,
                "click", function () {
 
                    try {                 
                  infowindow.setContent("<div class='infoWindow'><a href='" + gmapData.results[i].url + "'><img src='" + gmapData.results[i].multimedia[0].url + "'></a>" + "<h4>" + gmapData.results[i].title + "</h4><br><p>" + gmapData.results[i].published_date + "<br>" + gmapData.results[i].abstract + "<br>" + "<a href='" + gmapData.results[i].url + "'>Read the article</a></div>");
                  } catch (a) {
                     infowindow.setContent("<div class='infoWindow'><h4>" + gmapData.results[i].title + "</h4><br><p>" + gmapData.results[i].published_date + "<br>" + gmapData.results[i].abstract + "<br><a href='" + gmapData.results[i].url + "'>Read the article</a></div>");
                  }
                infowindow.open(map, marker);
                            });

} 
});

}

//jQuery for page scrolling feature - requires jQuery Easing plugin
$(function() {
    $('.page-scroll a').bind('click', function(event) {
        var $anchor = $(this);
        $('html, body').stop().animate({
            scrollTop: $($anchor.attr('href')).offset().top
        }, 1500, 'easeInOutExpo');
        event.preventDefault();
    });
});