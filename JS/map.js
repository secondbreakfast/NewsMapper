//Need to build loops into this. It's just tested with the first result.

$(document).ready(function () {
    init();
});


var i = 0;
var gmapData = {};
var locations = [];
var dataTemp;
var mapElement;
var map;
var infowindow = new google.maps.InfoWindow();

//Pull from other NY Times API's? Or Reuters?
function init() {

    var mapOptions = {
        center: new google.maps.LatLng(0, 0),
        zoom: 3,
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
function pullNews() {
    $.ajax({
        url: 'http://jsonp.jit.su/?url=http://api.nytimes.com/svc/news/v3/content/all/world/.json?api-key=ab2dad7cc399b957a35c3c2e0218e756%3A14%3A68754846',
        datatype: 'json',
        success: function (newsData) {

            for (var i = 0; i < newsData.results.length; i++) {
                try {
                    if (!newsData.results[i].geo_facet[0]) {
                        newsData.results[i].country = "None";
                    } else if (newsData.results[i].geo_facet[0].match(/\((.*)\)/)) {
                        newsData.results[i].country = newsData.results[i].geo_facet[0].match(/\((.*)\)/);
                        newsData.results[i].country = newsData.results[i].country[1];

                    } else {
                        newsData.results[i].country = newsData.results[i].geo_facet[0];
                    }
                } catch (e) {
                    newsData.results[i].country = "None";
                }
            }
            gmapData = newsData;
           forceSync(gmapData);

       }
   });
}

function forceSync(gmapData){
    //console.log(gmapData);
    for (i = 0; i < gmapData.results.length; i++){
        dataTemp = gmapData.results[i];
    //console.log(dataTemp);
    geocode(i, dataTemp);
}
    // console.log(gmapData);

}

function geocode(i, dataTemp) {
   // console.log(dataTemp); 
   var geocoder = new google.maps.Geocoder();
   geocoder.geocode({
    'address': dataTemp.country
}, function (results, status) {
   if (status == google.maps.GeocoderStatus.OK) {
    gmapData.results[i].loc = results[0].geometry.location;
    gmapData.results[i].lat = results[0].geometry.location.lat();
    gmapData.results[i].lon = results[0].geometry.location.lng();
    var marker = new google.maps.Marker({
                position: (results[0].geometry.location),
                map: map
});
google.maps.event.addListener(marker,
                "click", function () {
                    //Having the problem here. 
                    try {                 
                  infowindow.setContent("<a href='" + gmapData.results[i].url + "'><img src='" + gmapData.results[i].multimedia[0].url + "'></a>" + "<h3>" + gmapData.results[i].title + "</h3><br><p>" + gmapData.results[i].published_date + "<br>" + gmapData.results[i].abstract + "<br>" + "<a href='" + gmapData.results[i].url + "'>Read the article</a>");
                  } catch (a) {
                     infowindow.setContent("<h3>" + gmapData.results[i].title + "</h3><br><p>" + gmapData.results[i].published_date + "<br>" + gmapData.results[i].abstract + "<br><a href='" + gmapData.results[i].url + "'>Read the article</a>");
                  }
                infowindow.open(map, marker);
                            });
/*        var marker = new google.maps.Marker({
                position: (gmapData.results[i].lat, gmapData.results[i].lon),
                map: map
});
        google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker)
});


    //console.log(gmapData.results[i].lat);
   //console.log(gmapData.results[i].lon);*/
} 
});

//plotMap (map, mapElement, gmapData);

}
   
/*
function plotMap (map, mapElement, gmapData){
    console.log(gmapData.results[0].lat);
        var marker = new google.maps.Marker({
                position: (gmapData.results[0].lat, gmapData.results[0].lon),
                map: map
});
        google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map,marker)
});

}
*/
