//Need to build loops into this. It's just tested with the first result.

//Infowindow works, but doesn't produce content. 

$(document).ready(function () {
    pullNews();
});

//Pull from other NY Times API's? Or Reuters?

function pullNews() {
    $.ajax({
        url: 'http://jsonp.jit.su/?url=http://api.nytimes.com/svc/news/v3/content/all/world/.json?api-key=ab2dad7cc399b957a35c3c2e0218e756%3A14%3A68754846',
        datatype: 'json',
        success: function (newsData) {
            console.log(newsData);
            //console.log(newsData.results[0].geo_facet[0]);
            // console.log(newsData);
            for (var i = 0; i < newsData.results.length; i++) {
                try {
                    if (!newsData.results[i].geo_facet[0]) {
                        newsData.results[i].country = "None";
                    } else if (newsData.results[i].geo_facet[0].match(/\((.*)\)/)) {
                        //console.log(newsData.results[i].geo_facet[0].match(/\((.*)\)/));
                        newsData.results[i].country = newsData.results[i].geo_facet[0].match(/\((.*)\)/);
                        newsData.results[i].country = newsData.results[i].country[1];

                    } else {
                        newsData.results[i].country = newsData.results[i].geo_facet[0];
                    }
                    //console.log(newsData.results[i].country);
                } catch (e) {
                    newsData.results[i].country = "None";
                }
            }

            init(newsData);
        }
    });
}

function init(newsData) {

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
    var mapElement = document.getElementById('map');
    var map = new google.maps.Map(mapElement, mapOptions);

    for (i = 0; i < newsData.results.length; i++) {
        geocoder = new google.maps.Geocoder();
        geocoder.geocode({
            'address': newsData.results[i].country
        }, function (results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
                var marker = new google.maps.Marker({
                    map: map,
                    position: results[0].geometry.location
                });
                try {
                    var infoWindow = new google.maps.InfoWindow({
                        content: "<a href='" + newsData.results[i].url + "'><img src='" + newsData.results[i].multimedia[0].url + "'></a>" + "<h3>" + newsData.results[i].title + "</h3><br><p>" + newsData.results[i].published_date + "<br>" + newsData.results[i].abstract + "<br>" + "<a href='" + newsData.results[i].url + "'>Read the article</a>"
                    });
                    
                } catch (e) {
                    var infoWindow = new google.maps.InfoWindow({
                      content: "<h3>" + newsData.results[i].title + "</h3><br><p>" + newsData.results[i].published_date + "<br>" + newsData.results[i].abstract + "<br><a href='" + newsData.results[i].url + "'>Read the article</a>"  
                    });
                }
                google.maps.event.addListener(marker, 'click', function () {
                    infoWindow.open(map, marker);
                });

            }

        });
    }
}