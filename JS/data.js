//JSONP isn't working in this case. Was told by NYT dev's to make my own proxy. Blerch.

//Add additional functionality later, like pulling out certain news sections, regions of the world, etc.
$.ajax({
      url: 'http://api.nytimes.com/svc/news/v3/content/all/world/48.json?api-key=ab2dad7cc399b957a35c3c2e0218e756%3A14%3A68754846',
      datatype: 'json',
      //jsonp: 'jsonp_callback',
      success: function (datamap){
        console.log(datamap);
       }
});
